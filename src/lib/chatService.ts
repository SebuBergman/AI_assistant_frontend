// lib/chatService.ts
import { Chat, Message, Reference, TokenCounts } from '@/app/types';
import { pool, getRedis, CACHE_KEYS, CACHE_TTL } from './db';

export class ChatService {
  /**
   * Create a new chat
   * Generates a smart title from the first user message via FastAPI
   */
  static async createChat(userId: string, firstMessage: string): Promise<Chat> {
    const client = await pool.connect();
    const redis = getRedis();

    try {
      await client.query("BEGIN");

      // Generate a quick fallback title first
      const fallbackTitle = this.generateFallbackTitle(firstMessage);

      // Insert chat with fallback title
      const chatResult = await client.query(
        "INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *",
        [userId, fallbackTitle]
      );

      const chat = this.mapRowToChat(chatResult.rows[0]);

      // Add first message
      await client.query(
        "INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)",
        [chat.id, "user", firstMessage]
      );

      await client.query("COMMIT");

      // Invalidate cache
      await redis.del(CACHE_KEYS.userChats(userId));

      // Generate better title via FastAPI (don't await - fire and forget)
      this.generateAndUpdateTitle(chat.id, firstMessage, userId).catch(
        console.error
      );

      return chat;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate a smart title using FastAPI and update the chat
   */
  private static async generateAndUpdateTitle(
    chatId: string,
    message: string,
    userId: string
  ): Promise<void> {
    try {
      // Call your FastAPI backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/title`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          chat_id: chatId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const title = data.title;

      // Validate title
      if (!title || title.length > 100) {
        console.warn("Generated title invalid, keeping fallback");
        return;
      }

      // Update chat with generated title
      const client = await pool.connect();
      const redis = getRedis();

      try {
        await client.query("UPDATE chats SET title = $1 WHERE id = $2", [
          title,
          chatId,
        ]);

        // Invalidate cache so sidebar shows new title
        await redis.del(CACHE_KEYS.userChats(userId));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Failed to generate/update chat title:", error);
      // Fail silently - fallback title is already in place
    }
  }

  /**
   * Generate a fallback title from the message
   */
  private static generateFallbackTitle(message: string): string {
    let title = message.trim().replace(/\s+/g, " ");

    // Try to get first sentence
    const firstSentence = title.match(/^[^.!?]+[.!?]/)?.[0] || title;
    title = firstSentence.length < title.length ? firstSentence : title;

    // Truncate to 60 characters
    if (title.length > 60) {
      title = title.substring(0, 57) + "...";
    }

    return title;
  }

  /**
   * Get all chats for a user (with caching)
   */
  static async getUserChats(userId: string): Promise<Chat[]> {
    const redis = getRedis();
    const cacheKey = CACHE_KEYS.userChats(userId);

    // Try cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Redis error:", error);
    }

    // Query database
    const result = await pool.query(
      "SELECT * FROM chats WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 50",
      [userId]
    );

    const chats = result.rows.map(this.mapRowToChat);

    // Cache the result
    try {
      await redis.setex(cacheKey, CACHE_TTL.chats, JSON.stringify(chats));
    } catch (error) {
      console.error("Redis cache error:", error);
    }

    return chats;
  }

  /**
   * Get chat by ID
   */
  static async getChatById(
    chatId: string,
    userId: string
  ): Promise<Chat | null> {
    const redis = getRedis();
    const cacheKey = CACHE_KEYS.chatMeta(chatId);

    // Try cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Redis error:", error);
    }

    // Query database
    const result = await pool.query(
      "SELECT * FROM chats WHERE id = $1 AND user_id = $2",
      [chatId, userId]
    );

    if (result.rows.length === 0) return null;

    const chat = this.mapRowToChat(result.rows[0]);

    // Cache
    try {
      await redis.setex(cacheKey, CACHE_TTL.chats, JSON.stringify(chat));
    } catch (error) {
      console.error("Redis cache error:", error);
    }

    return chat;
  }

  /**
   * Get all messages for a chat (with caching)
   */
  static async getChatMessages(chatId: string): Promise<Message[]> {
    const redis = getRedis();
    const cacheKey = CACHE_KEYS.chatMessages(chatId);
    
    // Try cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error("Redis error:", error);
    }

    // Query database
    const result = await pool.query(
      "SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC",
      [chatId]
    );

    const messages = result.rows.map(this.mapRowToMessage);

    // Cache
    try {
      await redis.setex(cacheKey, CACHE_TTL.messages, JSON.stringify(messages));
    } catch (error) {
      console.error("Redis cache error:", error);
    }


    return messages;
  }

  /**
   * Add a message to a chat
   */
  static async addMessage(
    chatId: string,
    role: string,
    content: string,
    references?: Reference[],
    tokenCounts?: TokenCounts,
  ): Promise<Message> {
    const client = await pool.connect();
    const redis = getRedis();

    try {
      await client.query("BEGIN");

      // Insert message with references
      const result = await client.query(
        "INSERT INTO messages (chat_id, role, content, rag_references, token_counts) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          chatId, 
          role, 
          content, 
          references ? JSON.stringify(references) : null,
          tokenCounts ? JSON.stringify(tokenCounts) : null
        ]
      );

      // Update chat timestamp
      await client.query("UPDATE chats SET updated_at = NOW() WHERE id = $1", [
        chatId,
      ]);

      await client.query("COMMIT");

      const message = this.mapRowToMessage(result.rows[0]);

      // Invalidate caches
      await redis.del(CACHE_KEYS.chatMessages(chatId));
      await redis.del(CACHE_KEYS.chatMeta(chatId));

      return message;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a chat
   */
  static async deleteChat(chatId: string, userId: string): Promise<boolean> {
    const redis = getRedis();

    const result = await pool.query(
      "DELETE FROM chats WHERE id = $1 AND user_id = $2",
      [chatId, userId]
    );

    // Clear caches
    await redis.del(CACHE_KEYS.chatMessages(chatId));
    await redis.del(CACHE_KEYS.chatMeta(chatId));
    await redis.del(CACHE_KEYS.userChats(userId));

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Delete all chats for a user
   */
  static async deleteAllChats(userId: string): Promise<number> {
    const redis = getRedis();

    // First, get all chat IDs for the user to clear their caches
    const chatsResult = await pool.query(
      "SELECT id FROM chats WHERE user_id = $1",
      [userId]
    );

    // Delete all chats from database
    const result = await pool.query(
      "DELETE FROM chats WHERE user_id = $1",
      [userId]
    );

    // Clear caches for each chat
    const cachePromises = chatsResult.rows.flatMap((chat) => [
      redis.del(CACHE_KEYS.chatMessages(chat.id)),
      redis.del(CACHE_KEYS.chatMeta(chat.id))
    ]);
    
    // Clear user's chat list cache
    cachePromises.push(redis.del(CACHE_KEYS.userChats(userId)));
    
    await Promise.all(cachePromises);

    return result.rowCount || 0;
  }

  /**
   * Update chat title
   */
  static async updateChatTitle(
    chatId: string,
    userId: string,
    title: string
  ): Promise<boolean> {
    const redis = getRedis();

    const result = await pool.query(
      "UPDATE chats SET title = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3",
      [title, chatId, userId]
    );

    // Clear caches
    await redis.del(CACHE_KEYS.chatMeta(chatId));
    await redis.del(CACHE_KEYS.userChats(userId));

    return result.rowCount !== null && result.rowCount > 0;
  }

  // Helper methods to map database rows to TypeScript objects
  private static mapRowToChat(row: {
    id: string;
    user_id: string;
    title: string;
    created_at: string | number | Date;
    updated_at: string | number | Date;
  }): Chat {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private static mapRowToMessage(row: {
    id: string;
    chat_id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string | number | Date;
    rag_references?: any;
    token_counts?: any;
  }): Message {
    return {
      id: row.id,
      chatId: row.chat_id,
      role: row.role,
      content: row.content,
      createdAt: new Date(row.created_at),
      rag_references: row.rag_references && Array.isArray(row.rag_references)
        ? row.rag_references as Reference[]
        : undefined,
      tokenCounts: row.token_counts && typeof row.token_counts === 'object' && !Array.isArray(row.token_counts)
        ? row.token_counts as TokenCounts
        : undefined,
    };
  }

  static async testConnection() {
    try {
      const result = await pool.query("SELECT NOW()");
      console.log("Database connected:", result.rows[0]);
      return true;
    } catch (error) {
      console.error("Database connection error:", error);
      return false;
    }
  }
}
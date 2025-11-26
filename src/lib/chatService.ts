// lib/chatService.ts
import { pool, getRedis, CACHE_KEYS, CACHE_TTL } from './db';

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export class ChatService {
  /**
   * Create a new chat
   * Generates a title from the first user message
   */
  static async createChat(userId: string, firstMessage: string): Promise<Chat> {
    const client = await pool.connect();
    const redis = getRedis();

    try {
      await client.query("BEGIN");

      // Generate title from first message (truncate to 100 chars)
      const title =
        firstMessage.slice(0, 100) + (firstMessage.length > 100 ? "..." : "");

      // Insert chat
      const chatResult = await client.query(
        "INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *",
        [userId, title]
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

      return chat;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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
    role: "user" | "assistant",
    content: string
  ): Promise<Message> {
    const client = await pool.connect();
    const redis = getRedis();

    try {
      await client.query("BEGIN");

      // Insert message
      const result = await client.query(
        "INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING *",
        [chatId, role, content]
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
  }): Message {
    return {
      id: row.id,
      chatId: row.chat_id,
      role: row.role,
      content: row.content,
      createdAt: new Date(row.created_at),
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
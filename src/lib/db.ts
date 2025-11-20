import { Pool } from 'pg';
import Redis from 'ioredis';

// PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis client for caching
let redis: Redis | null = null;

export const getRedis = () => {
  if (!redis) {
    redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: "default",
    password: process.env.REDIS_PASSWORD,
    tls: {},  // required for Redis Cloud
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null;
      return Math.min(times * 50, 2000);
    },
  });

    // Optional: debug logs
    redis.on("connect", () => console.log("CONNECTED"));
    redis.on("ready", () => console.log("READY"));
    redis.on("error", (e) => console.error("ERROR:", e));
  }
  return redis;
};

// Cache keys
export const CACHE_KEYS = {
  userChats: (userId: string) => `user:${userId}:chats`,
  chatMessages: (chatId: string) => `chat:${chatId}:messages`,
  chatMeta: (chatId: string) => `chat:${chatId}:meta`,
}

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  chats: 3600, // 1 hour
  messages: 7200, // 2 hours
}
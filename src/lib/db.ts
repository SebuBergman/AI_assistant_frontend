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

// Verify connection on startup
pool.on('connect', () => {
  console.log('✅ Supabase/PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Optional: Test connection immediately
/*
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connection verified'))
  .catch((err) => console.error('❌ Database connection failed:', err.message));
*/

// Redis client for caching
let redis: Redis | null = null;

export const getRedis = () => {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: "default", // Redis Cloud username
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      },
    });

    redis.on("connect", () => console.log("✅ Redis CONNECTED successfully"));
    redis.on("ready", () => console.log("✅ Redis READY - Connection fully established"));
    redis.on("error", (err) => console.error("❌ Redis ERROR:", err));
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
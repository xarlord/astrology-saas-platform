/**
 * Redis Service
 *
 * Centralized Redis client with graceful fallback to in-memory caching
 * when Redis is unavailable (development without Docker).
 */

import Redis from 'ioredis';
import config from '../../../config';
import logger from '../../../utils/logger';

let redisClient: Redis | null = null;
let isConnected = false;

/**
 * Get or create the Redis client singleton.
 * Falls back gracefully if Redis is unreachable.
 */
export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          logger.warn('[Redis] Max retries reached, giving up');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on('connect', () => {
      isConnected = true;
      logger.info('[Redis] Connected');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      logger.warn(`[Redis] Error: ${err.message}`);
    });

    redisClient.on('close', () => {
      isConnected = false;
      logger.info('[Redis] Connection closed');
    });
  } catch (err) {
    logger.warn(`[Redis] Failed to create client: ${err instanceof Error ? err.message : err}`);
    redisClient = null;
  }

  return redisClient;
}

/**
 * Connect to Redis. Safe to call multiple times.
 */
export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.ping();
    logger.info('[Redis] PING OK');
  } catch (err) {
    logger.warn(`[Redis] PING failed: ${err instanceof Error ? err.message : err}. Running in fallback mode.`);
  }
}

/**
 * Check if Redis is currently connected
 */
export function isRedisConnected(): boolean {
  return isConnected;
}

/**
 * Get Redis instance — throws if not connected (for codepaths that require Redis).
 */
export function requireRedis(): Redis {
  const client = getRedisClient();
  if (!client || !isConnected) {
    throw new Error('Redis is not available');
  }
  return client;
}

/**
 * Disconnect Redis gracefully (for shutdown).
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    isConnected = false;
    logger.info('[Redis] Disconnected');
  }
}

/**
 * Redis-backed cache with in-memory fallback.
 * Use this for any cache that should prefer Redis but degrade gracefully.
 */
export class RedisCache {
  private fallback = new Map<string, { data: string; expiresAt: number }>();
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = `${this.prefix}${key}`;

    // Try Redis first
    const client = getRedisClient();
    if (client && isConnected) {
      try {
        const raw = await client.get(fullKey);
        if (raw !== null) {
          return JSON.parse(raw) as T;
        }
        return null;
      } catch (err) {
        logger.debug(`[RedisCache] GET error for ${fullKey}: ${err instanceof Error ? err.message : err}`);
      }
    }

    // Fallback to in-memory
    const entry = this.fallback.get(fullKey);
    if (entry) {
      if (entry.expiresAt > Date.now()) {
        return JSON.parse(entry.data) as T;
      }
      this.fallback.delete(fullKey);
    }
    return null;
  }

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    const serialized = JSON.stringify(data);

    // Try Redis first
    const client = getRedisClient();
    if (client && isConnected) {
      try {
        await client.set(fullKey, serialized, 'EX', ttlSeconds);
        return;
      } catch (err) {
        logger.debug(`[RedisCache] SET error for ${fullKey}: ${err instanceof Error ? err.message : err}`);
      }
    }

    // Fallback to in-memory
    this.fallback.set(fullKey, {
      data: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<boolean> {
    const fullKey = `${this.prefix}${key}`;

    const client = getRedisClient();
    if (client && isConnected) {
      try {
        const result = await client.del(fullKey);
        return result > 0;
      } catch {
        // fall through to in-memory
      }
    }

    return this.fallback.delete(fullKey);
  }

  async deleteByPrefix(prefix: string): Promise<number> {
    const fullPrefix = `${this.prefix}${prefix}`;
    let count = 0;

    const client = getRedisClient();
    if (client && isConnected) {
      try {
        const keys = await client.keys(`${fullPrefix}*`);
        if (keys.length > 0) {
          count = await client.del(...keys);
        }
      } catch {
        // fall through
      }
    }

    // Also clean fallback
    for (const key of Array.from(this.fallback.keys())) {
      if (key.startsWith(fullPrefix)) {
        this.fallback.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Publish a message to a Redis channel (no-op in fallback).
   */
  async publish(channel: string, message: string): Promise<number> {
    const client = getRedisClient();
    if (client && isConnected) {
      try {
        return await client.publish(channel, message);
      } catch {
        return 0;
      }
    }
    return 0;
  }

  /**
   * Subscribe to a Redis channel (no-op in fallback).
   */
  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    const client = getRedisClient();
    if (client && isConnected) {
      try {
        // Create a dedicated subscriber client
        const subscriber = client.duplicate();
        await subscriber.subscribe(channel);
        subscriber.on('message', (_ch: string, msg: string) => {
          if (_ch === channel) callback(msg);
        });
      } catch {
        logger.debug(`[RedisCache] Subscribe failed for ${channel}`);
      }
    }
  }

  /**
   * Clean up expired fallback entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of Array.from(this.fallback.entries())) {
      if (entry.expiresAt <= now) {
        this.fallback.delete(key);
        cleaned++;
      }
    }
    return cleaned;
  }
}

export default {
  getRedisClient,
  connectRedis,
  disconnectRedis,
  isRedisConnected,
  requireRedis,
  RedisCache,
};

import type { ClientRateLimitInfo, IncrementResponse, Store } from 'express-rate-limit';

interface RedisRateLimitClient {
  eval(script: string, numberOfKeys: number, ...args: Array<string | number>): Promise<unknown>;
  get(key: string): Promise<string | null>;
  del(...keys: string[]): Promise<number>;
}

interface MonthlyRateLimitStoreOptions {
  client: () => RedisRateLimitClient | Promise<RedisRateLimitClient>;
  now?: () => Date;
  prefix?: string;
}

const INCREMENT_SCRIPT = `
local total = redis.call('INCR', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIREAT', KEYS[1], ARGV[1])
end
return total
`;

const DECREMENT_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if not current or tonumber(current) <= 0 then
  return 0
end
return redis.call('DECR', KEYS[1])
`;

/**
 * Distributed calendar-month rate-limit store.
 *
 * Redis owns the shared counter and absolute expiry, so long windows do not
 * create Node timers and limits remain consistent across backend instances.
 */
export class MonthlyRateLimitStore implements Store {
  readonly localKeys = false;
  readonly prefix: string;

  private readonly client: () => RedisRateLimitClient | Promise<RedisRateLimitClient>;
  private readonly now: () => Date;

  constructor(options: MonthlyRateLimitStoreOptions) {
    this.client = options.client;
    this.now = options.now ?? (() => new Date());
    this.prefix = options.prefix ?? 'monthly-report-rate-limit:';
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const boundary = this.boundary();
    const client = await this.client();
    const value = await client.get(this.redisKey(key, boundary.bucket));
    if (value === null) return undefined;

    return {
      totalHits: this.parseCounter(value),
      resetTime: boundary.resetTime,
    };
  }

  async increment(key: string): Promise<IncrementResponse> {
    const boundary = this.boundary();
    const client = await this.client();
    const value = await client.eval(
      INCREMENT_SCRIPT,
      1,
      this.redisKey(key, boundary.bucket),
      boundary.resetTime.getTime(),
    );

    return {
      totalHits: this.parseCounter(value, true),
      resetTime: boundary.resetTime,
    };
  }

  async decrement(key: string): Promise<void> {
    const boundary = this.boundary();
    const client = await this.client();
    await client.eval(
      DECREMENT_SCRIPT,
      1,
      this.redisKey(key, boundary.bucket),
    );
  }

  async resetKey(key: string): Promise<void> {
    const boundary = this.boundary();
    const client = await this.client();
    await client.del(this.redisKey(key, boundary.bucket));
  }

  private boundary(): { bucket: string; resetTime: Date } {
    const current = this.now();
    const year = current.getUTCFullYear();
    const month = current.getUTCMonth();
    const bucket = `${year}-${String(month + 1).padStart(2, '0')}`;
    const resetTime = new Date(Date.UTC(year, month + 1, 1));
    return { bucket, resetTime };
  }

  private redisKey(key: string, bucket: string): string {
    return `${this.prefix}${bucket}:${key}`;
  }

  private parseCounter(value: unknown, requirePositive = false): number {
    const count = typeof value === 'number' ? value : Number(value);
    const minimum = requirePositive ? 1 : 0;
    if (!Number.isSafeInteger(count) || count < minimum) {
      throw new Error('Redis returned an invalid counter for the monthly report rate limit');
    }
    return count;
  }
}

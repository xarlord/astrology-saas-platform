import { describe, expect, it, jest } from '@jest/globals';
import express, { type ErrorRequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import request from 'supertest';
import { MonthlyRateLimitStore } from '../../middleware/monthlyRateLimitStore';

interface MockRedisClient {
  eval: jest.Mock;
  get: jest.Mock;
  del: jest.Mock;
}

function createClient(): MockRedisClient {
  return {
    eval: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };
}

const NOW = new Date('2026-09-15T12:00:00.000Z');
const NEXT_MONTH = new Date('2026-10-01T00:00:00.000Z');

describe('MonthlyRateLimitStore', () => {
  it('atomically increments a UTC calendar-month key and expires it at the next month', async () => {
    const client = createClient();
    client.eval.mockResolvedValue(1);
    const store = new MonthlyRateLimitStore({
      client: () => client,
      now: () => NOW,
      prefix: 'test:',
    });

    await expect(store.increment('monthly_report:user-1')).resolves.toEqual({
      totalHits: 1,
      resetTime: NEXT_MONTH,
    });
    expect(client.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('INCR', KEYS[1])"),
      1,
      'test:2026-09:monthly_report:user-1',
      NEXT_MONTH.getTime(),
    );
  });

  it('returns the shared Redis count for enforcement across application instances', async () => {
    const client = createClient();
    client.eval.mockResolvedValue('11');
    const store = new MonthlyRateLimitStore({ client: () => client, now: () => NOW });

    const result = await store.increment('monthly_report:user-1');

    expect(result.totalHits).toBe(11);
  });

  it('reads an existing counter and reports the calendar reset time', async () => {
    const client = createClient();
    client.get.mockResolvedValue('7');
    const store = new MonthlyRateLimitStore({ client: () => client, now: () => NOW });

    await expect(store.get('monthly_report:user-1')).resolves.toEqual({
      totalHits: 7,
      resetTime: NEXT_MONTH,
    });
  });

  it('returns undefined when a counter does not exist', async () => {
    const client = createClient();
    client.get.mockResolvedValue(null);
    const store = new MonthlyRateLimitStore({ client: () => client, now: () => NOW });

    await expect(store.get('monthly_report:user-1')).resolves.toBeUndefined();
  });

  it('decrements atomically without allowing a negative counter', async () => {
    const client = createClient();
    client.eval.mockResolvedValue(0);
    const store = new MonthlyRateLimitStore({ client: () => client, now: () => NOW });

    await store.decrement('monthly_report:user-1');

    expect(client.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('DECR', KEYS[1])"),
      1,
      'monthly-report-rate-limit:2026-09:monthly_report:user-1',
    );
  });

  it('resets only the current calendar-month counter for a key', async () => {
    const client = createClient();
    client.del.mockResolvedValue(1);
    const store = new MonthlyRateLimitStore({ client: () => client, now: () => NOW });

    await store.resetKey('monthly_report:user-1');

    expect(client.del).toHaveBeenCalledWith(
      'monthly-report-rate-limit:2026-09:monthly_report:user-1',
    );
  });

  it('uses UTC boundaries at the December-to-January rollover', async () => {
    const client = createClient();
    client.eval.mockResolvedValue(1);
    const december = new Date('2026-12-31T23:59:59.999Z');
    const store = new MonthlyRateLimitStore({ client: () => client, now: () => december });

    const result = await store.increment('user-1');

    expect(result.resetTime).toEqual(new Date('2027-01-01T00:00:00.000Z'));
    expect(client.eval).toHaveBeenCalledWith(
      expect.any(String),
      1,
      'monthly-report-rate-limit:2026-12:user-1',
      Date.parse('2027-01-01T00:00:00.000Z'),
    );
  });

  it('rejects malformed Redis counter responses instead of failing open', async () => {
    const client = createClient();
    client.eval.mockResolvedValue(null);
    const store = new MonthlyRateLimitStore({ client: () => client, now: () => NOW });

    await expect(store.increment('user-1')).rejects.toThrow('invalid counter');
  });

  it('fails closed when the shared Redis client is unavailable', async () => {
    const store = new MonthlyRateLimitStore({
      client: async () => Promise.reject(new Error('Redis is not available')),
      now: () => NOW,
    });

    await expect(store.increment('user-1')).rejects.toThrow('Redis is not available');
  });

  it('shares atomic counters across store instances and concurrent increments', async () => {
    const counts = new Map<string, number>();
    const expiries = new Map<string, number>();
    const evalCommand = jest.fn(
      async (_script: string, _numberOfKeys: number, key: string, expiresAt: number) => {
        const next = (counts.get(key) ?? 0) + 1;
        counts.set(key, next);
        if (!expiries.has(key)) expiries.set(key, expiresAt);
        return next;
      },
    );
    const sharedClient = { ...createClient(), eval: evalCommand };
    const now = () => new Date('2026-06-15T00:00:00.000Z');
    const storeA = new MonthlyRateLimitStore({ client: () => sharedClient, now });
    const storeB = new MonthlyRateLimitStore({ client: () => sharedClient, now });

    const results = await Promise.all(
      Array.from({ length: 50 }, (_, index) =>
        (index % 2 === 0 ? storeA : storeB).increment('shared-user'),
      ),
    );

    expect(results.map(({ totalHits }) => totalHits).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 50 }, (_, index) => index + 1),
    );
    expect(counts.get('monthly-report-rate-limit:2026-06:shared-user')).toBe(50);
    expect(expiries.get('monthly-report-rate-limit:2026-06:shared-user')).toBe(
      Date.parse('2026-07-01T00:00:00.000Z'),
    );
  });

  it('prevents the protected handler from running when Redis is unavailable', async () => {
    const store = new MonthlyRateLimitStore({
      client: async () => Promise.reject(new Error('Redis unavailable')),
    });
    const limiter = rateLimit({ windowMs: 60_000, limit: 1, store, validate: false });
    const protectedHandler = jest.fn((_request, response) => response.sendStatus(204));
    const app = express();
    app.get('/protected', limiter, protectedHandler);
    const errorHandler: ErrorRequestHandler = (_error, _request, response, _next) => {
      response.status(503).json({ success: false });
    };
    app.use(errorHandler);

    const response = await request(app).get('/protected');

    expect(response.status).toBe(503);
    expect(protectedHandler).not.toHaveBeenCalled();
  });
});

     1|/**
     2| * Test Setup File
     3| * Configures test environment, mocks, and global test utilities
     4| */
     5|
     6|// Set test environment variables
     7|process.env.NODE_ENV = 'test';
     8|process.env.PORT = '3001';
     9|process.env.DATABASE_URL = 'postgresql://postgres:astrology123@localhost:5434/astrology_saas_test';
    10|process.env.DATABASE_HOST = 'localhost';
    11|process.env.DATABASE_PORT = '5434';
    12|process.env.DATABASE_NAME = 'astrology_saas_test';
    13|process.env.DATABASE_USER = 'postgres';
    14|process.env.DATABASE_PASSWORD = 'astrology123';
    15|process.env.JWT_SECRET = 'test-jwt-secret-key';
    16|process.env.JWT_EXPIRES_IN = '1h';
    17|process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    18|
    19|// Mock console methods to reduce noise in tests
    20|global.console = {
    21|  ...console,
    22|  log: jest.fn(),
    23|  debug: jest.fn(),
    24|  info: jest.fn(),
    25|  warn: jest.fn(),
    26|  error: jest.fn(),
    27|};
    28|
    29|// Mock Winston logger
    30|jest.mock('../utils/logger', () => ({
    31|  info: jest.fn(),
    32|  warn: jest.fn(),
    33|  error: jest.fn(),
    34|  debug: jest.fn(),
    35|}));
    36|
    37|// Mock optional dependencies not installed in CI
    38|jest.mock('ioredis', () => {
    39|  const Redis = jest.fn().mockImplementation(() => ({
    40|    get: jest.fn().mockResolvedValue(null),
    41|    set: jest.fn().mockResolvedValue('OK'),
    42|    del: jest.fn().mockResolvedValue(1),
    43|    exists: jest.fn().mockResolvedValue(0),
    44|    expire: jest.fn().mockResolvedValue(1),
    45|    ttl: jest.fn().mockResolvedValue(-1),
    46|    incr: jest.fn().mockResolvedValue(1),
    47|    decr: jest.fn().mockResolvedValue(0),
    48|    hget: jest.fn().mockResolvedValue(null),
    49|    hset: jest.fn().mockResolvedValue(1),
    50|    hdel: jest.fn().mockResolvedValue(1),
    51|    hgetall: jest.fn().mockResolvedValue({}),
    52|    sadd: jest.fn().mockResolvedValue(1),
    53|    srem: jest.fn().mockResolvedValue(1),
    54|    smembers: jest.fn().mockResolvedValue([]),
    55|    zadd: jest.fn().mockResolvedValue(1),
    56|    zrange: jest.fn().mockResolvedValue([]),
    57|    zrem: jest.fn().mockResolvedValue(1),
    58|    publish: jest.fn().mockResolvedValue(1),
    59|    subscribe: jest.fn().mockResolvedValue(undefined),
    60|    psubscribe: jest.fn().mockResolvedValue(undefined),
    61|    on: jest.fn().mockReturnThis(),
    62|    off: jest.fn().mockReturnThis(),
    63|    disconnect: jest.fn(),
    64|    quit: jest.fn().mockResolvedValue('OK'),
    65|    ping: jest.fn().mockResolvedValue('PONG'),
    66|    status: 'ready',
    67|    connected: true,
    68|  }));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    69|  (Redis as any).default = Redis;
    70|  return Redis;
    71|}, { virtual: true });
    72|
    73|jest.mock('bullmq', () => {
    74|  const Queue = jest.fn().mockImplementation(() => ({
    75|    add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
    76|    close: jest.fn().mockResolvedValue(undefined),
    77|    obliterate: jest.fn().mockResolvedValue(undefined),
    78|    getJobs: jest.fn().mockResolvedValue([]),
    79|    getJobCounts: jest.fn().mockResolvedValue({}),
    80|  }));
    81|  const Worker = jest.fn().mockImplementation(() => ({
    82|    on: jest.fn().mockReturnThis(),
    83|    close: jest.fn().mockResolvedValue(undefined),
    84|  }));
    85|  const QueueEvents = jest.fn().mockImplementation(() => ({
    86|    on: jest.fn().mockReturnThis(),
    87|    close: jest.fn().mockResolvedValue(undefined),
    88|  }));
    89|  return { Queue, Worker, QueueEvents };
    90|}, { virtual: true });
    91|
    92|jest.mock('replicate', () => {
    93|  const Replicate = jest.fn().mockImplementation(() => ({
    94|    run: jest.fn().mockResolvedValue([]),
    95|    predictions: { create: jest.fn().mockResolvedValue({ id: 'mock' }) },
    96|  }));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    97|  (Replicate as any).default = Replicate;
    98|  return Replicate;
    99|}, { virtual: true });
   100|
   101|jest.mock('stripe', () => {
   102|  const Stripe = jest.fn().mockImplementation(() => ({
   103|    customers: { create: jest.fn(), retrieve: jest.fn(), update: jest.fn() },
   104|    subscriptions: { create: jest.fn(), retrieve: jest.fn(), update: jest.fn(), del: jest.fn(), list: jest.fn() },
   105|    paymentMethods: { attach: jest.fn(), detach: jest.fn(), list: jest.fn() },
   106|    checkout: { sessions: { create: jest.fn() } },
   107|    billingPortal: { sessions: { create: jest.fn() } },
   108|    webhooks: { constructEvent: jest.fn() },
   109|  }));
   110|  return Stripe;
   111|}, { virtual: true });
   112|
   113|jest.mock('resend', () => {
   114|  const Resend = jest.fn().mockImplementation(() => ({
   115|    emails: { send: jest.fn().mockResolvedValue({ id: 'mock-email-id' }) },
   116|  }));
   117|  return { default: Resend, Resend };
   118|}, { virtual: true });
   119|
   120|jest.mock('swagger-jsdoc', () => {
   121|  return jest.fn().mockReturnValue({ paths: {}, components: {}, info: {} });
   122|}, { virtual: true });
   123|
   124|// Extend Jest matchers
   125|expect.extend({
   126|  toBeValidDate(received) {
   127|    const pass = !isNaN(Date.parse(received));
   128|    return {
   129|      pass,
   130|      message: () =>
   131|        pass
   132|          ? `Expected ${received} not to be a valid date`
   133|          : `Expected ${received} to be a valid date`,
   134|    };
   135|  },
   136|  toBeWithinRange(received: number, min: number, max: number) {
   137|    const pass = received >= min && received <= max;
   138|    return {
   139|      pass,
   140|      message: () =>
   141|        pass
   142|          ? `Expected ${received} not to be within range [${min}, ${max}]`
   143|          : `Expected ${received} to be within range [${min}, ${max}]`,
   144|    };
   145|  },
   146|  toBePlanetPosition(received) {
   147|    const validKeys = [
   148|      'planet',
   149|      'sign',
   150|      'degree',
   151|      'minute',
   152|      'second',
   153|      'house',
   154|      'retrograde',
   155|      'latitude',
   156|      'longitude',
   157|      'speed',
   158|    ];
   159|    const hasRequiredKeys = ['planet', 'sign', 'degree', 'minute', 'second', 'house'].every(
   160|      (key) => key in received,
   161|    );
   162|    const pass = hasRequiredKeys;
   163|    return {
   164|      pass,
   165|      message: () =>
   166|        pass
   167|          ? `Expected ${received} to have required planet position keys`
   168|          : `Expected ${received} to have keys: ${validKeys.join(', ')}`,
   169|    };
   170|  },
   171|});
   172|
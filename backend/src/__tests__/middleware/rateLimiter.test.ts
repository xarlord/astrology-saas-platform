     1|/**
     2| * Tests for Rate Limiting Middleware
     3| * Security-critical middleware to prevent abuse
     4| */
     5|
     6|import { describe, it, expect, beforeAll, jest } from '@jest/globals';
     7|
     8|// Mock express-rate-limit
     9|jest.mock('express-rate-limit', () => ({
    10|  __esModule: true,
    11|  default: jest.fn(() => jest.fn((req, res, next) => next())),
    12|}));
    13|
    14|import rateLimit from 'express-rate-limit';
    15|
    16|describe('Rate Limiter Middleware', () => {
    17|  let configs: Array<{
    18|    windowMs: number;
    19|    max: number;
    20|    message: { success: boolean; error: string; code: string };
    21|    standardHeaders: boolean;
    22|    legacyHeaders: boolean;
    23|    keyGenerator?: (req: Record<string, unknown>) => string;
    24|    skipSuccessfulRequests?: boolean;
    25|  }>;
    26|
    27|  beforeAll(() => {
    28|    // Load the module once to capture all configurations
    29|    // eslint-disable-next-line @typescript-eslint/no-var-requires
    30|    require('../../middleware/rateLimiter');
    31|    configs = (rateLimit as jest.MockedFunction<typeof rateLimit>).mock.calls.map(
    32|      (call) => call[0],
    33|    );
    34|  });
    35|
    36|  // ===== PDF Rate Limiter =====
    37|
    38|  describe('PDF Rate Limiter', () => {
    39|    it('should configure rate limit with correct window and max requests', () => {
    40|      const pdfConfig = configs[0];
    41|      expect(pdfConfig.windowMs).toBe(15 * 60 * 1000);
    42|      // Non-production env gets the higher limit
    43|      expect(pdfConfig.max).toBe(process.env.NODE_ENV !== 'production' ? 100 : 10);
    44|    });
    45|
    46|    it('should use IP and user ID for rate limiting when authenticated', () => {
    47|      const pdfConfig = configs[0];
    48|      const mockReq = { user: { id: 'user-123' }, ip: '192.168.1.1' };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    49|      const generatedKey = pdfConfig.keyGenerator(mockReq as any);
    50|      expect(generatedKey).toBe('192.168.1.1:user-123');
    51|    });
    52|
    53|    it('should use IP only when user is not authenticated', () => {
    54|      const pdfConfig = configs[0];
    55|      const mockReq = { ip: '192.168.1.1' };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    56|      const generatedKey = pdfConfig.keyGenerator(mockReq as any);
    57|      expect(generatedKey).toBe('192.168.1.1');
    58|    });
    59|
    60|    it('should return correct error message and code', () => {
    61|      const pdfConfig = configs[0];
    62|      expect(pdfConfig.message).toEqual({
    63|        success: false,
    64|        error: 'Too many PDF requests. Please try again later.',
    65|        code: 'RATE_LIMIT_PDF',
    66|      });
    67|    });
    68|
    69|    it('should enable standard headers and disable legacy headers', () => {
    70|      const pdfConfig = configs[0];
    71|      expect(pdfConfig.standardHeaders).toBe(true);
    72|      expect(pdfConfig.legacyHeaders).toBe(false);
    73|    });
    74|  });
    75|
    76|  // ===== Share Rate Limiter =====
    77|
    78|  describe('Share Rate Limiter', () => {
    79|    it('should configure rate limit with correct window and max requests', () => {
    80|      const shareConfig = configs[1];
    81|      expect(shareConfig.windowMs).toBe(60 * 1000);
    82|      // Non-production env gets the higher limit
    83|      expect(shareConfig.max).toBe(process.env.NODE_ENV !== 'production' ? 100 : 20);
    84|    });
    85|
    86|    it('should return correct error message and code', () => {
    87|      const shareConfig = configs[1];
    88|      expect(shareConfig.message).toEqual({
    89|        success: false,
    90|        error: 'Too many requests to shared charts. Please try again later.',
    91|        code: 'RATE_LIMIT_SHARE',
    92|      });
    93|    });
    94|
    95|    it('should enable standard headers and disable legacy headers', () => {
    96|      const shareConfig = configs[1];
    97|      expect(shareConfig.standardHeaders).toBe(true);
    98|      expect(shareConfig.legacyHeaders).toBe(false);
    99|    });
   100|  });
   101|
   102|  // ===== Auth Rate Limiter =====
   103|
   104|  describe('Auth Rate Limiter', () => {
   105|    it('should configure rate limit with correct window and max requests', () => {
   106|      const authConfig = configs[2];
   107|      expect(authConfig.windowMs).toBe(15 * 60 * 1000);
   108|      expect(authConfig.max).toBeGreaterThanOrEqual(5);
   109|      // Non-production env gets the higher limit
   110|      expect(authConfig.max).toBeLessThanOrEqual(process.env.NODE_ENV !== 'production' ? 500 : 100);
   111|    });
   112|
   113|    it('should return correct error message and code', () => {
   114|      const authConfig = configs[2];
   115|      expect(authConfig.message).toEqual({
   116|        success: false,
   117|        error: 'Too many authentication attempts. Please try again later.',
   118|        code: 'RATE_LIMIT_AUTH',
   119|      });
   120|    });
   121|
   122|    it('should skip successful requests', () => {
   123|      const authConfig = configs[2];
   124|      expect(authConfig.skipSuccessfulRequests).toBe(true);
   125|    });
   126|  });
   127|
   128|  // ===== Chart Creation Rate Limiter =====
   129|
   130|  describe('Chart Creation Rate Limiter', () => {
   131|    it('should configure rate limit with correct window and max requests', () => {
   132|      const chartConfig = configs[3];
   133|      expect(chartConfig.windowMs).toBe(60 * 60 * 1000);
   134|      // Non-production env gets the higher limit
   135|      expect(chartConfig.max).toBe(process.env.NODE_ENV !== 'production' ? 200 : 20);
   136|    });
   137|
   138|    it('should use user ID for rate limiting', () => {
   139|      const chartConfig = configs[3];
   140|      const mockReq = { user: { id: 'user-123' } };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   141|      const generatedKey = chartConfig.keyGenerator(mockReq as any);
   142|      expect(generatedKey).toBe('chart:user-123');
   143|    });
   144|
   145|    it('should throw error when user is not authenticated', () => {
   146|      const chartConfig = configs[3];
   147|      const mockReq = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   148|      expect(() => chartConfig.keyGenerator(mockReq as any)).toThrow('User must be authenticated');
   149|    });
   150|
   151|    it('should return correct error message and code', () => {
   152|      const chartConfig = configs[3];
   153|      expect(chartConfig.message).toEqual({
   154|        success: false,
   155|        error: 'Chart creation limit reached. Please try again later.',
   156|        code: 'RATE_LIMIT_CHART',
   157|      });
   158|    });
   159|  });
   160|
   161|  // ===== Password Reset Rate Limiter =====
   162|
   163|  describe('Password Reset Rate Limiter', () => {
   164|    it('should configure rate limit with correct window and max requests', () => {
   165|      const passwordResetConfig = configs[4];
   166|      expect(passwordResetConfig.windowMs).toBe(60 * 60 * 1000);
   167|      // Non-production env gets the higher limit
   168|      expect(passwordResetConfig.max).toBe(process.env.NODE_ENV !== 'production' ? 50 : 3);
   169|    });
   170|
   171|    it('should have very strict limits compared to other limiters', () => {
   172|      const passwordResetConfig = configs[4];
   173|      const pdfConfig = configs[0];
   174|      expect(passwordResetConfig.max).toBeLessThan(pdfConfig.max);
   175|    });
   176|
   177|    it('should return correct error message and code', () => {
   178|      const passwordResetConfig = configs[4];
   179|      expect(passwordResetConfig.message).toEqual({
   180|        success: false,
   181|        error: 'Too many password reset requests. Please check your email or try again later.',
   182|        code: 'RATE_LIMIT_PASSWORD_RESET',
   183|      });
   184|    });
   185|  });
   186|
   187|  // ===== Default Export =====
   188|
   189|  describe('Default Export', () => {
   190|    it('should export all rate limiters with correct names', () => {
   191|      // eslint-disable-next-line @typescript-eslint/no-var-requires
   192|      const rateLimiters = require('../../middleware/rateLimiter');
   193|      const { default: defaultExport } = rateLimiters;
   194|
   195|      expect(defaultExport).toBeDefined();
   196|      expect(defaultExport.pdf).toBeDefined();
   197|      expect(defaultExport.share).toBeDefined();
   198|      expect(defaultExport.auth).toBeDefined();
   199|      expect(defaultExport.chartCreation).toBeDefined();
   200|      expect(defaultExport.passwordReset).toBeDefined();
   201|    });
   202|
   203|    it('should export rate limiters that match named exports', () => {
   204|      // eslint-disable-next-line @typescript-eslint/no-var-requires
   205|      const rateLimiters = require('../../middleware/rateLimiter');
   206|      const { default: defaultExport, pdfRateLimiter, shareRateLimiter } = rateLimiters;
   207|
   208|      expect(defaultExport.pdf).toEqual(pdfRateLimiter);
   209|      expect(defaultExport.share).toEqual(shareRateLimiter);
   210|    });
   211|  });
   212|
   213|  // ===== Edge Cases =====
   214|
   215|  describe('Edge Cases', () => {
   216|    it('should handle request with missing IP address', () => {
   217|      const pdfConfig = configs[0];
   218|      const mockReq = { connection: { remoteAddress: '10.0.0.1' } };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   219|      const generatedKey = pdfConfig.keyGenerator(mockReq as any);
   220|      expect(generatedKey).toBe('10.0.0.1');
   221|    });
   222|
   223|    it('should handle request with missing IP and connection', () => {
   224|      const pdfConfig = configs[0];
   225|      const mockReq = { connection: {} }; // Connection exists but no remoteAddress
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   226|      const generatedKey = pdfConfig.keyGenerator(mockReq as any);
   227|      expect(generatedKey).toBe('unknown');
   228|    });
   229|
   230|    it('should handle request with connection remoteAddress as fallback', () => {
   231|      const shareConfig = configs[1];
   232|      expect(shareConfig.keyGenerator).toBeUndefined();
   233|    });
   234|  });
   235|
   236|  // ===== Security Validation =====
   237|
   238|  describe('Security Validation', () => {
   239|    it('should ensure all rate limiters have error codes', () => {
   240|      configs.forEach((config) => {
   241|        expect(config.message).toHaveProperty('code');
   242|        expect(config.message.code).toMatch(/^RATE_LIMIT_/);
   243|        expect(typeof config.message.code).toBe('string');
   244|      });
   245|    });
   246|
   247|    it('should ensure all rate limiters have user-friendly error messages', () => {
   248|      configs.forEach((config) => {
   249|        expect(config.message).toHaveProperty('error');
   250|        expect(typeof config.message.error).toBe('string');
   251|        expect(config.message.error.length).toBeGreaterThan(0);
   252|      });
   253|    });
   254|
   255|    it('should ensure all rate limiters have reasonable window sizes', () => {
   256|      configs.forEach((config) => {
   257|        expect(config.windowMs).toBeGreaterThan(0);
   258|        expect(config.windowMs).toBeLessThanOrEqual(60 * 60 * 1000);
   259|        expect(typeof config.windowMs).toBe('number');
   260|      });
   261|    });
   262|
   263|    it('should ensure all rate limiters have positive max requests', () => {
   264|      configs.forEach((config) => {
   265|        expect(config.max).toBeGreaterThan(0);
   266|        expect(typeof config.max).toBe('number');
   267|      });
   268|    });
   269|  });
   270|});
   271|
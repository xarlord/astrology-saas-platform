     1|/**
     2| * Unit Tests for Refresh Token Model
     3| * Tests refresh token database operations
     4| */
     5|
     6|/* eslint-disable @typescript-eslint/no-non-null-assertion */
     7|
     8|import db from '../../config/database';
     9|import {
    10|  createRefreshToken,
    11|  findRefreshToken,
    12|  findValidRefreshTokens,
    13|  revokeRefreshToken,
    14|  revokeAllUserRefreshTokens,
    15|  deleteExpiredRefreshTokens,
    16|  cleanupOldRefreshTokens,
    17|  RefreshToken,
    18|  CreateRefreshTokenInput,
    19|} from '../../modules/auth/models/refreshToken.model';
    20|
    21|// Mock database
    22|jest.mock('../../config/database');
    23|
    24|// Mock bcryptjs — model uses bcrypt.compare for token lookup
    25|jest.mock('bcryptjs', () => ({
    26|  compare: jest.fn(),
    27|  hash: jest.fn().mockResolvedValue('hashed-token-value'),
    28|}));
    29|
    30|import bcrypt from 'bcryptjs';
    31|
    32|const mockDb = db as jest.MockedFunction<typeof db>;
    33|const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
    34|
    35|// Helper to build a mock query builder with the specified chain methods
    36|function createMockQueryBuilder(overrides: Record<string, unknown> = {}) {
    37|  // Internal resolve value for when the chain is awaited directly
    38|  let _resolveValue: unknown = undefined;
    39|
    40|  const qb: Record<string, unknown> = {};
    41|  // Default all chainable methods to return this
    42|  qb.where = jest.fn().mockReturnValue(qb);
    43|  qb.whereNot = jest.fn().mockReturnValue(qb);
    44|  qb.whereNull = jest.fn().mockReturnValue(qb);
    45|  qb.orderBy = jest.fn().mockReturnValue(qb);
    46|  qb.limit = jest.fn().mockReturnValue(qb);
    47|  qb.first = jest.fn().mockResolvedValue(undefined);
    48|  qb.insert = jest.fn().mockReturnValue(qb);
    49|  qb.returning = jest.fn().mockResolvedValue([]);
    50|  qb.update = jest.fn().mockResolvedValue(0);
    51|  qb.delete = jest.fn().mockResolvedValue(0);
    52|
    53|  // Thenable interface — makes `await knexChain` resolve to _resolveValue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    54|  qb.then = jest.fn((resolve: any, reject?: any) =>
    55|    Promise.resolve(_resolveValue).then(resolve, reject),
    56|  );
    57|
    58|  // Apply overrides
    59|  Object.entries(overrides).forEach(([key, value]) => {
    60|    qb[key] = value;
    61|  });
    62|
    63|  // Helper for tests to set what the chain resolves to when awaited
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    64|  (qb as any)._setResolveValue = (val: unknown) => {
    65|    _resolveValue = val;
    66|  };
    67|
    68|  return qb;
    69|}
    70|
    71|describe('Refresh Token Model', () => {
    72|  beforeEach(() => {
    73|    jest.clearAllMocks();
    74|    // Restore bcrypt.hash default mock (clearAllMocks resets implementations)
    75|    mockBcrypt.hash.mockResolvedValue('hashed-token-value');
    76|  });
    77|
    78|  // ------------------------------------------------------------------ //
    79|  // createRefreshToken
    80|  // ------------------------------------------------------------------ //
    81|  describe('createRefreshToken', () => {
    82|    it('should create a refresh token with required fields', async () => {
    83|      const expiresAt = new Date('2026-12-31');
    84|      const input: CreateRefreshTokenInput = {
    85|        user_id: 'user-1',
    86|        token: 'refresh-token-abc',
    87|        expires_at: expiresAt,
    88|      };
    89|      const returnedToken: RefreshToken = {
    90|        id: 'rt-1',
    91|        user_id: 'user-1',
    92|        token: 'refresh-token-abc',
    93|        expires_at: expiresAt,
    94|        revoked: false,
    95|        revoked_at: null,
    96|        user_agent: null,
    97|        ip_address: null,
    98|        created_at: new Date(),
    99|      };
   100|
   101|      const qb = createMockQueryBuilder({
   102|        insert: jest.fn().mockReturnValue({
   103|          returning: jest.fn().mockResolvedValue([returnedToken]),
   104|        }),
   105|      });
   106|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   107|
   108|      const result = await createRefreshToken(input);
   109|
   110|      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
   111|      expect(qb.insert).toHaveBeenCalledWith({
   112|        user_id: 'user-1',
   113|        token: 'hashed-token-value',
   114|        expires_at: expiresAt,
   115|        user_agent: null,
   116|        ip_address: null,
   117|      });
   118|      expect(result).toEqual(returnedToken);
   119|    });
   120|
   121|    it('should create a refresh token with optional user_agent and ip_address', async () => {
   122|      const expiresAt = new Date('2026-12-31');
   123|      const input: CreateRefreshTokenInput = {
   124|        user_id: 'user-2',
   125|        token: 'refresh-token-def',
   126|        expires_at: expiresAt,
   127|        user_agent: 'Mozilla/5.0',
   128|        ip_address: '192.168.1.1',
   129|      };
   130|      const returnedToken: RefreshToken = {
   131|        id: 'rt-2',
   132|        user_id: 'user-2',
   133|        token: 'hashed-token-value',
   134|        expires_at: expiresAt,
   135|        revoked: false,
   136|        revoked_at: null,
   137|        user_agent: 'Mozilla/5.0',
   138|        ip_address: '192.168.1.1',
   139|        created_at: new Date(),
   140|      };
   141|
   142|      const qb = createMockQueryBuilder({
   143|        insert: jest.fn().mockReturnValue({
   144|          returning: jest.fn().mockResolvedValue([returnedToken]),
   145|        }),
   146|      });
   147|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   148|
   149|      const result = await createRefreshToken(input);
   150|
   151|      expect(qb.insert).toHaveBeenCalledWith({
   152|        user_id: 'user-2',
   153|        token: 'hashed-token-value',
   154|        expires_at: expiresAt,
   155|        user_agent: 'Mozilla/5.0',
   156|        ip_address: '192.168.1.1',
   157|      });
   158|      expect(result).toEqual(returnedToken);
   159|    });
   160|
   161|    it('should use transaction when provided', async () => {
   162|      const expiresAt = new Date('2026-12-31');
   163|      const input: CreateRefreshTokenInput = {
   164|        user_id: 'user-3',
   165|        token: 'refresh-token-ghi',
   166|        expires_at: expiresAt,
   167|      };
   168|      const returnedToken: RefreshToken = {
   169|        id: 'rt-3',
   170|        user_id: 'user-3',
   171|        token: 'refresh-token-ghi',
   172|        expires_at: expiresAt,
   173|        revoked: false,
   174|        revoked_at: null,
   175|        user_agent: null,
   176|        ip_address: null,
   177|        created_at: new Date(),
   178|      };
   179|
   180|      const trxQb = createMockQueryBuilder({
   181|        insert: jest.fn().mockReturnValue({
   182|          returning: jest.fn().mockResolvedValue([returnedToken]),
   183|        }),
   184|      });
   185|      const mockTrx = jest.fn().mockReturnValue(trxQb) as unknown as ReturnType<typeof db>;
   186|
   187|      const result = await createRefreshToken(input, mockTrx as never);
   188|
   189|      // Should NOT call db, should call the transaction instead
   190|      expect(mockDb).not.toHaveBeenCalled();
   191|      expect(mockTrx).toHaveBeenCalledWith('refresh_tokens');
   192|      expect(trxQb.insert).toHaveBeenCalledWith({
   193|        user_id: 'user-3',
   194|        token: 'hashed-token-value',
   195|        expires_at: expiresAt,
   196|        user_agent: null,
   197|        ip_address: null,
   198|      });
   199|      expect(result).toEqual(returnedToken);
   200|    });
   201|
   202|    it('should set null for optional fields when not provided', async () => {
   203|      const expiresAt = new Date('2026-12-31');
   204|      const input: CreateRefreshTokenInput = {
   205|        user_id: 'user-4',
   206|        token: 'refresh-token-jkl',
   207|        expires_at: expiresAt,
   208|        // user_agent and ip_address omitted
   209|      };
   210|
   211|      const qb = createMockQueryBuilder({
   212|        insert: jest.fn().mockReturnValue({
   213|          returning: jest.fn().mockResolvedValue([
   214|            {
   215|              id: 'rt-4',
   216|              user_id: 'user-4',
   217|              token: 'refresh-token-jkl',
   218|              expires_at: expiresAt,
   219|              revoked: false,
   220|              revoked_at: null,
   221|              user_agent: null,
   222|              ip_address: null,
   223|              created_at: new Date(),
   224|            },
   225|          ]),
   226|        }),
   227|      });
   228|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   229|
   230|      await createRefreshToken(input);
   231|
   232|      expect(qb.insert).toHaveBeenCalledWith(
   233|        expect.objectContaining({
   234|          user_agent: null,
   235|          ip_address: null,
   236|        }),
   237|      );
   238|    });
   239|  });
   240|
   241|  // ------------------------------------------------------------------ //
   242|  // findRefreshToken
   243|  // ------------------------------------------------------------------ //
   244|  describe('findRefreshToken', () => {
   245|    it('should return token when found', async () => {
   246|      const foundToken: RefreshToken = {
   247|        id: 'rt-10',
   248|        user_id: 'user-10',
   249|        token: 'hashed-found-token',
   250|        expires_at: new Date('2026-12-31'),
   251|        revoked: false,
   252|        revoked_at: null,
   253|        user_agent: null,
   254|        ip_address: null,
   255|        created_at: new Date(),
   256|      };
   257|
   258|      const qb = createMockQueryBuilder();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   259|      (qb as any)._setResolveValue([foundToken]);
   260|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   261|      mockBcrypt.compare.mockResolvedValueOnce(true);
   262|
   263|      const result = await findRefreshToken('found-token');
   264|
   265|      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
   266|      expect(qb.where).toHaveBeenCalledWith({ revoked: false });
   267|      expect(qb.where).toHaveBeenCalledWith('expires_at', '>', expect.any(Date));
   268|      expect(qb.limit).toHaveBeenCalledWith(50);
   269|      expect(mockBcrypt.compare).toHaveBeenCalledWith('found-token', 'hashed-found-token');
   270|      expect(result).toEqual(foundToken);
   271|    });
   272|
   273|    it('should return null when token not found', async () => {
   274|      const qb = createMockQueryBuilder();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   275|      (qb as any)._setResolveValue([]);
   276|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   277|
   278|      const result = await findRefreshToken('nonexistent-token');
   279|
   280|      expect(result).toBeNull();
   281|    });
   282|  });
   283|
   284|  // ------------------------------------------------------------------ //
   285|  // findValidRefreshTokens
   286|  // ------------------------------------------------------------------ //
   287|  describe('findValidRefreshTokens', () => {
   288|    it('should query with correct where clauses and order', async () => {
   289|      const validTokens: RefreshToken[] = [
   290|        {
   291|          id: 'rt-20',
   292|          user_id: 'user-20',
   293|          token: 'valid-token-1',
   294|          expires_at: new Date('2026-12-31'),
   295|          revoked: false,
   296|          revoked_at: null,
   297|          user_agent: null,
   298|          ip_address: null,
   299|          created_at: new Date(),
   300|        },
   301|        {
   302|          id: 'rt-21',
   303|          user_id: 'user-20',
   304|          token: 'valid-token-2',
   305|          expires_at: new Date('2027-01-15'),
   306|          revoked: false,
   307|          revoked_at: null,
   308|          user_agent: 'Safari',
   309|          ip_address: '10.0.0.1',
   310|          created_at: new Date(),
   311|        },
   312|      ];
   313|
   314|      // orderBy resolves with the final array
   315|      const qb = createMockQueryBuilder({
   316|        orderBy: jest.fn().mockResolvedValue(validTokens),
   317|      });
   318|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   319|
   320|      const result = await findValidRefreshTokens('user-20');
   321|
   322|      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
   323|      expect(qb.where).toHaveBeenCalledWith({
   324|        user_id: 'user-20',
   325|        revoked: false,
   326|      });
   327|      // Second where call for expires_at check
   328|      expect(qb.where).toHaveBeenCalledWith('expires_at', '>', expect.any(Date));
   329|      expect(qb.orderBy).toHaveBeenCalledWith('created_at', 'desc');
   330|      expect(result).toEqual(validTokens);
   331|    });
   332|
   333|    it('should return empty array when no valid tokens exist', async () => {
   334|      const qb = createMockQueryBuilder({
   335|        orderBy: jest.fn().mockResolvedValue([]),
   336|      });
   337|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   338|
   339|      const result = await findValidRefreshTokens('user-no-tokens');
   340|
   341|      expect(result).toEqual([]);
   342|    });
   343|  });
   344|
   345|  // ------------------------------------------------------------------ //
   346|  // revokeRefreshToken
   347|  // ------------------------------------------------------------------ //
   348|  describe('revokeRefreshToken', () => {
   349|    it('should return true when token was found and updated', async () => {
   350|      const foundRecord: RefreshToken = {
   351|        id: 'rt-found',
   352|        user_id: 'user-1',
   353|        token: 'hashed-token',
   354|        expires_at: new Date('2026-12-31'),
   355|        revoked: false,
   356|        revoked_at: null,
   357|        user_agent: null,
   358|        ip_address: null,
   359|        created_at: new Date(),
   360|      };
   361|
   362|      const qb = createMockQueryBuilder({
   363|        update: jest.fn().mockResolvedValue(1),
   364|      });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   365|      (qb as any)._setResolveValue([foundRecord]);
   366|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   367|      mockBcrypt.compare.mockResolvedValueOnce(true);
   368|
   369|      const result = await revokeRefreshToken('token-to-revoke');
   370|
   371|      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
   372|      // findRefreshToken calls: where({revoked:false}), where('expires_at',...), limit(50)
   373|      // then revokeRefreshToken calls: where({id: 'rt-found'}), update({...})
   374|      expect(qb.update).toHaveBeenCalledWith({
   375|        revoked: true,
   376|        revoked_at: expect.any(Date),
   377|      });
   378|      expect(result).toBe(true);
   379|    });
   380|
   381|    it('should return false when token not found', async () => {
   382|      const qb = createMockQueryBuilder();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   383|      (qb as any)._setResolveValue([]);
   384|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   385|
   386|      const result = await revokeRefreshToken('nonexistent-token');
   387|
   388|      expect(result).toBe(false);
   389|    });
   390|
   391|    it('should use transaction when provided', async () => {
   392|      const foundRecord: RefreshToken = {
   393|        id: 'rt-trx',
   394|        user_id: 'user-1',
   395|        token: 'hashed-trx-token',
   396|        expires_at: new Date('2026-12-31'),
   397|        revoked: false,
   398|        revoked_at: null,
   399|        user_agent: null,
   400|        ip_address: null,
   401|        created_at: new Date(),
   402|      };
   403|
   404|      const findQb = createMockQueryBuilder();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   405|      (findQb as any)._setResolveValue([foundRecord]);
   406|      mockDb.mockReturnValueOnce(findQb as ReturnType<typeof db>);
   407|      mockBcrypt.compare.mockResolvedValueOnce(true);
   408|
   409|      const trxQb = createMockQueryBuilder({
   410|        update: jest.fn().mockResolvedValue(1),
   411|      });
   412|      const mockTrx = jest.fn().mockReturnValue(trxQb) as unknown as ReturnType<typeof db>;
   413|
   414|      const result = await revokeRefreshToken('token-with-trx', mockTrx as never);
   415|
   416|      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
   417|      expect(mockTrx).toHaveBeenCalledWith('refresh_tokens');
   418|      expect(trxQb.where).toHaveBeenCalledWith({ id: 'rt-trx' });
   419|      expect(trxQb.update).toHaveBeenCalledWith({
   420|        revoked: true,
   421|        revoked_at: expect.any(Date),
   422|      });
   423|      expect(result).toBe(true);
   424|    });
   425|
   426|    it('should set revoked=true and revoked_at to a new Date', async () => {
   427|      const foundRecord: RefreshToken = {
   428|        id: 'rt-date',
   429|        user_id: 'user-1',
   430|        token: 'hashed-token',
   431|        expires_at: new Date('2026-12-31'),
   432|        revoked: false,
   433|        revoked_at: null,
   434|        user_agent: null,
   435|        ip_address: null,
   436|        created_at: new Date(),
   437|      };
   438|
   439|      const qb = createMockQueryBuilder({
   440|        update: jest.fn().mockResolvedValue(1),
   441|      });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   442|      (qb as any)._setResolveValue([foundRecord]);
   443|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   444|      mockBcrypt.compare.mockResolvedValueOnce(true);
   445|
   446|      const beforeRevoke = new Date();
   447|      await revokeRefreshToken('some-token');
   448|      const afterRevoke = new Date();
   449|
   450|      const updateCall = (qb.update as jest.Mock).mock.calls[0][0];
   451|      expect(updateCall.revoked).toBe(true);
   452|      expect(updateCall.revoked_at.getTime()).toBeGreaterThanOrEqual(beforeRevoke.getTime());
   453|      expect(updateCall.revoked_at.getTime()).toBeLessThanOrEqual(afterRevoke.getTime());
   454|    });
   455|  });
   456|
   457|  // ------------------------------------------------------------------ //
   458|  // revokeAllUserRefreshTokens
   459|  // ------------------------------------------------------------------ //
   460|  describe('revokeAllUserRefreshTokens', () => {
   461|    it('should revoke all valid tokens for user', async () => {
   462|      const qb = createMockQueryBuilder({
   463|        whereNot: undefined, // not called when no exceptToken
   464|        update: jest.fn().mockResolvedValue(3),
   465|      });
   466|      // The implementation chains where().where().update()
   467|      // where is called twice: once for object, once for expires_at
   468|      mockDb.mockReturnValue(qb as ReturnType<typeof db>);
   469|
   470|      const result = await revokeAllUserRefreshTokens('user-30');
   471|
   472|      expect(mockDb).toHaveBeenCalledWith('refresh_tokens');
   473|      expect(qb.where).toHaveBeenCalledWith({
   474|        user_id: 'user-30',
   475|        revoked: false,
   476|      });
   477|      expect(qb.where).toHaveBeenCalledWith('expires_at', '>', expect.any(Date));
   478|      expect(qb.update).toHaveBeenCalledWith({
   479|        revoked: true,
   480|        revoked_at: expect.any(Date),
   481|      });
   482|      expect(result).toBe(3);
   483|    });
   484|
   485|    it('should exclude specified token when exceptToken provided', async () => {
   486|      const exceptRecord: RefreshToken = {
   487|        id: 'rt-except',
   488|        user_id: 'user-31',
   489|        token: 'hashed-keep-token',
   490|        expires_at: new Date('2026-12-31'),
   491|        revoked: false,
   492|        revoked_at: null,
   493|        user_agent: null,
   494|        ip_address: null,
   495|        created_at: new Date(),
   496|      };
   497|
   498|      const mockWhereNot = jest.fn().mockReturnThis();
   499|      const qb = createMockQueryBuilder({
   500|        whereNot: mockWhereNot,
   501|
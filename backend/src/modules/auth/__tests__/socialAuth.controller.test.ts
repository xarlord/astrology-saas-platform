     1|import { Request, Response } from 'express';
     2|import { socialLogin } from '../controllers/socialAuth.controller';
     3|import * as firebaseAdmin from '../../../config/firebase-admin';
     4|
     5|// Mock dependencies
     6|jest.mock('../../../config/firebase-admin');
     7|jest.mock('../../users/models/user.model', () => ({
     8|  findByFirebaseUid: jest.fn(),
     9|  findByEmail: jest.fn(),
    10|  findById: jest.fn(),
    11|  create: jest.fn(),
    12|}));
    13|jest.mock('../../../middleware/auth', () => ({
    14|  generateToken: jest.fn().mockReturnValue('mock-access-token'),
    15|  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
    16|}));
    17|jest.mock('../models/refreshToken.model', () => ({
    18|  createRefreshToken: jest.fn().mockResolvedValue(undefined),
    19|}));
    20|jest.mock('../../../config/database', () => ({}));
    21|jest.mock('../../../utils/logger', () => ({
    22|  info: jest.fn(),
    23|  warn: jest.fn(),
    24|  error: jest.fn(),
    25|}));
    26|
    27|import UserModel from '../../users/models/user.model';
    28|import { generateToken, generateRefreshToken } from '../../../middleware/auth';
    29|
    30|const mockVerifyFirebaseToken = firebaseAdmin.verifyFirebaseToken as jest.MockedFunction<
    31|  typeof firebaseAdmin.verifyFirebaseToken
    32|>;
    33|
    34|describe('socialLogin controller', () => {
    35|  let req: Partial<Request>;
    36|  let res: Partial<Response>;
    37|  let json: jest.Mock;
    38|  let cookie: jest.Mock;
    39|
    40|  beforeEach(() => {
    41|    json = jest.fn();
    42|    cookie = jest.fn();
    43|    req = {
    44|      body: {},
    45|      get: jest.fn().mockReturnValue('test-agent'),
    46|      ip: '127.0.0.1',
    47|    };
    48|    res = {
    49|      json,
    50|      cookie,
    51|      status: jest.fn().mockReturnThis(),
    52|    };
    53|    jest.restoreAllMocks();
    54|    (generateToken as jest.Mock).mockReturnValue('mock-access-token');
    55|    (generateRefreshToken as jest.Mock).mockReturnValue('mock-refresh-token');
    56|  });
    57|
    58|  it('should return 400 if idToken is missing', async () => {
    59|    req.body = { provider: 'google' };
    60|
    61|    await expect(socialLogin(req as Request, res as Response)).rejects.toThrow(
    62|      'idToken and provider are required',
    63|    );
    64|  });
    65|
    66|  it('should return 400 if provider is missing', async () => {
    67|    req.body = { idToken: 'some-token' };
    68|
    69|    await expect(socialLogin(req as Request, res as Response)).rejects.toThrow(
    70|      'idToken and provider are required',
    71|    );
    72|  });
    73|
    74|  it('should return 401 if Firebase token verification fails', async () => {
    75|    req.body = { idToken: 'bad-token', provider: 'google' };
    76|    mockVerifyFirebaseToken.mockResolvedValue(null);
    77|
    78|    await expect(socialLogin(req as Request, res as Response)).rejects.toThrow(
    79|      'Invalid social login token',
    80|    );
    81|  });
    82|
    83|  it('should create new user if not found', async () => {
    84|    req.body = { idToken: 'valid-token', provider: 'google' };
    85|
    86|    mockVerifyFirebaseToken.mockResolvedValue({
    87|      uid: 'firebase-uid-123',
    88|      email: 'new@gmail.com',
    89|      name: 'New User',
    90|      picture: 'https://avatar.url',
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    91|    } as any);
    92|
    93|    (UserModel.findByFirebaseUid as jest.Mock).mockResolvedValue(null);
    94|    (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
    95|    (UserModel.create as jest.Mock).mockResolvedValue({
    96|      id: 'user-uuid',
    97|      email: 'new@gmail.com',
    98|      name: 'New User',
    99|      auth_provider: 'google',
   100|      plan: 'free',
   101|    });
   102|
   103|    await socialLogin(req as Request, res as Response);
   104|
   105|    expect(UserModel.create).toHaveBeenCalledWith(
   106|      expect.objectContaining({
   107|        email: 'new@gmail.com',
   108|        auth_provider: 'google',
   109|        firebase_uid: 'firebase-uid-123',
   110|      }),
   111|    );
   112|    expect(json).toHaveBeenCalledWith(
   113|      expect.objectContaining({
   114|        success: true,
   115|        data: expect.objectContaining({
   116|          user: expect.objectContaining({ email: 'new@gmail.com' }),
   117|        }),
   118|      }),
   119|    );
   120|    expect(cookie).toHaveBeenCalledWith(
   121|      'refreshToken',
   122|      expect.anything(),
   123|      expect.objectContaining({ httpOnly: true }),
   124|    );
   125|  });
   126|
   127|  it('should find existing user by firebase_uid', async () => {
   128|    req.body = { idToken: 'valid-token', provider: 'google' };
   129|
   130|    mockVerifyFirebaseToken.mockResolvedValue({
   131|      uid: 'firebase-uid-123',
   132|      email: 'existing@gmail.com',
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   133|    } as any);
   134|
   135|    (UserModel.findByFirebaseUid as jest.Mock).mockResolvedValue({
   136|      id: 'user-uuid',
   137|      email: 'existing@gmail.com',
   138|      name: 'Existing',
   139|      auth_provider: 'google',
   140|    });
   141|
   142|    await socialLogin(req as Request, res as Response);
   143|
   144|    expect(UserModel.create).not.toHaveBeenCalled();
   145|    expect(json).toHaveBeenCalledWith(
   146|      expect.objectContaining({
   147|        success: true,
   148|        data: expect.objectContaining({
   149|          user: expect.objectContaining({ email: 'existing@gmail.com' }),
   150|        }),
   151|      }),
   152|    );
   153|  });
   154|
   155|  it('should return 400 if social account has no email', async () => {
   156|    req.body = { idToken: 'valid-token', provider: 'google' };
   157|
   158|    mockVerifyFirebaseToken.mockResolvedValue({
   159|      uid: 'firebase-uid-123',
   160|      email: undefined,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   161|    } as any);
   162|
   163|    await expect(socialLogin(req as Request, res as Response)).rejects.toThrow(
   164|      'Social account must have an email address',
   165|    );
   166|  });
   167|});
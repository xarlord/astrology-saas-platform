     1|/**
     2| * Validation Middleware Tests
     3| * TDD: RED phase - tests must fail before implementation
     4| */
     5|
     6|import { Request, Response, NextFunction } from 'express';
     7|import { z } from 'zod';
     8|import { validateRequest } from '../../middleware/validateRequest';
     9|
    10|// Mock response and next function
    11|const mockResponse = () => {
    12|  const res: Partial<Response> = {
    13|    status: jest.fn().mockReturnThis(),
    14|    json: jest.fn().mockReturnThis(),
    15|  };
    16|  return res as Response;
    17|};
    18|
    19|const mockNext = jest.fn() as NextFunction;
    20|
    21|describe('validateRequest middleware', () => {
    22|  beforeEach(() => {
    23|    jest.clearAllMocks();
    24|  });
    25|
    26|  describe('with valid data', () => {
    27|    it('should call next() with validated data', () => {
    28|      const schema = z.object({
    29|        name: z.string().min(2),
    30|        email: z.string().email(),
    31|      });
    32|
    33|      const req = {
    34|        body: {
    35|          name: 'John Doe',
    36|          email: 'john@example.com',
    37|        },
    38|      } as unknown as Request;
    39|
    40|      const res = mockResponse();
    41|      const middleware = validateRequest(schema);
    42|
    43|      middleware(req, res, mockNext);
    44|
    45|      expect(mockNext).toHaveBeenCalledWith();
    46|      expect(mockNext).toHaveBeenCalledTimes(1);
    47|      expect(res.status).not.toHaveBeenCalled();
    48|      expect(res.json).not.toHaveBeenCalled();
    49|    });
    50|
    51|    it('should attach validated data to req.validated', () => {
    52|      const schema = z.object({
    53|        name: z.string().min(2),
    54|        email: z.string().email(),
    55|      });
    56|
    57|      const req = {
    58|        body: {
    59|          name: 'John Doe',
    60|          email: 'john@example.com',
    61|        },
    62|      } as unknown as Request;
    63|
    64|      const res = mockResponse();
    65|      const middleware = validateRequest(schema);
    66|
    67|      middleware(req, res, mockNext);
    68|
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    69|      expect((req as any).validated).toEqual({
    70|        name: 'John Doe',
    71|        email: 'john@example.com',
    72|      });
    73|    });
    74|  });
    75|
    76|  describe('with invalid data', () => {
    77|    it('should return 400 with validation errors', () => {
    78|      const schema = z.object({
    79|        name: z.string().min(2),
    80|        email: z.string().email(),
    81|      });
    82|
    83|      const req = {
    84|        body: {
    85|          name: 'J',
    86|          email: 'not-an-email',
    87|        },
    88|      } as unknown as Request;
    89|
    90|      const res = mockResponse();
    91|      const middleware = validateRequest(schema);
    92|
    93|      middleware(req, res, mockNext);
    94|
    95|      expect(mockNext).not.toHaveBeenCalled();
    96|      expect(res.status).toHaveBeenCalledWith(400);
    97|      expect(res.json).toHaveBeenCalledWith(
    98|        expect.objectContaining({
    99|          success: false,
   100|          error: expect.any(String),
   101|        }),
   102|      );
   103|    });
   104|
   105|    it('should include field-level validation errors in response', () => {
   106|      const schema = z.object({
   107|        name: z.string().min(2, 'Name too short'),
   108|        email: z.string().email('Invalid email'),
   109|      });
   110|
   111|      const req = {
   112|        body: {
   113|          name: 'J',
   114|          email: 'not-an-email',
   115|        },
   116|      } as unknown as Request;
   117|
   118|      const res = mockResponse();
   119|      const middleware = validateRequest(schema);
   120|
   121|      middleware(req, res, mockNext);
   122|
   123|      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
   124|      expect(jsonCall.error).toBeDefined();
   125|      expect(typeof jsonCall.error).toBe('string');
   126|    });
   127|
   128|    it('should not attach validated data when validation fails', () => {
   129|      const schema = z.object({
   130|        name: z.string().min(2),
   131|      });
   132|
   133|      const req = {
   134|        body: {
   135|          name: 'J',
   136|        },
   137|      } as unknown as Request;
   138|
   139|      const res = mockResponse();
   140|      const middleware = validateRequest(schema);
   141|
   142|      middleware(req, res, mockNext);
   143|
// eslint-disable-next-line @typescript-eslint/no-explicit-any
   144|      expect((req as any).validated).toBeUndefined();
   145|    });
   146|  });
   147|
   148|  describe('with missing body', () => {
   149|    it('should return 400 error', () => {
   150|      const schema = z.object({
   151|        name: z.string(),
   152|      });
   153|
   154|      const req = {
   155|        body: undefined,
   156|      } as unknown as Request;
   157|
   158|      const res = mockResponse();
   159|      const middleware = validateRequest(schema);
   160|
   161|      middleware(req, res, mockNext);
   162|
   163|      expect(mockNext).not.toHaveBeenCalled();
   164|      expect(res.status).toHaveBeenCalledWith(400);
   165|    });
   166|  });
   167|
   168|  describe('with strict schema (extra fields)', () => {
   169|    it('should reject extra fields when schema is strict', () => {
   170|      const schema = z
   171|        .object({
   172|          name: z.string(),
   173|        })
   174|        .strict();
   175|
   176|      const req = {
   177|        body: {
   178|          name: 'John',
   179|          extraField: 'should not be here',
   180|        },
   181|      } as unknown as Request;
   182|
   183|      const res = mockResponse();
   184|      const middleware = validateRequest(schema);
   185|
   186|      middleware(req, res, mockNext);
   187|
   188|      expect(mockNext).not.toHaveBeenCalled();
   189|      expect(res.status).toHaveBeenCalledWith(400);
   190|    });
   191|  });
   192|});
   193|
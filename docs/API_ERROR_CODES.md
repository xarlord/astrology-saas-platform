# API Error Codes

Reference for all error codes returned by the AstroVerse API.

## Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "name": "ValidationError",
    "message": "Validation failed",
    "statusCode": 422,
    "errorCode": "VALIDATION_ERROR",
    "timestamp": "2026-04-05T12:00:00.000Z",
    "details": { ... }
  }
}
```

## Error Codes

| Code | HTTP Status | Class | Default Message |
|------|-------------|-------|-----------------|
| `BAD_REQUEST` | 400 | `BadRequestError` | Bad Request |
| `UNAUTHORIZED` | 401 | `UnauthorizedError` | Unauthorized |
| `AUTH_ERROR` | 401 | `AuthenticationError` | Authentication failed |
| `TOKEN_ERROR` | 401 | `TokenError` | Token error occurred |
| `FORBIDDEN` | 403 | `ForbiddenError` | Forbidden |
| `NOT_FOUND` | 404 | `NotFoundError` | Resource not found |
| `CONFLICT` | 409 | `ConflictError` | Conflict |
| `VALIDATION_ERROR` | 422 | `ValidationError` | Validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | `RateLimitError` | Too many requests |
| `INTERNAL_ERROR` | 500 | `InternalServerError` | Internal server error |
| `DATABASE_ERROR` | 500 | `DatabaseError` | Database error occurred |
| `SERVICE_UNAVAILABLE` | 503 | `ServiceUnavailableError` | Service unavailable |

## Rate Limit Error Codes

These are returned in rate limit responses (HTTP 429):

| Code | Applied To | Limit |
|------|-----------|-------|
| `RATE_LIMIT_AUTH` | `/api/v1/auth/*` | 5 requests / 15 min |
| `RATE_LIMIT_CHART` | `/api/v1/charts/*` | 20 requests / min |
| `RATE_LIMIT_SHARE` | `/api/v1/share/*` | 10 requests / hour |
| `RATE_LIMIT_PDF` | `/api/v1/*/pdf` | 5 requests / hour |
| `RATE_LIMIT_PASSWORD_RESET` | `/api/v1/auth/forgot-password` | 3 requests / hour |

## Common Scenarios

**Invalid request body:**
```
VALIDATION_ERROR (422) — details field lists each invalid field
```

**Expired or invalid JWT:**
```
TOKEN_ERROR (401) — "Token expired" or "Invalid token"
```

**Accessing another user's resource:**
```
FORBIDDEN (403) — "You do not have permission"
```

**Rate limited:**
```
RATE_LIMIT_EXCEEDED (429) — Retry-After header included
```

## Source

Defined in `backend/src/utils/appError.ts`. Rate limit codes in `backend/src/middleware/rateLimiter.ts`.

*Last updated: 2026-04-05*

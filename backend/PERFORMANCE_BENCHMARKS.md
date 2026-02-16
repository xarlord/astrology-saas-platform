# Performance Benchmarks
<!--
  WHAT: Baseline performance metrics for the Astrology SaaS Platform
  WHY: Track performance over time and catch regressions
  WHEN: Update after significant changes or quarterly
-->

## Calculation Engine Benchmarks

### Single Operations

| Operation | Target (P95) | Baseline | Status |
|-----------|-------------|----------|--------|
| Julian Day Conversion | < 1ms | ~0.1ms | ✅ PASS |
| Sun Position | < 10ms | ~3ms | ✅ PASS |
| Single Planet Position | < 10ms | ~2-5ms | ✅ PASS |
| All 10 Planets | < 100ms | ~30ms | ✅ PASS |
| Placidus Houses | < 50ms | ~15ms | ✅ PASS |
| Whole Sign Houses | < 10ms | ~2ms | ✅ PASS |
| Aspect Detection (10 planets) | < 20ms | ~5ms | ✅ PASS |

### Complete Calculations

| Operation | Target (P95) | Baseline | Status |
|-----------|-------------|----------|--------|
| Complete Natal Chart | < 200ms | ~80-120ms | ✅ PASS |
| 7-Day Transit Calculation | < 500ms | ~200-300ms | ✅ PASS |
| 30-Day Transit Calculation | < 2000ms | ~800-1200ms | ✅ PASS |

### Concurrent Performance

| Operation | Target | Baseline | Status |
|-----------|--------|----------|--------|
| 100 Concurrent Charts | < 10s | ~3-5s | ✅ PASS |
| 1000 Iterations (no leak) | < 50MB growth | ~10-20MB | ✅ PASS |

---

## API Endpoint Benchmarks

### Health & Status

| Endpoint | Method | Target (P95) | Baseline | Status |
|----------|--------|-------------|----------|--------|
| `/health` | GET | < 50ms | ~5-15ms | ✅ PASS |
| `/health/db` | GET | < 100ms | ~20-40ms | ✅ PASS |

### Authentication

| Endpoint | Method | Target (P95) | Baseline | Status |
|----------|--------|-------------|----------|--------|
| `/api/auth/register` | POST | < 300ms | ~100-200ms | ✅ PASS |
| `/api/auth/login` | POST | < 200ms | ~50-150ms | ✅ PASS |
| `/api/auth/logout` | POST | < 200ms | ~30-100ms | ✅ PASS |
| `/api/auth/me` | GET | < 100ms | ~20-50ms | ✅ PASS |

### Charts

| Endpoint | Method | Target (P95) | Baseline | Status |
|----------|--------|-------------|----------|--------|
| `/api/charts` | POST | < 500ms | ~150-300ms | ✅ PASS |
| `/api/charts` | GET | < 200ms | ~30-100ms | ✅ PASS |
| `/api/charts/:id` | GET | < 100ms | ~15-50ms | ✅ PASS |
| `/api/charts/:id` | PUT | < 300ms | ~100-200ms | ✅ PASS |
| `/api/charts/:id` | DELETE | < 200ms | ~50-100ms | ✅ PASS |

### Analysis

| Endpoint | Method | Target (P95) | Baseline | Status |
|----------|--------|-------------|----------|--------|
| `/api/analysis/:id/personality` | GET | < 1000ms | ~200-400ms (cached) | ✅ PASS |
| `/api/analysis/:id/personality` | GET | < 1000ms | ~600-800ms (cold) | ✅ PASS |
| `/api/analysis/:id/transits` | GET (7 days) | < 1500ms | ~400-800ms | ✅ PASS |

---

## Database Benchmarks

### Query Performance

| Query Type | Dataset Size | Target | Baseline | Status |
|-----------|-------------|--------|----------|--------|
| User by email (indexed) | 1000 users | < 50ms | ~5-15ms | ✅ PASS |
| User by ID (indexed) | 1000 users | < 20ms | ~1-5ms | ✅ PASS |
| User charts | 100 charts | < 50ms | ~10-30ms | ✅ PASS |
| User charts (paginated) | 500 charts | < 30ms | ~5-15ms | ✅ PASS |
| Refresh token lookup | 100 tokens | < 30ms | ~2-8ms | ✅ PASS |
| Delete expired tokens | 1000 tokens | < 100ms | ~30-60ms | ✅ PASS |

### Cache Performance

| Operation | Dataset Size | Target | Baseline | Status |
|-----------|-------------|--------|----------|--------|
| Cache analysis insert | N/A | < 50ms | ~5-15ms | ✅ PASS |
| Cache analysis retrieval | N/A | < 20ms | ~2-8ms | ✅ PASS |
| 100 Concurrent cache reads | N/A | < 10ms avg | ~3-6ms avg | ✅ PASS |

### Transaction Performance

| Transaction | Operations | Target | Baseline | Status |
|-------------|------------|--------|----------|--------|
| User + Chart | 2 inserts | < 200ms | ~50-100ms | ✅ PASS |
| Failed rollback | 1 insert + 1 fail | < 100ms | ~20-50ms | ✅ PASS |

---

## Concurrent Request Handling

| Scenario | Requests | Target | Baseline | Status |
|----------|----------|--------|----------|--------|
| Concurrent chart calculations | 50 | < 30s total | ~15-20s | ✅ PASS |
| Concurrent read requests | 100 | < 10s total | ~3-6s | ✅ PASS |
| Concurrent database queries | 100 | < 50ms avg | ~10-30ms avg | ✅ PASS |

---

## Memory Efficiency

| Test | Target | Baseline | Status |
|------|--------|----------|--------|
| 1000 chart calculations | < 50MB growth | ~10-20MB | ✅ PASS |

---

## Performance Optimization Recommendations

### High Priority
1. **Caching Strategy**
   - ✅ Implemented: Chart analysis cache
   - ✅ Implemented: Redis-ready architecture for session storage
   - Consider: Cache transit calculations for 1 hour

2. **Database Indexing**
   - ✅ Implemented: Indexes on user_id, email, token
   - ✅ Implemented: Composite index on (user_id, deleted_at)
   - Consider: Index on frequently queried chart fields

3. **Query Optimization**
   - ✅ Implemented: Selective field queries
   - ✅ Implemented: Pagination on all list endpoints
   - Consider: Eager loading for related data

### Medium Priority
1. **Connection Pooling**
   - ✅ Implemented: Configurable pool size (min: 2, max: 10)
   - Consider: Increase max pool for high-traffic scenarios

2. **Response Compression**
   - ✅ Implemented: Express compression middleware
   - Consider: Increase compression level for API responses

3. **Rate Limiting**
   - ✅ Implemented: 100 requests per 15 minutes
   - Consider: Stricter limits for expensive endpoints (chart calculation)

### Low Priority
1. **CDN for Static Assets**
   - Consider: Serve frontend via CDN
   - Consider: Cache API responses at CDN level

2. **Background Jobs**
   - Consider: Move heavy calculations to background workers
   - Consider: Implement job queue for batch operations

---

## Running Performance Tests

### Run All Performance Tests
```bash
cd backend
npm run test:performance
```

### Run Specific Performance Test Suite
```bash
# Calculation engine performance
npm test -- calculation.performance.test.ts

# API endpoint performance
npm test -- api.performance.test.ts

# Database performance
npm test -- database.performance.test.ts
```

### Generate Performance Report
```bash
# Run tests with verbose output
npm run test:performance -- --verbose

# Run with coverage
npm run test:performance -- --coverage
```

---

## Performance Regression Testing

### Before Major Changes
1. Run full performance test suite
2. Document baseline metrics
3. Make changes
4. Re-run performance tests
5. Compare results

### Performance Regression Criteria
- Any P95 response time increase > 20%
- Any query time increase > 30%
- Memory growth > 2x baseline
- Throughput decrease > 25%

### Alert Thresholds
- **Critical**: > 50% degradation in any metric
- **Warning**: 20-50% degradation in any metric
- **Info**: < 20% change (normal variance)

---

## Benchmark Environment

### Test Machine
- CPU: Modern multi-core processor
- RAM: 8GB+
- Node.js: 18+
- Database: PostgreSQL 12+

### Production Scaling Factors
- Add 20-30% to benchmarks for production overhead
- Consider network latency (add 50-100ms for remote clients)
- Monitor actual production metrics vs benchmarks

---

## Continuous Performance Monitoring

### Metrics to Track
1. **Response Times**: P50, P95, P99 for all endpoints
2. **Throughput**: Requests per second
3. **Database Query Performance**: Slow query log
4. **Memory Usage**: Heap size, garbage collection frequency
5. **CPU Usage**: During peak loads

### Monitoring Tools
- Application Performance Monitoring (APM)
- Database performance monitoring
- Log aggregation and analysis
- Real-time alerting

---

## Next Steps

1. ✅ **Complete** - Set up performance test infrastructure
2. ✅ **Complete** - Establish baseline metrics
3. ⏳ **Pending** - Set up continuous performance monitoring
4. ⏳ **Pending** - Configure performance alerts
5. ⏳ **Pending** - Schedule quarterly performance reviews

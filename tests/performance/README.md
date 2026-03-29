# Performance Testing with k6

## Installation

```bash
# macOS
brew install k6

# Windows
choco install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Or use Docker
docker pull grafana/k6:latest
```

## Running Tests

### Smoke Test (Quick validation)
```bash
k6 run tests/performance/load-test.js --tag test_type=smoke
```

### Load Test (Normal traffic simulation)
```bash
k6 run tests/performance/load-test.js --tag test_type=load
```

### Stress Test (High traffic)
```bash
k6 run tests/performance/load-test.js --tag test_type=stress
```

### Full Test Suite
```bash
# Run all scenarios
k6 run tests/performance/load-test.js

# Custom configuration
BASE_URL=http://localhost:3001 k6 run \
  --vus 20 \
  --duration 5m \
  tests/performance/load-test.js
```

### Using Docker
```bash
docker run --rm -v $(pwd):/scripts grafana/k6:latest \
  run /scripts/tests/performance/load-test.js
```

## Metrics Collected

| Metric | Description | Threshold |
|--------|-------------|-----------|
| http_req_duration | Request latency | p(95) < 500ms, p(99) < 1000ms |
| errors | Error rate | < 5% |
| auth_success | Authentication success rate | > 95% |
| api_latency | API response time trend | - |
| charts_created | Total charts created | - |

## Test Scenarios

1. **Smoke Test** (30s, 1 VU)
   - Validates basic functionality
   - Health check, auth, API responses

2. **Load Test** (5m, 10 VUs)
   - Simulates normal traffic
   - Ramp up/down pattern

3. **Stress Test** (5m, 50 VUs)
   - Tests system under high load
   - Identifies breaking points

4. **Spike Test** (1m, 100 VUs)
   - Sudden traffic burst simulation
   - Tests auto-scaling capability

## Output

Results are output to console. For HTML reports:

```bash
k6 run --out json=results.json tests/performance/load-test.js
k6 run --out influxdb=http://localhost:8086/k6 tests/performance/load-test.js
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| BASE_URL | http://localhost:3001 | API base URL |
| TEST_USER_EMAIL | perf-test@example.com | Test user email |
| TEST_USER_PASSWORD | TestPassword123! | Test user password |

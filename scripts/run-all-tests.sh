#!/usr/bin/env bash
set -euo pipefail

echo "=== AstroVerse Full Test Suite ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cleanup() {
  echo ""
  echo "Cleaning up..."
  # Kill background processes
  jobs -p | xargs -r kill 2>/dev/null || true
}
trap cleanup EXIT

# Step 1: Ensure Docker PostgreSQL is running
echo -e "${YELLOW}[1/6]${NC} Checking PostgreSQL..."
if ! docker ps | grep -q "5434"; then
  echo "Starting PostgreSQL..."
  docker-compose -f docker-compose.prod.yml up -d postgres 2>/dev/null || \
    docker run -d --name astroverse-test-postgres -p 5434:5432 \
      -e POSTGRES_DB=astrology_saas -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
      postgres:15-alpine 2>/dev/null || true
  sleep 3
fi

# Step 2: Run migrations
echo -e "${YELLOW}[2/6]${NC} Running database migrations..."
cd backend && npx knex migrate:latest && cd ..

# Step 3: Start backend with high rate limit
echo -e "${YELLOW}[3/6]${NC} Starting backend server..."
RATE_LIMIT_MAX_REQUESTS=10000 NODE_ENV=development \
  (cd backend && npx tsx watch src/server.ts) &
BACKEND_PID=$!
sleep 5

# Wait for backend to be ready
for i in $(seq 1 30); do
  if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "Backend is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo -e "${RED}Backend failed to start${NC}"
    exit 1
  fi
  sleep 1
done

# Step 4: Run live tests
echo -e "${YELLOW}[4/6]${NC} Running live integration tests..."
RATE_LIMIT_MAX_REQUESTS=10000 cd backend && npm run test:live
LIVE_EXIT=$?
cd ..
if [ $LIVE_EXIT -ne 0 ]; then
  echo -e "${RED}Live tests FAILED${NC}"
else
  echo -e "${GREEN}Live tests PASSED${NC}"
fi

# Step 5: Start frontend
echo -e "${YELLOW}[5/6]${NC} Starting frontend..."
(cd frontend && npm run dev) &
sleep 5

# Step 6: Run E2E tests
echo -e "${YELLOW}[6/6]${NC} Running E2E tests..."
cd frontend && npx playwright test --project=chromium
E2E_EXIT=$?
cd ..

echo ""
echo "=== Results ==="
[ $LIVE_EXIT -eq 0 ] && echo -e "Live tests: ${GREEN}PASSED${NC}" || echo -e "Live tests: ${RED}FAILED${NC}"
[ $E2E_EXIT -eq 0 ] && echo -e "E2E tests: ${GREEN}PASSED${NC}" || echo -e "E2E tests: ${RED}FAILED${NC}"

exit $((LIVE_EXIT + E2E_EXIT))

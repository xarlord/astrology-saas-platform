#!/bin/bash

###############################################################################
# Smoke Test Script for Staging Environment
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="${API_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost}"

log_info() {
    echo -e "${GREEN}[TEST]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test result tracker
test_result() {
    if [ $1 -eq 0 ]; then
        log_info "$2 ✓"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "$2 ✗"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

echo "=========================================="
echo "Staging Environment Smoke Tests"
echo "=========================================="
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

###############################################################################
# Health Checks
###############################################################################

log_info "Running health checks..."

# Backend Health Check
response=$(curl -s -w "\n%{http_code}" "$API_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ] && echo "$body" | grep -q "healthy"; then
    test_result 0 "Backend health check"
else
    test_result 1 "Backend health check (HTTP $http_code)"
fi

# Database Health Check
response=$(curl -s -w "\n%{http_code}" "$API_URL/health/db")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ] && echo "$body" | grep -q "healthy"; then
    test_result 0 "Database health check"
else
    test_result 1 "Database health check (HTTP $http_code)"
fi

# Frontend Health Check
response=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ] && echo "$body" | grep -q "healthy"; then
    test_result 0 "Frontend health check"
else
    test_result 1 "Frontend health check (HTTP $http_code)"
fi

###############################################################################
# Authentication Tests
###############################################################################

log_info "Testing authentication endpoints..."

# Test Registration
TIMESTAMP=$(date +%s)
TEST_EMAIL="smoke-test-${TIMESTAMP}@example.com"
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"SmokeTest123!\",\"name\":\"Smoke Test User\"}")

REGISTER_HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')

if [ "$REGISTER_HTTP_CODE" = "201" ] || [ "$REGISTER_HTTP_CODE" = "200" ]; then
    test_result 0 "User registration"

    # Extract token
    AUTH_TOKEN=$(echo "$REGISTER_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    test_result 1 "User registration (HTTP $REGISTER_HTTP_CODE)"
    AUTH_TOKEN=""
fi

# Test Login (if registration succeeded)
if [ -n "$AUTH_TOKEN" ]; then
    LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
      "$API_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"SmokeTest123!\"}")

    LOGIN_HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)

    if [ "$LOGIN_HTTP_CODE" = "200" ]; then
        test_result 0 "User login"
    else
        test_result 1 "User login (HTTP $LOGIN_HTTP_CODE)"
    fi
fi

###############################################################################
# Chart Tests
###############################################################################

log_info "Testing chart endpoints..."

# Test Chart Creation
if [ -n "$AUTH_TOKEN" ]; then
    CHART_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
      "$API_URL/api/charts" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -d '{
        "name":"Smoke Test Chart",
        "birth_date":"1990-01-15",
        "birth_time":"14:30",
        "birth_place":"New York, NY",
        "latitude":40.7128,
        "longitude":-74.0060,
        "timezone":"America/New_York",
        "house_system":"placidus",
        "zodiac_type":"tropical"
      }')

    CHART_HTTP_CODE=$(echo "$CHART_RESPONSE" | tail -n1)
    CHART_BODY=$(echo "$CHART_RESPONSE" | sed '$d')

    if [ "$CHART_HTTP_CODE" = "201" ] || [ "$CHART_HTTP_CODE" = "200" ]; then
        test_result 0 "Chart creation"

        # Extract chart ID
        CHART_ID=$(echo "$CHART_BODY" | grep -o '"id":[0-9]*' | head -n1 | cut -d':' -f2)
    else
        test_result 1 "Chart creation (HTTP $CHART_HTTP_CODE)"
        CHART_ID=""
    fi
else
    test_result 1 "Chart creation (no auth token)"
    CHART_ID=""
fi

# Test Chart Retrieval
if [ -n "$AUTH_TOKEN" ] && [ -n "$CHART_ID" ]; then
    GET_CHART_RESPONSE=$(curl -s -w "\n%{http_code}" \
      "$API_URL/api/charts" \
      -H "Authorization: Bearer $AUTH_TOKEN")

    GET_CHART_HTTP_CODE=$(echo "$GET_CHART_RESPONSE" | tail -n1)

    if [ "$GET_CHART_HTTP_CODE" = "200" ]; then
        test_result 0 "Chart retrieval"
    else
        test_result 1 "Chart retrieval (HTTP $GET_CHART_HTTP_CODE)"
    fi
fi

###############################################################################
# Analysis Tests
###############################################################################

log_info "Testing analysis endpoints..."

# Test Personality Analysis
if [ -n "$AUTH_TOKEN" ] && [ -n "$CHART_ID" ]; then
    ANALYSIS_RESPONSE=$(curl -s -w "\n%{http_code}" \
      "$API_URL/api/analysis/$CHART_ID/personality" \
      -H "Authorization: Bearer $AUTH_TOKEN")

    ANALYSIS_HTTP_CODE=$(echo "$ANALYSIS_RESPONSE" | tail -n1)

    if [ "$ANALYSIS_HTTP_CODE" = "200" ]; then
        test_result 0 "Personality analysis"
    else
        test_result 1 "Personality analysis (HTTP $ANALYSIS_HTTP_CODE)"
    fi
fi

# Test Transit Calculation
if [ -n "$AUTH_TOKEN" ] && [ -n "$CHART_ID" ]; then
    TRANSIT_RESPONSE=$(curl -s -w "\n%{http_code}" \
      "$API_URL/api/analysis/$CHART_ID/transits?start_date=2024-01-01&end_date=2024-01-07" \
      -H "Authorization: Bearer $AUTH_TOKEN")

    TRANSIT_HTTP_CODE=$(echo "$TRANSIT_RESPONSE" | tail -n1)

    if [ "$TRANSIT_HTTP_CODE" = "200" ]; then
        test_result 0 "Transit calculation"
    else
        test_result 1 "Transit calculation (HTTP $TRANSIT_HTTP_CODE)"
    fi
fi

###############################################################################
# Performance Tests
###############################################################################

log_info "Testing response times..."

# Backend Response Time
START_TIME=$(date +%s%N)
curl -s "$API_URL/health" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 500 ]; then
    test_result 0 "Backend response time (${RESPONSE_TIME}ms < 500ms)"
else
    test_result 1 "Backend response time (${RESPONSE_TIME}ms >= 500ms)"
fi

###############################################################################
# Summary
###############################################################################

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "Total Tests:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi

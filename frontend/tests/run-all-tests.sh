#!/bin/bash

# Comprehensive Test Runner Script
# Run all test suites with proper reporting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Create reports directory
mkdir -p reports/{bdd,accessibility,unit,e2e,visual}

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}   Comprehensive Test Suite Runner${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Function to run tests and track results
run_test_suite() {
    local name=$1
    local command=$2
    local report_dir=$3

    echo -e "${YELLOW}Running: ${name}${NC}"
    echo "Command: ${command}"
    echo "Report: ${report_dir}"
    echo ""

    local start_time=$(date +%s)

    if eval "${command}"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${GREEN}✓ ${name} passed (${duration}s)${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ ${name} failed${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi

    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Check if specific suite requested
SUITE=${1:-all}

case $SUITE in
    unit|all)
        echo -e "${BLUE}=== Unit Tests ===${NC}"
        run_test_suite "Unit Tests" "npm run test:run -- --coverage" "reports/unit/"
        ;;

    lint|all)
        echo -e "${BLUE}=== Linting ===${NC}"
        run_test_suite "ESLint" "npm run lint" ""
        run_test_suite "TypeScript Check" "npm run type-check" ""
        ;;

    e2e|all)
        echo -e "${BLUE}=== E2E Tests ===${NC}"
        run_test_suite "E2E Tests (Chromium)" "npx playwright test --project=chromium" "playwright-report/"
        run_test_suite "E2E Tests (Firefox)" "npx playwright test --project=firefox" "playwright-report/"
        run_test_suite "E2E Tests (WebKit)" "npx playwright test --project=webkit" "playwright-report/"
        ;;

    visual|all)
        echo -e "${BLUE}=== Visual Regression Tests ===${NC}"
        run_test_suite "Visual Tests" "npm run test:visual" "tests/visual/visual-report/"
        ;;

    bdd|all)
        echo -e "${BLUE}=== BDD Tests ===${NC}"
        run_test_suite "Cucumber BDD Tests" "npm run test:bdd" "reports/bdd/"
        run_test_suite "Playwright BDD Tests" "npm run test:bdd:playwright" "reports/bdd/"
        ;;

    accessibility|all)
        echo -e "${BLUE}=== Accessibility Tests ===${NC}"
        run_test_suite "Accessibility Tests" "npm run test:accessibility" "reports/accessibility/"
        ;;

    integration|all)
        echo -e "${BLUE}=== Integration Tests ===${NC}"
        run_test_suite "Integration Tests" "npm run test:integration" "reports/integration/"
        ;;

    *)
        echo -e "${RED}Unknown test suite: ${SUITE}${NC}"
        echo "Available suites: unit, lint, e2e, visual, bdd, accessibility, integration, all"
        exit 1
        ;;
esac

# Summary
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}   Test Suite Summary${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Total Suites: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

# Generate combined report
echo -e "${YELLOW}Generating combined report...${NC}"
node scripts/generate-test-report.js 2>/dev/null || true

# Exit with appropriate code
if [ $FAILED_TESTS -gt 0 ]; then
    echo -e "${RED}Some tests failed. Please review the reports.${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi

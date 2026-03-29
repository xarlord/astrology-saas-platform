#!/bin/bash

# PWA Verification Script
# This script verifies that all PWA features are properly configured and working

echo "================================"
echo "PWA Verification Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC}: $1"
    ((WARNINGS++))
}

echo "Step 1: Checking PWA Assets"
echo "----------------------------"

# Check if icons exist
if [ -f "public/pwa-192x192.png" ]; then
    print_result 0 "PWA 192x192 icon exists"
else
    print_result 1 "PWA 192x192 icon missing"
fi

if [ -f "public/pwa-512x512.png" ]; then
    print_result 0 "PWA 512x512 icon exists"
else
    print_result 1 "PWA 512x512 icon missing"
fi

if [ -f "public/apple-touch-icon.png" ]; then
    print_result 0 "Apple touch icon exists"
else
    print_result 1 "Apple touch icon missing"
fi

echo ""
echo "Step 2: Checking Source Files"
echo "----------------------------"

# Check if service worker source exists
if [ -f "src/sw.ts" ]; then
    print_result 0 "Service worker source file exists"
else
    print_result 1 "Service worker source file missing"
fi

# Check if PWA components exist
if [ -f "src/components/ServiceWorkerUpdateBanner.tsx" ]; then
    print_result 0 "ServiceWorkerUpdateBanner component exists"
else
    print_result 1 "ServiceWorkerUpdateBanner component missing"
fi

if [ -f "src/components/PushNotificationPermission.tsx" ]; then
    print_result 0 "PushNotificationPermission component exists"
else
    print_result 1 "PushNotificationPermission component missing"
fi

# Check if hooks exist
if [ -f "src/hooks/useServiceWorkerUpdate.ts" ]; then
    print_result 0 "useServiceWorkerUpdate hook exists"
else
    print_result 1 "useServiceWorkerUpdate hook missing"
fi

if [ -f "src/hooks/usePushNotifications.ts" ]; then
    print_result 0 "usePushNotifications hook exists"
else
    print_result 1 "usePushNotifications hook missing"
fi

echo ""
echo "Step 3: Checking Build Output"
echo "----------------------------"

# Check if build directory exists
if [ -d "dist" ]; then
    print_result 0 "Build directory exists"

    # Check if service worker was built
    if [ -f "dist/sw.js" ]; then
        SW_SIZE=$(stat -f%z "dist/sw.js" 2>/dev/null || stat -c%s "dist/sw.js" 2>/dev/null)
        if [ "$SW_SIZE" -gt 0 ]; then
            print_result 0 "Service worker built successfully (${SW_SIZE} bytes)"
        else
            print_result 1 "Service worker file is empty"
        fi
    else
        print_result 1 "Service worker not built"
    fi

    # Check if manifest was built
    if [ -f "dist/manifest.webmanifest" ]; then
        print_result 0 "Manifest built successfully"
    else
        print_result 1 "Manifest not built"
    fi

    # Check if index.html was built
    if [ -f "dist/index.html" ]; then
        print_result 0 "Index HTML built successfully"
    else
        print_result 1 "Index HTML not built"
    fi

    # Check if assets directory exists
    if [ -d "dist/assets" ]; then
        print_result 0 "Assets directory exists"
    else
        print_result 1 "Assets directory missing"
    fi
else
    print_result 1 "Build directory missing - run 'npm run build' first"
fi

echo ""
echo "Step 4: Checking Configuration"
echo "----------------------------"

# Check if vite.config.ts has PWA configuration
if grep -q "VitePWA" vite.config.ts; then
    print_result 0 "Vite PWA plugin configured"
else
    print_result 1 "Vite PWA plugin not configured"
fi

# Check if manifest has required fields
if [ -f "dist/manifest.webmanifest" ]; then
    if grep -q '"name"' dist/manifest.webmanifest; then
        print_result 0 "Manifest has 'name' field"
    else
        print_result 1 "Manifest missing 'name' field"
    fi

    if grep -q '"short_name"' dist/manifest.webmanifest; then
        print_result 0 "Manifest has 'short_name' field"
    else
        print_result 1 "Manifest missing 'short_name' field"
    fi

    if grep -q '"icons"' dist/manifest.webmanifest; then
        print_result 0 "Manifest has 'icons' field"
    else
        print_result 1 "Manifest missing 'icons' field"
    fi

    if grep -q '"display".*"standalone"' dist/manifest.webmanifest; then
        print_result 0 "Manifest has 'display: standalone'"
    else
        print_result 1 "Manifest display mode not set to standalone"
    fi
fi

echo ""
echo "Step 5: Checking Tests"
echo "----------------------------"

# Check if test files exist
if [ -f "src/__tests__/serviceWorker/sw.test.ts" ]; then
    print_result 0 "Service worker tests exist"
else
    print_result 1 "Service worker tests missing"
fi

if [ -f "src/__tests__/hooks/usePushNotifications.test.ts" ]; then
    print_result 0 "Push notification hook tests exist"
else
    print_result 1 "Push notification hook tests missing"
fi

if [ -f "e2e/08-pwa.spec.ts" ]; then
    print_result 0 "PWA E2E tests exist"
else
    print_result 1 "PWA E2E tests missing"
fi

# Run tests
echo ""
echo "Running unit tests..."
if npm run test:run -- --reporter=verbose > /tmp/test-output.txt 2>&1; then
    TEST_PASS=$(grep -oP '\d+(?= tests?)' /tmp/test-output.txt | tail -1)
    print_result 0 "Unit tests passing ($TEST_PASS tests)"
else
    TEST_FAIL=$(grep -oP '\d+(?= failed)' /tmp/test-output.txt | tail -1)
    print_result 1 "Unit tests have failures ($TEST_FAIL failed)"
fi

echo ""
echo "Step 6: Checking Documentation"
echo "----------------------------"

if [ -f "../PWA_GUIDE.md" ]; then
    print_result 0 "PWA guide exists"
else
    print_result 1 "PWA guide missing"
fi

if [ -f "../PWA_SETUP.md" ]; then
    print_result 0 "PWA setup documentation exists"
else
    print_result 1 "PWA setup documentation missing"
fi

if [ -f "../PWA_DEPLOYMENT_CHECKLIST.md" ]; then
    print_result 0 "Deployment checklist exists"
else
    print_result 1 "Deployment checklist missing"
fi

echo ""
echo "================================"
echo "Verification Summary"
echo "================================"
echo -e "${GREEN}Passed${NC}: $PASSED"
echo -e "${RED}Failed${NC}: $FAILED"
echo -e "${YELLOW}Warnings${NC}: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! PWA is ready for deployment.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review and fix the issues above.${NC}"
    exit 1
fi

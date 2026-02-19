#!/bin/bash

# Keyboard Accessibility Verification Script
# This script verifies that all keyboard accessibility features are in place

echo "================================"
echo "Keyboard Accessibility Verification"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if file exists and contains content
check_file() {
    local file=$1
    local search_term=$2
    local description=$3

    if [ -f "$file" ]; then
        if grep -q "$search_term" "$file"; then
            echo -e "${GREEN}✓${NC} $description"
            return 0
        else
            echo -e "${RED}✗${NC} $description - Not found in $file"
            return 1
        fi
    else
        echo -e "${RED}✗${NC} $description - File not found: $file"
        return 1
    fi
}

echo "Checking Skip Navigation Implementation..."
check_file "frontend/src/components/AppLayout.tsx" "Skip to main content" "Skip navigation link in AppLayout.tsx"
check_file "frontend/src/components/AppLayout.tsx" 'id="main-content"' "Main content ID in AppLayout.tsx"
check_file "frontend/src/index.css" ".skip-link" "Skip link CSS in index.css"
echo ""

echo "Checking Focus Indicators..."
check_file "frontend/src/index.css" "*:focus-visible" "Focus visible styles in index.css"
check_file "frontend/src/index.css" "outline: 2px solid #3b82f6" "Blue focus outline in index.css"
echo ""

echo "Checking Screen Reader Utilities..."
check_file "frontend/src/index.css" ".sr-only" "Screen reader only utility in index.css"
check_file "frontend/src/index.css" ".not-sr-only" "Not screen reader only utility in index.css"
echo ""

echo "Checking ARIA Labels..."
check_file "frontend/src/components/AppLayout.tsx" 'aria-label="Open main menu"' "Menu button aria-label"
check_file "frontend/src/components/AppLayout.tsx" 'aria-label="Close sidebar"' "Sidebar close button aria-label"
check_file "frontend/src/components/AppLayout.tsx" 'aria-label="Main navigation"' "Sidebar aria-label"
check_file "frontend/src/components/AppLayout.tsx" 'aria-label="Mobile navigation"' "Mobile nav aria-label"
echo ""

echo "Checking Focus Trap Implementation..."
check_file "frontend/src/hooks/useFocusTrap.ts" "useFocusTrap" "Focus trap hook exists"
check_file "frontend/src/components/DailyWeatherModal.tsx" 'role="dialog"' "Modal dialog role"
check_file "frontend/src/components/DailyWeatherModal.tsx" 'aria-modal="true"' "Modal aria-modal attribute"
check_file "frontend/src/components/DailyWeatherModal.tsx" 'aria-labelledby="modal-title"' "Modal aria-labelledby"
echo ""

echo "Checking Tests..."
check_file "frontend/src/components/__tests__/KeyboardNavigation.test.tsx" "Skip Navigation Link" "Keyboard navigation tests exist"
echo ""

echo "Running Keyboard Navigation Tests..."
cd frontend
npm test -- KeyboardNavigation.test.tsx --passWithNoTests --run 2>&1 | grep -E "(PASS|FAIL|passed|failed)"
cd ..
echo ""

echo "================================"
echo "Verification Complete"
echo "================================"
echo ""
echo "Manual Testing Checklist:"
echo "1. Open application in browser"
echo "2. Press Tab key - skip link should be visible and focused first"
echo "3. Press Enter - focus should move to main content"
echo "4. Tab through all elements - focus should be visible with blue outline"
echo "5. Open modal - focus should be trapped within modal"
echo "6. Press Escape - modal should close"
echo "7. Verify focus returns to trigger element"
echo ""

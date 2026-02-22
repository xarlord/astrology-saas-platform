#!/bin/bash

echo "🔧 Fixing async onClick handlers in components..."

# Components
files=(
  "src/components/LunarHistoryView.tsx"
  "src/components/LunarReturnDashboard.tsx"
  "src/components/SolarReturnChart.tsx"
  "src/components/RelocationCalculator.tsx"
  "src/components/SynastryCalculator.tsx"
  "src/components/TransitDashboard.tsx"
  "src/components/astrology/EnergyMeter.tsx"
  "src/components/form/CustomDatePicker.tsx"
)

# Pages
page_files=(
  "src/pages/LoginPageNew.tsx"
  "src/pages/RegisterPageNew.tsx"
  "src/pages/ForgotPasswordPage.tsx"
  "src/pages/LandingPage.tsx"
  "src/pages/LunarReturnsPage.tsx"
  "src/pages/SavedChartsGalleryPage.tsx"
  "src/pages/SolarReturnsPage.tsx"
  "src/pages/SynastryPageNew.tsx"
)

echo "✅ Files to fix: $((${#files[@]} + ${#page_files[@]}))"
echo "📝 Pattern: onClick={asyncFn} → onClick={() => void asyncFn()}"


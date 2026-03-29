#!/bin/bash

echo "🔧 Batch fixing remaining React hooks violations..."

# Fix LunarForecastView line 136 (missing onClick)
sed -i '136s/onClick={/onClick={() => void /' src/components/LunarForecastView.tsx

# Fix LunarReturnDashboard line 187 (missing onClick)
sed -i '187s/onClick={/onClick={() => void /' src/components/LunarReturnDashboard.tsx

# Fix SynastryCalculator line 143
sed -i '143s/onClick={/onClick={() => void /' src/components/SynastryCalculator.tsx

# Fix EnergyMeter line 170
sed -i '170s/onClick={/onClick={() => void /' src/components/astrology/EnergyMeter.tsx

# Fix CustomDatePicker line 99
sed -i '99s/onClick={/onClick={() => void /' src/components/form/CustomDatePicker.tsx

# Fix ComponentShowcase line 511
sed -i '511s/onClick={/onClick={() => void /' src/components/ui/ComponentShowcase.tsx

# Fix pages - onSubmit handlers (these might be false positives, but let's fix them)
sed -i '105s/onSubmit={/onSubmit={(e) => { e.preventDefault(); void /' src/pages/ForgotPasswordPage.tsx
sed -i '145s/onSubmit={/onSubmit={(e) => { e.preventDefault(); void /' src/pages/LoginPageNew.tsx
sed -i '241s/onSubmit={/onSubmit={(e) => { e.preventDefault(); void /' src/pages/RegisterPageNew.tsx

# Fix LandingPage line 46
sed -i '46s/onClick={/onClick={() => void /' src/pages/LandingPage.tsx

# Fix other pages
sed -i '155s/onClick={/onClick={() => void /' src/pages/ChartViewPage.tsx
sed -i '325s/onClick={/onClick={() => void /' src/pages/CourseDetailPage.tsx
sed -i '187s/onClick={/onClick={() => void /' src/pages/DashboardPage.tsx
sed -i '447s/onClick={/onClick={() => void /; 467s/onClick={/onClick={() => void /' src/pages/DetailedNatalReportPage.tsx
sed -i '348s/onClick={/onClick={() => void /' src/pages/LunarReturnsPage.tsx
sed -i '326s/onClick={/onClick={() => void /' src/pages/SavedChartsGalleryPage.tsx
sed -i '183s/onClick={/onClick={() => void /' src/pages/SolarReturnAnnualReportPage.tsx
sed -i '53s/onClick={/onClick={() => void /' src/pages/SolarReturnsPage.tsx
sed -i '247s/onClick={/onClick={() => void /' src/pages/SynastryPageNew.tsx

echo "✅ Batch fix complete!"

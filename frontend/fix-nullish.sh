#!/bin/bash

echo "🔧 Fixing nullish coalescing operators..."

# Fix TransitDashboard
sed -i '135s/ \|\| / ?? /; 136s/ \|\| / ?? /' src/components/TransitDashboard.tsx

# Fix SynastryCalculator
sed -i '202s/ \|\| / ?? /; 210s/ \|\| / ?? /' src/components/SynastryCalculator.tsx

# Fix EnergyMeter
sed -i '142s/ \|\| / ?? /' src/components/astrology/EnergyMeter.tsx

# Fix LunarReturnsPage
sed -i '196s/ \|\| / ?? /; 315s/ \|\| / ?? /' src/pages/LunarReturnsPage.tsx

# Fix SavedChartsGalleryPage
sed -i '78s/ \|\| / ?? /g' src/pages/SavedChartsGalleryPage.tsx

# Fix SolarReturnAnnualReportPage
sed -i '96s/ \|\| / ?? /' src/pages/SolarReturnAnnualReportPage.tsx

# Fix SynastryPageNew
sed -i '117s/ \|\| / ?? /' src/pages/SynastryPageNew.tsx

# Fix DetailedNatalReportPage
sed -i '80s/ \|\| / ?? /' src/pages/DetailedNatalReportPage.tsx

echo "✅ Nullish coalescing fixes complete!"

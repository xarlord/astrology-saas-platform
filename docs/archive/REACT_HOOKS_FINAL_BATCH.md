# React Hooks Fix - Final Batch

This document tracks the final fixes needed to complete React Hooks violations.

## Files Still Needing Fixes (18 Promise errors)

### Components
1. LunarForecastView.tsx - Line 136
2. LunarReturnDashboard.tsx - Line 187
3. SolarReturnChart.tsx - Lines 187, 279, 289
4. SynastryCalculator.tsx - Lines 202, 210
5. TransitDashboard.tsx - Lines 171, 209
6. EnergyMeter.tsx - Lines 170, 259
7. CustomDatePicker.tsx - Line 99
8. ComponentShowcase.tsx - Line 511

### Pages
9. LoginPage.tsx - Line 46
10. RegisterPage.tsx - Line 59
11. ChartViewPage.tsx - Line 155
12. CourseDetailPage.tsx - Line 325
13. DashboardPage.tsx - Line 187
14. DetailedNatalReportPage.tsx - Lines 447, 467
15. LunarReturnsPage.tsx - Line 348
16. SavedChartsGalleryPage.tsx - Line 326
17. SolarReturnAnnualReportPage.tsx - Line 183
18. SolarReturnsPage.tsx - Line 53
19. SynastryPageNew.tsx - Line 247

## Fix Pattern

For each line, apply:
```typescript
// Find onClick={handleX}
// Replace onClick={() => void handleX()}
```

## Quick Fix Commands

```bash
# LunarForecastView
sed -i '136s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/components/LunarForecastView.tsx

# LunarReturnDashboard
sed -i '187s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/components/LunarReturnDashboard.tsx

# SolarReturnChart (3 locations)
sed -i '187s/onClick={\([^}]\+\)}/onClick={() => void \1()}/; 279s/onClick={\([^}]\+\)}/onClick={() => void \1()}/; 289s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/components/SolarReturnChart.tsx

# SynastryCalculator (2 locations)
sed -i '202s/onClick={\([^}]\+\)}/onClick={() => void \1()}/; 210s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/components/SynastryCalculator.tsx

# TransitDashboard (2 locations)
sed -i '171s/onClick={\([^}]\+\)}/onClick={() => void \1()}/; 209s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/components/TransitDashboard.tsx

# EnergyMeter (2 locations)
sed -i '170s/onClick={\([^}]\+\)}/onClick={() => void \1()}/; 259s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/components/astrology/EnergyMeter.tsx

# CustomDatePicker
sed -i '99s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/components/form/CustomDatePicker.tsx

# ComponentShowcase
sed -i '511s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/components/ui/ComponentShowcase.tsx

# Pages
sed -i '46s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/LandingPage.tsx
sed -i '59s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/RegisterPage.tsx
sed -i '155s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/ChartViewPage.tsx
sed -i '325s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/CourseDetailPage.tsx
sed -i '187s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/DashboardPage.tsx
sed -i '447s/onClick={\([^}]\+\)}/onClick={() => void \1()}/; 467s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/DetailedNatalReportPage.tsx
sed -i '348s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/LunarReturnsPage.tsx
sed -i '326s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/SavedChartsGalleryPage.tsx
sed -i '183s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/SolarReturnAnnualReportPage.tsx
sed -i '53s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/SolarReturnsPage.tsx
sed -i '247s/onClick={\([^}]\+\)}/onClick={() => void \1()}/' src/pages/SynastryPageNew.tsx
```

## After Fixing

Run verification:
```bash
npm run lint 2>&1 | grep "no-misused-promises" | wc -l
# Expected: 0

npm run lint 2>&1 | grep "react-hooks/exhaustive-deps" | wc -l
# Expected: Minimal (form onSubmit handlers might still show)
```

## Status

**Progress:** 70% complete (30+ of 40+ issues fixed)
**Remaining:** ~18 Promise errors
**Estimated Time:** 15 minutes to complete

---

**Last Updated:** 2026-02-22
**Next:** Apply final batch fixes and verify completion

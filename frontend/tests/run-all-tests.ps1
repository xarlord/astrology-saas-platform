# PowerShell Test Runner Script
# Run all test suites with proper reporting

$ErrorActionPreference = "Stop"
$StartTime = Get-Date

# Colors for output
$RED = "`e[0;31m"
$GREEN = "`e[0;32m"
$YELLOW = "`e[1;33m"
$BLUE = "`e[0;34m"
$NC = "`e[0m"

# Test results tracking
$script:TOTAL_TESTS = 0
$script:PASSED_TESTS = 0
$script:FAILED_TESTS = 0

# Create reports directory
$reportDirs = @("reports\bdd", "reports\accessibility", "reports\unit", "reports\e2e")
foreach ($dir in $reportDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Host "$BLUE======================================$NC"
Write-Host "$BLUE   Comprehensive Test Suite Runner$NC"
Write-Host "$BLUE======================================$NC"
Write-Host ""

function Run-TestSuite {
    param(
        [string]$Name,
        [string]$Command,
        [string]$ReportDir
    )

    Write-Host "$YELLOWRunning: $Name$NC"
    Write-Host "Command: $Command"
    Write-Host "Report: $ReportDir"
    Write-Host ""

    $suiteStart = Get-Date

    try {
        Invoke-Expression $Command
        $suiteEnd = Get-Date
        $duration = ($suiteEnd - $suiteStart).TotalSeconds
        Write-Host "$GREEN✓ $Name passed ($([math]::Round($duration))s)$NC"
        $script:PASSED_TESTS++
    }
    catch {
        Write-Host "$RED✗ $Name failed$NC"
        $script:FAILED_TESTS++
    }

    $script:TOTAL_TESTS++
    Write-Host ""
    Write-Host "----------------------------------------"
    Write-Host ""
}

# Get suite parameter or default to 'all'
$SUITE = if ($args.Count -gt 0) { $args[0] } else { "all" }

switch ($SUITE) {
    { $_ -in "unit", "all" } {
        Write-Host "$BLUE=== Unit Tests ===$NC"
        Run-TestSuite "Unit Tests" "npm run test:run -- --coverage" "reports\unit\"
    }

    { $_ -in "lint", "all" } {
        Write-Host "$BLUE=== Linting ===$NC"
        Run-TestSuite "ESLint" "npm run lint" ""
        Run-TestSuite "TypeScript Check" "npm run type-check" ""
    }

    { $_ -in "e2e", "all" } {
        Write-Host "$BLUE=== E2E Tests ===$NC"
        Run-TestSuite "E2E Tests (Chromium)" "npx playwright test --project=chromium" "playwright-report\"
    }

    { $_ -in "visual", "all" } {
        Write-Host "$BLUE=== Visual Regression Tests ===$NC"
        Run-TestSuite "Visual Tests" "npm run test:visual" "tests\visual\visual-report\"
    }

    { $_ -in "bdd", "all" } {
        Write-Host "$BLUE=== BDD Tests ===$NC"
        Run-TestSuite "Cucumber BDD Tests" "npm run test:bdd" "reports\bdd\"
        Run-TestSuite "Playwright BDD Tests" "npm run test:bdd:playwright" "reports\bdd\"
    }

    { $_ -in "accessibility", "all" } {
        Write-Host "$BLUE=== Accessibility Tests ===$NC"
        Run-TestSuite "Accessibility Tests" "npm run test:accessibility" "reports\accessibility\"
    }

    { $_ -in "integration", "all" } {
        Write-Host "$BLUE=== Integration Tests ===$NC"
        Run-TestSuite "Integration Tests" "npm run test:integration" "reports\integration\"
    }

    default {
        Write-Host "$REDUnknown test suite: $SUITE$NC"
        Write-Host "Available suites: unit, lint, e2e, visual, bdd, accessibility, integration, all"
        exit 1
    }
}

# Summary
Write-Host "$BLUE======================================$NC"
Write-Host "$BLUE   Test Suite Summary$NC"
Write-Host "$BLUE======================================$NC"
Write-Host ""
Write-Host "Total Suites: $script:TOTAL_TESTS"
Write-Host "$GREENPassed: $script:PASSED_TESTS$NC"
Write-Host "$REDFailed: $script:FAILED_TESTS$NC"
Write-Host ""

# Exit with appropriate code
if ($script:FAILED_TESTS -gt 0) {
    Write-Host "$REDSome tests failed. Please review the reports.$NC"
    exit 1
} else {
    Write-Host "$GREENAll tests passed!$NC"
    exit 0
}

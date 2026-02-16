# Smoke Test Script for Staging Environment (PowerShell)

param(
    [string]$ApiUrl = "http://localhost:3001",
    [string]$FrontendUrl = "http://localhost"
)

# Colors
function Write-TestPass {
    param([string]$Message)
    Write-Host "[TEST]" -ForegroundColor Green -NoNewline
    Write-Host " $Message ✓" -ForegroundColor Green
    $script:TestsPassed++
}

function Write-TestFail {
    param([string]$Message)
    Write-Host "[FAIL]" -ForegroundColor Red -NoNewline
    Write-Host " $Message ✗" -ForegroundColor Red
    $script:TestsFailed++
}

function Write-TestInfo {
    param([string]$Message)
    Write-Host "[TEST]" -ForegroundColor Green -NoNewline
    Write-Host " $Message" -ForegroundColor Gray
}

# Initialize counters
$TestsPassed = 0
$TestsFailed = 0

Write-Host "=========================================="
Write-Host "Staging Environment Smoke Tests"
Write-Host "=========================================="
Write-Host "API URL: $ApiUrl"
Write-Host "Frontend URL: $FrontendUrl"
Write-Host ""

###############################################################################
# Health Checks
###############################################################################

Write-TestInfo "Running health checks..."

# Backend Health Check
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/health" -UseBasicParsing -TimeoutSec 10
    if ($response.Content -match "healthy") {
        Write-TestPass "Backend health check"
    } else {
        Write-TestFail "Backend health check"
    }
} catch {
    Write-TestFail "Backend health check ($($_.Exception.Message))"
}

# Database Health Check
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/health/db" -UseBasicParsing -TimeoutSec 10
    if ($response.Content -match "healthy") {
        Write-TestPass "Database health check"
    } else {
        Write-TestFail "Database health check"
    }
} catch {
    Write-TestFail "Database health check ($($_.Exception.Message))"
}

# Frontend Health Check
try {
    $response = Invoke-WebRequest -Uri "$FrontendUrl/health" -UseBasicParsing -TimeoutSec 10
    if ($response.Content -match "healthy") {
        Write-TestPass "Frontend health check"
    } else {
        Write-TestFail "Frontend health check"
    }
} catch {
    Write-TestFail "Frontend health check ($($_.Exception.Message))"
}

###############################################################################
# Authentication Tests
###############################################################################

Write-TestInfo "Testing authentication endpoints..."

$testEmail = "smoke-test-$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$authToken = ""

# Test Registration
try {
    $body = @{
        email = $testEmail
        password = "SmokeTest123!"
        name = "Smoke Test User"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$ApiUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -TimeoutSec 10

    if ($response.StatusCode -eq 201 -or $response.StatusCode -eq 200) {
        Write-TestPass "User registration"

        # Extract token from response
        $json = $response.Content | ConvertFrom-Json
        if ($json.data.token) {
            $authToken = $json.data.token
        }
    } else {
        Write-TestFail "User registration (HTTP $($response.StatusCode))"
    }
} catch {
    Write-TestFail "User registration ($($_.Exception.Message))"
}

# Test Login
if ($authToken) {
    try {
        $body = @{
            email = $testEmail
            password = "SmokeTest123!"
        } | ConvertTo-Json

        $response = Invoke-WebRequest -Uri "$ApiUrl/api/auth/login" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -UseBasicParsing `
            -TimeoutSec 10

        if ($response.StatusCode -eq 200) {
            Write-TestPass "User login"
        } else {
            Write-TestFail "User login (HTTP $($response.StatusCode))"
        }
    } catch {
        Write-TestFail "User login ($($_.Exception.Message))"
    }
}

###############################################################################
# Chart Tests
###############################################################################

Write-TestInfo "Testing chart endpoints..."

$chartId = ""

# Test Chart Creation
if ($authToken) {
    try {
        $body = @{
            name = "Smoke Test Chart"
            birth_date = "1990-01-15"
            birth_time = "14:30"
            birth_place = "New York, NY"
            latitude = 40.7128
            longitude = -74.0060
            timezone = "America/New_York"
            house_system = "placidus"
            zodiac_type = "tropical"
        } | ConvertTo-Json

        $headers = @{
            Authorization = "Bearer $authToken"
        }

        $response = Invoke-WebRequest -Uri "$ApiUrl/api/charts" `
            -Method POST `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $body `
            -UseBasicParsing `
            -TimeoutSec 30

        if ($response.StatusCode -eq 201 -or $response.StatusCode -eq 200) {
            Write-TestPass "Chart creation"

            # Extract chart ID
            $json = $response.Content | ConvertFrom-Json
            if ($json.data.chart.id) {
                $chartId = $json.data.chart.id
            }
        } else {
            Write-TestFail "Chart creation (HTTP $($response.StatusCode))"
        }
    } catch {
        Write-TestFail "Chart creation ($($_.Exception.Message))"
    }
} else {
    Write-TestFail "Chart creation (no auth token)"
}

# Test Chart Retrieval
if ($authToken -and $chartId) {
    try {
        $headers = @{
            Authorization = "Bearer $authToken"
        }

        $response = Invoke-WebRequest -Uri "$ApiUrl/api/charts" `
            -Headers $headers `
            -UseBasicParsing `
            -TimeoutSec 10

        if ($response.StatusCode -eq 200) {
            Write-TestPass "Chart retrieval"
        } else {
            Write-TestFail "Chart retrieval (HTTP $($response.StatusCode))"
        }
    } catch {
        Write-TestFail "Chart retrieval ($($_.Exception.Message))"
    }
}

###############################################################################
# Analysis Tests
###############################################################################

Write-TestInfo "Testing analysis endpoints..."

# Test Personality Analysis
if ($authToken -and $chartId) {
    try {
        $headers = @{
            Authorization = "Bearer $authToken"
        }

        $response = Invoke-WebRequest -Uri "$ApiUrl/api/analysis/$chartId/personality" `
            -Headers $headers `
            -UseBasicParsing `
            -TimeoutSec 30

        if ($response.StatusCode -eq 200) {
            Write-TestPass "Personality analysis"
        } else {
            Write-TestFail "Personality analysis (HTTP $($response.StatusCode))"
        }
    } catch {
        Write-TestFail "Personality analysis ($($_.Exception.Message))"
    }
}

# Test Transit Calculation
if ($authToken -and $chartId) {
    try {
        $headers = @{
            Authorization = "Bearer $authToken"
        }

        $response = Invoke-WebRequest -Uri "$ApiUrl/api/analysis/$chartId/transits?start_date=2024-01-01&end_date=2024-01-07" `
            -Headers $headers `
            -UseBasicParsing `
            -TimeoutSec 30

        if ($response.StatusCode -eq 200) {
            Write-TestPass "Transit calculation"
        } else {
            Write-TestFail "Transit calculation (HTTP $($response.StatusCode))"
        }
    } catch {
        Write-TestFail "Transit calculation ($($_.Exception.Message))"
    }
}

###############################################################################
# Performance Tests
###############################################################################

Write-TestInfo "Testing response times..."

# Backend Response Time
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    Invoke-WebRequest -Uri "$ApiUrl/health" -UseBasicParsing -TimeoutSec 10 | Out-Null
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds

    if ($responseTime -lt 500) {
        Write-TestPass "Backend response time (${responseTime}ms < 500ms)"
    } else {
        Write-TestFail "Backend response time (${responseTime}ms >= 500ms)"
    }
} catch {
    $stopwatch.Stop()
    Write-TestFail "Backend response time ($($_.Exception.Message))"
}

###############################################################################
# Summary
###############################################################################

Write-Host ""
Write-Host "=========================================="
Write-Host "Test Summary"
Write-Host "=========================================="
Write-Host "Tests Passed: $TestsPassed"
Write-Host "Tests Failed: $TestsFailed"
Write-Host "Total Tests:  $($TestsPassed + $TestsFailed)"
Write-Host ""

if ($TestsFailed -eq 0) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
    exit 1
}

# Staging Deployment Script for Astrology SaaS Platform (PowerShell)

param(
    [switch]$SkipTests = $false
)

# Colors
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Log-Info {
    Write-ColorOutput Green "[INFO] $args"
}

function Log-Warn {
    Write-ColorOutput Yellow "[WARN] $args"
}

function Log-Error {
    Write-ColorOutput Red "[ERROR] $args"
}

# Check prerequisites
function Test-Prerequisites {
    Log-Info "Checking prerequisites..."

    # Check Docker
    $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $dockerCmd) {
        Log-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }

    # Check Docker Compose
    $composeVersion = docker compose version 2>&1
    if ($LASTEXITCODE -ne 0 -and -not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Log-Error "Docker Compose is not available."
        exit 1
    }

    # Check if .env.staging exists
    if (-not (Test-Path .env.staging)) {
        Log-Warn ".env.staging file not found. Creating from template..."
        Copy-Item .env.staging.example .env.staging
        Log-Warn "Please edit .env.staging with your staging values before proceeding."
        Log-Warn "Run this script again after configuring .env.staging"
        exit 1
    }

    # Load and validate environment variables
    Get-Content .env.staging | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            Set-Variable -Name $name -Value $value -Scope Script
        }
    }

    # Validate critical variables
    if ($POSTGRES_PASSWORD -eq "CHANGE_THIS_SECURE_PASSWORD_FOR_STAGING_DB") {
        Log-Error "Please update POSTGRES_PASSWORD in .env.staging"
        exit 1
    }

    if ($JWT_SECRET -eq "CHANGE_THIS_STAGING_JWT_SECRET_MIN_32_CHARS") {
        Log-Error "Please update JWT_SECRET in .env.staging"
        exit 1
    }

    Log-Info "Prerequisites check passed ✓"
}

# Build Docker images
function Build-Images {
    Log-Info "Building Docker images..."

    # Use docker compose if available
    if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
        docker-compose -f docker-compose.staging.yml build
    } else {
        docker compose -f docker-compose.staging.yml build
    }

    if ($LASTEXITCODE -ne 0) {
        Log-Error "Docker build failed"
        exit 1
    }

    Log-Info "Docker images built successfully ✓"
}

# Start staging environment
function Start-Staging {
    Log-Info "Starting staging environment..."

    if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
        docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d
    } else {
        docker compose -f docker-compose.staging.yml --env-file .env.staging up -d
    }

    if ($LASTEXITCODE -ne 0) {
        Log-Error "Failed to start services"
        exit 1
    }

    Log-Info "Staging environment started ✓"
}

# Wait for services
function Wait-ForServices {
    Log-Info "Waiting for services to be healthy..."

    Start-Sleep -Seconds 10

    # Wait for backend
    Log-Info "Waiting for Backend API..."
    $maxRetries = 30
    $retryCount = 0
    $backendHealthy = $false

    while ($retryCount -lt $maxRetries -and -not $backendHealthy) {
        try {
            $response = Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($response.Content -match "healthy") {
                $backendHealthy = $true
                Log-Info "Backend API is healthy ✓"
            }
        } catch {
            Write-Host -NoNewline "."
        }
        $retryCount++
        Start-Sleep -Seconds 2
    }

    if (-not $backendHealthy) {
        Log-Error "Backend API failed to start. Check logs."
        exit 1
    }

    # Wait for frontend
    Log-Info "Waiting for Frontend..."
    $retryCount = 0
    $frontendHealthy = $false

    while ($retryCount -lt $maxRetries -and -not $frontendHealthy) {
        try {
            $response = Invoke-WebRequest -Uri http://localhost/health -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
            if ($response.Content -match "healthy") {
                $frontendHealthy = $true
                Log-Info "Frontend is healthy ✓"
            }
        } catch {
            Write-Host -NoNewline "."
        }
        $retryCount++
        Start-Sleep -Seconds 2
    }

    if (-not $frontendHealthy) {
        Log-Error "Frontend failed to start. Check logs."
        exit 1
    }

    Log-Info "All services are healthy ✓"
}

# Run smoke tests
function Test-SmokeTests {
    if ($SkipTests) {
        Log-Warn "Skipping smoke tests..."
        return
    }

    Log-Info "Running smoke tests..."

    # Test backend health
    Log-Info "Testing backend health endpoint..."
    $healthResponse = Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing
    if ($healthResponse.Content -match "healthy") {
        Log-Info "Backend health check passed ✓"
    } else {
        Log-Error "Backend health check failed"
        exit 1
    }

    # Test database health
    Log-Info "Testing database health endpoint..."
    $dbHealthResponse = Invoke-WebRequest -Uri http://localhost:3001/health/db -UseBasicParsing
    if ($dbHealthResponse.Content -match "healthy") {
        Log-Info "Database health check passed ✓"
    } else {
        Log-Error "Database health check failed"
        exit 1
    }

    # Test frontend
    Log-Info "Testing frontend..."
    $frontendResponse = Invoke-WebRequest -Uri http://localhost/health -UseBasicParsing
    if ($frontendResponse.Content -match "healthy") {
        Log-Info "Frontend health check passed ✓"
    } else {
        Log-Error "Frontend health check failed"
        exit 1
    }

    Log-Info "All smoke tests passed ✓"
}

# Display info
function Show-DeploymentInfo {
    Write-Host ""
    Log-Info "=========================================="
    Log-Info "STAGING DEPLOYMENT SUCCESSFUL"
    Log-Info "=========================================="
    Write-Host ""
    Log-Info "Services are now running:"
    Log-Info "  Frontend:  http://localhost"
    Log-Info "  Backend:   http://localhost:3001"
    Log-Info "  Database:  localhost:5432"
    Write-Host ""
    Log-Info "Useful commands:"
    if (Get-Command "docker-compose" -ErrorAction SilentlyContinue) {
        Log-Info "  View logs:   docker-compose -f docker-compose.staging.yml logs -f"
        Log-Info "  Stop all:    docker-compose -f docker-compose.staging.yml down"
    } else {
        Log-Info "  View logs:   docker compose -f docker-compose.staging.yml logs -f"
        Log-Info "  Stop all:    docker compose -f docker-compose.staging.yml down"
    }
    Write-Host ""
    Log-Info "Next steps:"
    Log-Info "  1. Open http://localhost in your browser"
    Log-Info "  2. Test user registration and chart creation"
    Log-Info "  3. Run performance tests against staging"
    Write-Host ""
}

# Main
function Main {
    Log-Info "Starting staging deployment..."
    Write-Host ""

    Test-Prerequisites
    Build-Images
    Start-Staging
    Wait-ForServices
    Test-SmokeTests
    Show-DeploymentInfo
}

# Run main
Main

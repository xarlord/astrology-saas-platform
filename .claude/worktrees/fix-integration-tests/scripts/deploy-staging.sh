#!/bin/bash

###############################################################################
# Staging Deployment Script for Astrology SaaS Platform
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if .env.staging exists
    if [ ! -f .env.staging ]; then
        log_warn ".env.staging file not found. Creating from template..."
        cp .env.staging.example .env.staging
        log_warn "Please edit .env.staging with your staging values before proceeding."
        log_warn "Run this script again after configuring .env.staging"
        exit 1
    fi

    # Source environment variables
    source .env.staging

    # Validate critical environment variables
    if [ "$POSTGRES_PASSWORD" = "CHANGE_THIS_SECURE_PASSWORD_FOR_STAGING_DB" ]; then
        log_error "Please update POSTGRES_PASSWORD in .env.staging"
        exit 1
    fi

    if [ "$JWT_SECRET" = "CHANGE_THIS_STAGING_JWT_SECRET_MIN_32_CHARS" ]; then
        log_error "Please update JWT_SECRET in .env.staging"
        exit 1
    fi

    log_info "Prerequisites check passed ✓"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."

    # Determine docker compose command
    DOCKER_COMPOSE="docker-compose"
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    fi

    # Build images
    $DOCKER_COMPOSE -f docker-compose.staging.yml build

    log_info "Docker images built successfully ✓"
}

# Start staging environment
start_staging() {
    log_info "Starting staging environment..."

    # Determine docker compose command
    DOCKER_COMPOSE="docker-compose"
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    fi

    # Start services
    $DOCKER_COMPOSE -f docker-compose.staging.yml --env-file .env.staging up -d

    log_info "Staging environment started ✓"
}

# Wait for services to be healthy
wait_for_services() {
    log_info "Waiting for services to be healthy..."

    # Wait for PostgreSQL
    log_info "Waiting for PostgreSQL..."
    sleep 10

    # Wait for Backend
    log_info "Waiting for Backend API..."
    MAX_RETRIES=30
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            log_info "Backend API is healthy ✓"
            break
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -n "."
        sleep 2
    done

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        log_error "Backend API failed to start. Check logs with: docker-compose -f docker-compose.staging.yml logs backend"
        exit 1
    fi

    # Wait for Frontend
    log_info "Waiting for Frontend..."
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -s http://localhost/health > /dev/null 2>&1; then
            log_info "Frontend is healthy ✓"
            break
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -n "."
        sleep 2
    done

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        log_error "Frontend failed to start. Check logs with: docker-compose -f docker-compose.staging.yml logs frontend"
        exit 1
    fi

    log_info "All services are healthy ✓"
}

# Run smoke tests
run_smoke_tests() {
    log_info "Running smoke tests..."

    # Test backend health
    log_info "Testing backend health endpoint..."
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
    if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
        log_info "Backend health check passed ✓"
    else
        log_error "Backend health check failed"
        exit 1
    fi

    # Test database health
    log_info "Testing database health endpoint..."
    DB_HEALTH_RESPONSE=$(curl -s http://localhost:3001/health/db)
    if echo "$DB_HEALTH_RESPONSE" | grep -q "healthy"; then
        log_info "Database health check passed ✓"
    else
        log_error "Database health check failed"
        exit 1
    fi

    # Test frontend
    log_info "Testing frontend..."
    FRONTEND_RESPONSE=$(curl -s http://localhost/health)
    if echo "$FRONTEND_RESPONSE" | grep -q "healthy"; then
        log_info "Frontend health check passed ✓"
    else
        log_error "Frontend health check failed"
        exit 1
    fi

    log_info "All smoke tests passed ✓"
}

# Display deployment info
display_info() {
    echo ""
    log_info "=========================================="
    log_info "STAGING DEPLOYMENT SUCCESSFUL"
    log_info "=========================================="
    echo ""
    log_info "Services are now running:"
    echo "  Frontend:  http://localhost"
    echo "  Backend:   http://localhost:3001"
    echo "  Database:  localhost:5432"
    echo ""
    log_info "Useful commands:"
    echo "  View logs:   docker-compose -f docker-compose.staging.yml logs -f"
    echo "  Stop all:    docker-compose -f docker-compose.staging.yml down"
    echo "  Restart:     docker-compose -f docker-compose.staging.yml restart"
    echo ""
    log_info "Next steps:"
    echo "  1. Open http://localhost in your browser"
    echo "  2. Test user registration and chart creation"
    echo "  3. Run performance tests against staging"
    echo ""
}

# Main deployment flow
main() {
    log_info "Starting staging deployment..."
    echo ""

    check_prerequisites
    build_images
    start_staging
    wait_for_services
    run_smoke_tests
    display_info
}

# Run main function
main

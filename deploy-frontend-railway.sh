#!/bin/bash
###############################################################################
# Frontend Deployment Script - Railway Production
###############################################################################
# WHAT: Automate frontend deployment to Railway
# WHY: Ensure consistent, error-free deployments
# WHEN: Use after Railway CLI is authenticated
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="frontend"
PROJECT_ROOT=$(pwd)

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI is not installed"
        log_info "Install it with: npm install -g @railway/cli"
        exit 1
    fi
    log_success "Railway CLI is installed"

    # Check if logged in
    if ! railway whoami &> /dev/null; then
        log_error "Not logged in to Railway"
        log_info "Please login with: railway login"
        exit 1
    fi
    log_success "Logged in to Railway"

    # Check if frontend directory exists
    if [ ! -d "$FRONTEND_DIR" ]; then
        log_error "Frontend directory not found: $FRONTEND_DIR"
        exit 1
    fi
    log_success "Frontend directory exists"

    # Check if railway.json exists
    if [ ! -f "$FRONTEND_DIR/railway.json" ]; then
        log_error "railway.json not found in frontend directory"
        exit 1
    fi
    log_success "Railway configuration exists"
}

# Verify frontend build
verify_build() {
    print_header "Verifying Frontend Build"

    cd "$FRONTEND_DIR"

    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    log_success "Dependencies installed"

    # Run type check
    log_info "Running type check..."
    npm run type-check
    log_success "Type check passed"

    # Build frontend
    log_info "Building frontend..."
    npm run build
    log_success "Frontend built successfully"

    # Check if dist folder exists
    if [ ! -d "dist" ]; then
        log_error "Build failed - dist directory not created"
        exit 1
    fi
    log_success "Build output verified"

    cd "$PROJECT_ROOT"
}

# Get backend URL
get_backend_url() {
    print_header "Getting Backend URL"

    # Try to get backend URL from Railway
    BACKEND_URL=$(railway variables --service backend 2>/dev/null | grep -i "FRONTEND_URL\|BACKEND_URL" || echo "")

    if [ -z "$BACKEND_URL" ]; then
        log_warning "Could not automatically detect backend URL"
        echo ""
        read -p "Enter backend URL (e.g., https://your-backend.up.railway.app): " BACKEND_URL

        if [ -z "$BACKEND_URL" ]; then
            log_error "Backend URL is required"
            exit 1
        fi
    fi

    log_success "Backend URL: $BACKEND_URL"
}

# Deploy frontend
deploy_frontend() {
    print_header "Deploying Frontend to Railway"

    cd "$FRONTEND_DIR"

    # Check if project is linked
    if ! railway status &> /dev/null; then
        log_info "Linking to Railway project..."
        railway link
        log_success "Project linked"
    fi

    # Set environment variable
    log_info "Setting VITE_API_URL environment variable..."
    railway variables set VITE_API_URL="$BACKEND_URL"
    log_success "Environment variable set"

    # Deploy
    log_info "Deploying frontend to Railway..."
    railway up
    log_success "Deployment started"

    cd "$PROJECT_ROOT"
}

# Wait for deployment
wait_for_deployment() {
    print_header "Waiting for Deployment"

    log_info "Waiting for deployment to complete..."
    log_info "This may take 3-5 minutes..."

    # Monitor deployment status
    TIMEOUT=300  # 5 minutes
    ELAPSED=0
    INTERVAL=10

    while [ $ELAPSED -lt $TIMEOUT ]; do
        # Check deployment status
        if railway status &> /dev/null; then
            # Get deployment status
            STATUS=$(railway status 2>/dev/null || echo "pending")

            if echo "$STATUS" | grep -q "healthy\|active\|ready"; then
                log_success "Deployment completed successfully!"
                break
            fi
        fi

        echo -n "."
        sleep $INTERVAL
        ELAPSED=$((ELAPSED + INTERVAL))
    done

    echo ""

    if [ $ELAPSED -ge $TIMEOUT ]; then
        log_warning "Deployment timed out"
        log_info "Check Railway dashboard for status"
    fi
}

# Get frontend URL
get_frontend_url() {
    print_header "Getting Frontend URL"

    FRONTEND_URL=$(railway domain 2>/dev/null || echo "")

    if [ -z "$FRONTEND_URL" ]; then
        log_warning "Could not get frontend URL automatically"
        echo ""
        log_info "Please get the URL from Railway dashboard"
        return
    fi

    log_success "Frontend URL: $FRONTEND_URL"
    echo ""
    log_info "Add this to your PRODUCTION_URLS.md"
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"

    if [ -z "$FRONTEND_URL" ]; then
        log_warning "Skipping verification - no frontend URL"
        return
    fi

    # Test frontend URL
    log_info "Testing frontend URL..."
    if curl -f -s -o /dev/null "$FRONTEND_URL"; then
        log_success "Frontend is accessible!"
    else
        log_error "Frontend is not accessible"
        log_info "Please check Railway logs for errors"
    fi

    # Test health endpoint
    log_info "Testing backend health..."
    BACKEND_HEALTH=$(curl -s "$BACKEND_URL/health" || echo "")
    if echo "$BACKEND_HEALTH" | grep -q "healthy"; then
        log_success "Backend is healthy!"
    else
        log_warning "Backend health check failed or not accessible"
    fi

    # Test API connectivity
    log_info "Testing API connectivity..."
    API_TEST=$(curl -s "$BACKEND_URL/api/v1/health" || echo "")
    if [ -n "$API_TEST" ]; then
        log_success "API is accessible!"
    else
        log_warning "API connectivity test failed"
    fi
}

# Update documentation
update_documentation() {
    print_header "Updating Documentation"

    if [ -z "$FRONTEND_URL" ]; then
        log_warning "Skipping documentation update - no frontend URL"
        return
    fi

    # Update PRODUCTION_URLS.md
    if [ -f "PRODUCTION_URLS.md" ]; then
        log_info "Updating PRODUCTION_URLS.md..."

        # Create backup
        cp PRODUCTION_URLS.md PRODUCTION_URLS.md.backup

        # Replace placeholder URLs
        sed -i "s|https://your-frontend.up.railway.app|$FRONTEND_URL|g" PRODUCTION_URLS.md
        sed -i "s|https://your-backend.up.railway.app|$BACKEND_URL|g" PRODUCTION_URLS.md

        # Update deployment date
        sed -i "s|YYYY-MM-DD|$(date +%Y-%m-%d)|g" PRODUCTION_URLS.md

        log_success "Documentation updated"
    fi
}

# Print summary
print_summary() {
    print_header "Deployment Summary"

    echo ""
    echo -e "${GREEN}✅ Frontend Deployment Complete!${NC}"
    echo ""
    echo "Frontend URL:"
    echo -e "${BLUE}$FRONTEND_URL${NC}"
    echo ""
    echo "Backend URL:"
    echo -e "${BLUE}$BACKEND_URL${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Open frontend URL in browser"
    echo "2. Verify all features work"
    echo "3. Run smoke tests"
    echo "4. Update documentation"
    echo "5. Share URLs with team"
    echo ""
    echo "Useful Commands:"
    echo "  railway logs              # View logs"
    echo "  railway open              # Open dashboard"
    echo "  railway status            # Check status"
    echo "  railway variables         # Manage env vars"
    echo ""
}

# Main execution
main() {
    print_header "Frontend Deployment - Railway Production"

    log_info "Starting deployment process..."

    check_prerequisites
    verify_build
    get_backend_url
    deploy_frontend
    wait_for_deployment
    get_frontend_url
    verify_deployment
    update_documentation
    print_summary

    log_success "Deployment process completed!"
}

# Run main function
main

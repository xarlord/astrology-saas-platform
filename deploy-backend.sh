#!/bin/bash

# Railway Backend Deployment Script
# This script helps deploy the backend to Railway production

set -e

echo "==================================="
echo "Backend Deployment to Railway"
echo "==================================="
echo ""

# Check if Railway CLI is installed
if command -v railway &> /dev/null; then
    echo "✓ Railway CLI is installed"

    # Login to Railway
    echo ""
    echo "Please login to Railway..."
    railway login

    # Link or create project
    if [ -f ".railway/project_id" ]; then
        echo "✓ Railway project already linked"
        railway up
    else
        echo "Creating new Railway project..."
        railway init
        railway up
    fi

    # Get project URL
    echo ""
    echo "Waiting for deployment to complete..."
    sleep 10

    echo ""
    echo "==================================="
    echo "Deployment Details:"
    railway domain
    echo ""
    echo "Variables:"
    railway variables

    echo ""
    echo "==================================="
    echo "Next Steps:"
    echo "1. Set environment variables in Railway dashboard"
    echo "2. Run migrations: railway run npx knex migrate:latest"
    echo "3. Test health endpoint"
    echo "==================================="

else
    echo "✗ Railway CLI is not installed"
    echo ""
    echo "Please choose one of the following options:"
    echo ""
    echo "Option 1: Install Railway CLI (Recommended)"
    echo "  npm install -g @railway/cli"
    echo "  railway login"
    echo "  cd backend"
    echo "  railway up"
    echo ""
    echo "Option 2: Deploy via GitHub (Easiest)"
    echo "  1. Visit https://railway.app/new"
    echo "  2. Click 'Deploy from GitHub repo'"
    echo "  3. Select 'xarlord/astrology-saas-platform'"
    echo "  4. Click 'Deploy'"
    echo ""
    echo "After deployment:"
    echo "  1. Add environment variables in Railway dashboard"
    echo "  2. Run migrations: npx knex migrate:latest"
    echo "  3. Test: curl https://your-backend-url.railway.app/health"
    echo ""
fi

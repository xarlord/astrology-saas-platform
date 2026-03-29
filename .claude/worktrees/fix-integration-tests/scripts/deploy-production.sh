#!/bin/bash

# Railway Production Deployment Script
# Automates deployment to Railway

set -e

echo "=========================================="
echo "  Railway Production Deployment"
echo "=========================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g railway
    echo "✅ Railway CLI installed"
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login || echo "⚠️  Already logged in"

# Initialize Railway project
echo "📦 Initializing Railway project..."
railway init || echo "⚠️  Project already initialized"

# Link to GitHub repo
echo "🔗 Linking to GitHub repository..."
railway link || echo "⚠️  Already linked"

# Add PostgreSQL database
echo "💾 Adding PostgreSQL database..."
railway add postgres || echo "⚠️  Database already exists"

# Get database URL
DATABASE_URL=$(railway variables get DATABASE_URL 2>/dev/null || echo "")
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Database URL not found. Please add PostgreSQL service first."
    echo "Run: railway add postgres"
    exit 1
fi

echo "✅ Database configured"
echo "   DATABASE_URL: ${DATABASE_URL:0:20}..."

# Deploy backend
echo ""
echo "=========================================="
echo "  Deploying Backend"
echo "=========================================="

# Create backend service
echo "📦 Creating backend service..."
railway up --service backend || echo "⚠️  Backend service already exists"

# Set backend environment variables
echo "🔧 Setting backend environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set DATABASE_URL="$DATABASE_URL"
railway variables set DB_POOL_MIN=2
railway variables set DB_POOL_MAX=10

# Generate JWT_SECRET if not exists
JWT_SECRET=$(railway variables get JWT_SECRET 2>/dev/null || echo "")
if [ -z "$JWT_SECRET" ]; then
    echo "🔐 Generating JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 32)
    railway variables set JWT_SECRET="$JWT_SECRET"
    echo "✅ JWT_SECRET generated and set"
else
    echo "✅ JWT_SECRET already set"
fi

railway variables set JWT_EXPIRES_IN=1h
railway variables set JWT_REFRESH_EXPIRES_IN=7d
railway variables set EPHEMERIS_PATH=./ephemeris
railway variables set LOG_LEVEL=info
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100

# Set ALLOWED_ORIGINS placeholder
echo "⚠️  Please set ALLOWED_ORIGINS with your frontend URL"
echo "   Run: railway variables set ALLOWED_ORIGINS=https://your-frontend-domain.railway.app"

# Deploy backend
echo "🚀 Deploying backend..."
railway up

# Get backend URL
BACKEND_URL=$(railway domain --service backend 2>/dev/null || echo "")
if [ -n "$BACKEND_URL" ]; then
    echo "✅ Backend deployed to: $BACKEND_URL"
else
    echo "⚠️  Backend URL not available yet. Check Railway dashboard."
fi

# Deploy frontend
echo ""
echo "=========================================="
echo "  Deploying Frontend"
echo "=========================================="

# Create frontend service
echo "📦 Creating frontend service..."
railway up --service frontend || echo "⚠️  Frontend service already exists"

# Set frontend environment variables
if [ -n "$BACKEND_URL" ]; then
    echo "🔧 Setting frontend environment variables..."
    railway variables --service frontend set VITE_API_URL="$BACKEND_URL"
    echo "✅ VITE_API_URL set to: $BACKEND_URL"
else
    echo "⚠️  Please set VITE_API_URL after backend is deployed"
    echo "   Run: railway variables --service frontend set VITE_API_URL=https://your-backend-domain.railway.app"
fi

# Deploy frontend
echo "🚀 Deploying frontend..."
railway up --service frontend

# Get frontend URL
FRONTEND_URL=$(railway domain --service frontend 2>/dev/null || echo "")
if [ -n "$FRONTEND_URL" ]; then
    echo "✅ Frontend deployed to: $FRONTEND_URL"
else
    echo "⚠️  Frontend URL not available yet. Check Railway dashboard."
fi

# Run migrations
echo ""
echo "=========================================="
echo "  Running Database Migrations"
echo "=========================================="

echo "📋 Running migrations..."
railway run "npm run db:migrate" --service backend || echo "⚠️  Migrations may have already run"

echo "🌱 Seeding database..."
railway run "npm run db:seed" --service backend || echo "⚠️  Seeds may have already run"

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "🎉 Your application is deployed!"
echo ""
echo "📍 URLs:"
if [ -n "$BACKEND_URL" ]; then
    echo "   Backend:  $BACKEND_URL"
fi
if [ -n "$FRONTEND_URL" ]; then
    echo "   Frontend: $FRONTEND_URL"
fi
echo ""
echo "📊 Dashboard: https://railway.app"
echo ""
echo "🧪 To run smoke tests:"
echo "   API_BASE_URL=$BACKEND_URL npm run test:smoke"
echo ""
echo "📝 Next steps:"
echo "   1. Update ALLOWED_ORIGINS with your frontend URL"
echo "   2. Configure custom domain (optional)"
echo "   3. Run smoke tests to verify deployment"
echo "   4. Set up monitoring and error tracking"
echo ""

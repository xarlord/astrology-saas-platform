#!/bin/bash

# Start Backend Server for E2E Tests
# This script starts the backend server with test environment configuration

echo "🚀 Starting backend server for E2E tests..."

# Load test environment
export $(cat .env.test | grep -v '^#' | xargs)

# Override NODE_ENV to ensure CSRF is disabled
export NODE_ENV=test

echo "📋 Environment configuration:"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - PORT: $PORT"
echo "  - Database: $DATABASE_URL"

# Start the server
echo "Starting server..."
npm start
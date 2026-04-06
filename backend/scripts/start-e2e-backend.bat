@echo off
REM Start Backend Server for E2E Tests (Windows)
REM This script starts the backend server with test environment configuration

echo 🚀 Starting backend server for E2E tests...

REM Load test environment and set NODE_ENV=test
set NODE_ENV=test
set PORT=3001
set DATABASE_URL=postgresql://postgres:astrology123@localhost:5434/astrology_saas_test
set CSRF_SECRET=test-super-secret-csrf-key-for-testing-only
set JWT_SECRET=test-super-secret-jwt-key-for-testing-only

echo 📋 Environment configuration:
echo   - NODE_ENV: %NODE_ENV%
echo   - PORT: %PORT%
echo   - Database: %DATABASE_URL%

REM Start the server
echo Starting server...
npm start
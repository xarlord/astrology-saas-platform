#!/bin/bash
# scripts/pre-push-check.sh — Local quality gate: run before every git push
set -e

echo "🔍 Running local quality gate..."
echo ""

echo "1️⃣ Type checking..."
cd frontend && npx tsc --noEmit
echo "   ✅ Types clean"

echo "2️⃣ Linting..."
npm run lint
echo "   ✅ Lint clean"

echo "3️⃣ Unit tests..."
npm run test:run
echo "   ✅ Tests pass"

echo ""
echo "🎉 All checks passed — safe to push!"

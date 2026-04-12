#!/bin/bash

# Stripe Webhook Testing Script
# This script tests the Stripe webhook endpoint without requiring actual Stripe credentials

set -e

BASE_URL="http://localhost:3001/api/v1"
WEBHOOK_URL="$BASE_URL/billing/webhook"

echo "🧪 Stripe Webhook Testing Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if backend server is running..."
if ! curl -s "$BASE_URL/../health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend server is not running${NC}"
    echo "Please start the backend server first: cd backend && npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Backend server is running${NC}"
echo ""

# Test 1: Plans endpoint
echo "📋 Test 1: GET /billing/plans"
echo "----------------------------"
PLANS_RESPONSE=$(curl -s "$BASE_URL/billing/plans")
if echo "$PLANS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Plans endpoint working${NC}"
    echo "$PLANS_RESPONSE" | head -5
else
    echo -e "${RED}❌ Plans endpoint failed${NC}"
fi
echo ""

# Test 2: Webhook endpoint without signature (should fail)
echo "🔐 Test 2: POST /billing/webhook (no signature)"
echo "------------------------------------------------"
echo "Sending webhook without signature (should return 400)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"type":"test","data":{}}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Webhook correctly rejects requests without signature${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected response code: $HTTP_CODE${NC}"
fi
echo ""

# Test 3: Webhook endpoint with invalid signature (should fail)
echo "🔐 Test 3: POST /billing/webhook (invalid signature)"
echo "----------------------------------------------------"
echo "Sending webhook with invalid signature (should return 400)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid_signature" \
  -d '{"type":"test","data":{}}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Webhook correctly rejects requests with invalid signature${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected response code: $HTTP_CODE${NC}"
fi
echo ""

# Test 4: Instructions for real webhook testing
echo "📝 Real Webhook Testing Instructions"
echo "------------------------------------"
echo "To test webhooks with real Stripe events:"
echo ""
echo "1. Install Stripe CLI: https://stripe.com/docs/stripe-cli"
echo "2. Login: stripe login"
echo "3. Forward webhooks:"
echo "   stripe listen --forward-to localhost:3001/api/v1/billing/webhook"
echo ""
echo "4. The CLI will display a webhook signing secret (whsec_...)"
echo "5. Add it to your .env: STRIPE_WEBHOOK_SECRET=whsec_..."
echo "6. Restart the backend server"
echo "7. Trigger test events:"
echo "   stripe trigger checkout.session.completed"
echo "   stripe trigger customer.subscription.updated"
echo "   stripe trigger invoice.payment_succeeded"
echo ""

# Test 5: Instructions for checkout flow testing
echo "🛒 Checkout Flow Testing Instructions"
echo "-------------------------------------"
echo "To test the complete checkout flow:"
echo ""
echo "1. Get Stripe test keys from: https://dashboard.stripe.com/test/apikeys"
echo "2. Create test products and prices in Stripe Dashboard"
echo "3. Add keys to .env:"
echo "   STRIPE_SECRET_KEY=sk_test_..."
echo "   STRIPE_PRO_PRICE_ID=price_..."
echo "   STRIPE_PREMIUM_PRICE_ID=price_..."
echo "4. Create a user and get JWT token"
echo "5. Create checkout session:"
echo "   curl -X POST $BASE_URL/billing/checkout \\"
echo "     -H \"Authorization: Bearer JWT_TOKEN\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"priceId\":\"price_PRO_PRICE_ID\"}'"
echo "6. Open the returned URL in your browser"
echo "7. Complete test checkout with card: 4242 4242 4242 4242"
echo "8. Webhook will be triggered automatically"
echo ""

# Test 6: Current configuration status
echo "🔧 Current Configuration Status"
echo "-------------------------------"
if [ -f "../.env" ]; then
    if grep -q "STRIPE_SECRET_KEY" "../.env"; then
        if grep -q "sk_test_" "../.env"; then
            echo -e "${GREEN}✅ Stripe test secret key configured${NC}"
        else
            echo -e "${YELLOW}⚠️  Stripe key exists but may not be a test key${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  STRIPE_SECRET_KEY not configured${NC}"
    fi

    if grep -q "STRIPE_WEBHOOK_SECRET" "../.env"; then
        echo -e "${GREEN}✅ Stripe webhook secret configured${NC}"
    else
        echo -e "${YELLOW}⚠️  STRIPE_WEBHOOK_SECRET not configured${NC}"
    fi

    if grep -q "STRIPE_PRO_PRICE_ID" "../.env"; then
        echo -e "${GREEN}✅ Stripe Pro price ID configured${NC}"
    else
        echo -e "${YELLOW}⚠️  STRIPE_PRO_PRICE_ID not configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No .env file found${NC}"
fi
echo ""

echo "✨ Testing complete!"
echo ""
echo "For full setup instructions, see: backend/docs/stripe-setup.md"

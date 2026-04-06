# Stripe Local Testing Guide

This guide explains how to set up Stripe for local development and testing of the AstroVerse billing system.

## Prerequisites

- Node.js installed
- Docker and Docker Compose (for local PostgreSQL and Redis)
- Stripe account (free account works for testing)

## Step 1: Get Stripe Test Keys

1. Sign up for a [Stripe account](https://stripe.com) if you don't have one
2. Go to the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
3. Copy the following **test mode** keys:
   - **Publishable key**: Starts with `pk_test_`
   - **Secret key**: Starts with `sk_test_`
   - **Webhook signing secret**: We'll generate this in Step 3

## Step 2: Create Test Products and Prices

1. In the Stripe Dashboard, go to **Products** → **Add product**
2. Create a **Pro Plan** product:
   - Name: "Pro Plan"
   - Price: $9.99/month
   - Copy the resulting **Price ID** (starts with `price_`)
3. Create a **Premium Plan** product:
   - Name: "Premium Plan"
   - Price: $19.99/month
   - Copy the resulting **Price ID**

## Step 3: Set Up Local Webhooks

Using the Stripe CLI is the easiest way to test webhooks locally:

### Install Stripe CLI

```bash
# On Windows with Chocolatey
choco install stripe-cli

# Or download from: https://stripe.com/docs/stripe-cli
```

### Login to Stripe

```bash
stripe login
```

This will open your browser to authenticate.

### Forward Webhooks to Local Backend

```bash
# Start the backend first (should be running on port 3001)
cd backend
npm run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3001/api/v1/billing/webhook
```

The CLI will display a webhook signing secret (starts with `whsec_`). Copy this.

## Step 4: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_12345...
STRIPE_WEBHOOK_SECRET=whsec_12345...
STRIPE_PRO_PRICE_ID=price_12345...
STRIPE_PREMIUM_PRICE_ID=price_67890...
```

Replace with your actual keys from Steps 2 and 3.

## Step 5: Test the Integration

### 1. Test Plan Listing

```bash
curl http://localhost:3001/api/v1/billing/plans
```

### 2. Test Checkout Flow

You'll need a valid JWT token for authenticated requests:

```bash
# Create checkout session (replace JWT_TOKEN)
curl -X POST http://localhost:3001/api/v1/billing/checkout \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_PRO_PRICE_ID"}'
```

This returns a URL. Open it in your browser to complete the test checkout.

### 3. Test Webhooks

After completing checkout, the Stripe CLI will forward webhook events to your local server. Check the backend logs to see:
- Webhook signature verification
- Subscription activation
- User plan update

### 4. Test Customer Portal

```bash
# Create portal session (replace JWT_TOKEN)
curl -X POST http://localhost:3001/api/v1/billing/portal \
  -H "Authorization: Bearer JWT_TOKEN"
```

### 5. Test Plan Limits

```bash
# Check your current plan
curl http://localhost:3001/api/v1/billing/subscription \
  -H "Authorization: Bearer JWT_TOKEN"
```

## Testing Plan Enforcement

The system enforces these limits:

### Free Plan
- Max 3 natal charts
- Max 5 AI interpretations per month

### Pro Plan
- Max 25 natal charts
- Unlimited AI interpretations

### Premium Plan
- Unlimited natal charts
- Unlimited AI interpretations

To test the limits:
1. Create charts until you hit your plan limit
2. Try AI interpretations until you hit the monthly limit (Free only)
3. You should receive 403 Forbidden with an upgrade message when limits are exceeded

## Stripe Test Mode Tips

- Use Stripe test card numbers: https://stripe.com/docs/testing
- Card: `4242 4242 4242 4242` (success)
- Card: `4000 0000 0000 0002` (card declined)
- Email: any email works in test mode
- No real money is charged in test mode

## Troubleshooting

### "STRIPE_SECRET_KEY is not configured"
- Make sure your `.env` file exists and has the `STRIPE_SECRET_KEY` variable
- Restart the backend after adding the key

### "No Stripe webhook secret configured"
- Run `stripe listen --forward-to localhost:3001/api/v1/billing/webhook` to get the webhook secret
- Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

### Webhook signature verification fails
- Make sure the webhook secret in your `.env` matches what `stripe listen` displays
- Check that the webhook endpoint is at `/api/v1/billing/webhook`

### Checkout session fails
- Verify your price IDs are correct and exist in your Stripe account
- Check that your Stripe secret key is from **test mode** (starts with `sk_test_`)

## Production Deployment

When deploying to production:

1. Switch to **live mode** keys (starts with `sk_live_`)
2. Create real products and prices in live mode
3. Set up live webhooks in the Stripe Dashboard
4. Update environment variables with live keys
5. Test with real cards (small amounts first)

## Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)

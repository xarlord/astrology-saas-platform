# Stripe Configuration Guide

This guide covers setting up Stripe for live payment processing in AstroVerse.

## Prerequisites

- Stripe account in **Live Mode** (not Test Mode)
- Admin access to Stripe Dashboard
- Business bank account linked to Stripe

## Step 1: Enable Live Mode

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Toggle from **Test** → **Live** in the left sidebar
3. Complete any required verification steps:
   - Business verification
   - Bank account information
   - Tax information

## Step 2: Get Live API Keys

In Live Mode, navigate to **Developers** → **API keys**:

```
Publishable key: pk_live_...
Secret key: sk_live_...
```

**Important:** Never commit the secret key to git. Use environment variables.

## Step 3: Create Products and Prices

### Option A: Via Stripe Dashboard (Recommended)

1. Go to **Products** → **Add product**
2. Create **Pro Monthly** product:
   - Name: "Pro Plan (Monthly)"
   - Price: $9.99/month
   - Copy the Price ID (format: `price_...`)
3. Create **Premium Monthly** product:
   - Name: "Premium Plan (Monthly)"
   - Price: $19.99/month
   - Copy the Price ID

### Option B: Via API

```bash
curl https://api.stripe.com/v1/prices \
  -u sk_live_...: \
  -d currency=usd \
  -d unit_amount=999 \
  -d "recurring[interval]=month" \
  -d product_data[name]="Pro Plan (Monthly)"
```

## Step 4: Configure Webhook

### Create Webhook Endpoint

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://api.astroverse.com/v1/billing/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Webhook Signing Secret** (starts with `whsec_...`)

### Verify Webhook Signature

The backend validates webhook signatures using the `STRIPE_WEBHOOK_SECRET`:

```typescript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const signature = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

## Step 5: Configure Backend Environment Variables

Add to `.env.production`:

```bash
# Stripe Live Mode
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PREMIUM_MONTHLY=price_...
```

## Step 6: Update Frontend Plan Configuration

The frontend's `FALLBACK_PLANS` in `SubscriptionPage.tsx` should match the Stripe prices:

```typescript
const FALLBACK_PLANS: PlanDetail[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    priceId: 'price_PRO_MONTHLY_ID', // Match Stripe price ID
    // ...
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    currency: 'usd',
    interval: 'month',
    priceId: 'price_PREMIUM_MONTHLY_ID', // Match Stripe price ID
    // ...
  },
];
```

## Step 7: Test Live Checkout

### Important: Test with Real Cards

In Live Mode, you must use real payment methods. Use these test amounts:

| Amount | Result |
|--------|--------|
| $9.99 | Success (Pro plan) |
| $19.99 | Success (Premium plan) |

**For testing without charges**, use Stripe's **Test Mode** with test cards:

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |

## Step 8: Verify Webhook Delivery

After a test checkout:

1. Go to **Webhooks** → Click your webhook endpoint
2. Check **Recent deliveries** for `checkout.session.completed`
3. Verify the webhook returned **200 OK**
4. Check backend logs for user plan update

## Step 9: Configure Customer Portal

The Customer Portal allows users to manage subscriptions:

1. Go to **Settings** → **Billing** → **Customer portal**
2. Configure:
   - Allow subscription cancellation: Yes
   - Allow subscription updates: Yes
   - Allow promotion codes: Yes
3. Set the **Return URL** to your subscription page

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook returns 404 | Check `/api/v1/billing/webhook` route exists and is publicly accessible |
| "No such price" error | Verify STRIPE_PRICE_XXX values match live Stripe prices (not test mode prices) |
| Webhook signature fails | Ensure STRIPE_WEBHOOK_SECRET matches the signing secret in Stripe dashboard |
| Plan not updated after payment | Check webhook logs and verify `checkout.session.completed` handler is working |

## Security Notes

- Never log full credit card numbers
- Never store CVV codes
- Use Stripe.js for client-side card handling
- Always verify webhook signatures
- Keep Stripe secrets in environment variables only

## Compliance

- Stripe is PCI DSS Service Provider Level 1
- Ensure your integration follows Stripe's [Security Guidelines](https://stripe.com/docs/security)
- Implement proper fraud detection (Stripe Radar)
- Set up 3D Secure for SCA compliance (European customers)

## Monitoring

Monitor these metrics in Stripe Dashboard:

1. **Payment success rate** - Should be >95%
2. **Churn rate** - Track subscription cancellations
3. **MRR (Monthly Recurring Revenue)** - Track growth
4. **Failed payments** - Follow up on declined transactions

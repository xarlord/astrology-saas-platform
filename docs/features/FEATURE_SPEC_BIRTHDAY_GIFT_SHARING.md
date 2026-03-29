# Feature Specification: Birthday Gift Sharing (Solar Returns)

**Version:** 1.0
**Status:** Ready for Development
**Priority:** P3 (Medium Impact, High Effort)
**Requirement ID:** REQ-SR-005
**Timeline:** 2-3 weeks

---

## 1. Feature Overview

### 1.1 Objective
Enable users to purchase and gift personalized solar return readings to friends and family, creating a viral growth channel and additional revenue stream.

### 1.2 User Stories
- **As a user**, I want to purchase a solar return reading as a gift for someone else
- **As a gift recipient**, I want to claim my gifted reading using a unique link
- **As a user**, I want to schedule the gift delivery for the recipient's birthday
- **As a user**, I want to include a personalized message with my gift

### 1.3 Success Criteria
- Gift purchase flow completes in < 3 minutes
- Recipients can claim gifts without creating account initially
- Gift link expires after 90 days if unclaimed
- Email delivery on scheduled date
- 15% of gifts convert recipients to users

---

## 2. Gift Flow Architecture

### 2.1 Gift Purchase Flow

```
User selects "Gift a Reading"
        ↓
Enters recipient info (name, email, birth data)
        ↓
Selects delivery date (birthday recommended)
        ↓
Writes personal message
        ↓
Payment processing
        ↓
Gift created with unique code
        ↓
Scheduled email delivery
        ↓
Recipient receives gift email
        ↓
Recipient claims gift
        ↓
Reading generated and available
```

### 2.2 Gift States

```typescript
type GiftStatus =
  | 'pending_payment'    // Created, awaiting payment
  | 'scheduled'          // Paid, waiting for delivery date
  | 'delivered'          // Email sent to recipient
  | 'claimed'            // Recipient claimed the gift
  | 'completed'          // Reading generated and viewed
  | 'expired'            // Not claimed within 90 days
  | 'refunded';          // Payment refunded
```

---

## 3. API Specification

### 3.1 Gift Management Endpoints

#### `POST /api/gifts/create`
**Description:** Create a new gift

**Request Body:**
```json
{
  "recipient": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "New York, NY",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "timezone": "America/New_York",
    "timeUnknown": false
  },
  "deliveryDate": "2026-05-15",
  "personalMessage": "Happy Birthday, Jane! I thought you'd enjoy this solar return reading. Love, John",
  "giftType": "solar_return",
  "priceId": "price_solar_return_2026"
}
```

**Response:**
```json
{
  "giftId": "gift_abc123",
  "status": "pending_payment",
  "checkoutUrl": "https://checkout.stripe.com/...",
  "amount": 1999,
  "currency": "USD"
}
```

#### `POST /api/gifts/:id/confirm`
**Description:** Confirm gift after payment (webhook handler)

**Response:**
```json
{
  "giftId": "gift_abc123",
  "status": "scheduled",
  "deliveryDate": "2026-05-15T00:00:00Z"
}
```

#### `GET /api/gifts/:code`
**Description:** Get gift details by code (for claiming)

**Response:**
```json
{
  "giftId": "gift_abc123",
  "code": "SUN2026-ABCD1234",
  "giftType": "solar_return",
  "status": "delivered",
  "senderName": "John",
  "personalMessage": "Happy Birthday...",
  "expiresAt": "2026-08-15T00:00:00Z",
  "recipient": {
    "name": "Jane Smith"
  }
}
```

#### `POST /api/gifts/:code/claim`
**Description:** Claim a gift

**Request Body:**
```json
{
  "email": "jane@example.com",
  "createAccount": true,
  "password": "optional_if_creating_account"
}
```

**Response:**
```json
{
  "success": true,
  "giftId": "gift_abc123",
  "readingId": "reading_xyz789",
  "user": {
    "id": "user_new",
    "email": "jane@example.com",
    "isNewUser": true
  },
  "redirectUrl": "/readings/reading_xyz789"
}
```

### 3.2 Sender Endpoints

#### `GET /api/gifts/sent`
**Description:** List gifts sent by user

**Response:**
```json
{
  "gifts": [
    {
      "id": "gift_abc123",
      "recipientName": "Jane Smith",
      "recipientEmail": "jane@example.com",
      "giftType": "solar_return",
      "status": "delivered",
      "deliveryDate": "2026-05-15",
      "amount": 1999,
      "currency": "USD",
      "createdAt": "2026-03-19T10:00:00Z"
    }
  ]
}
```

#### `POST /api/gifts/:id/resend`
**Description:** Resend gift email

---

## 4. Database Schema

### 4.1 `gifts` Table

```sql
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,  -- SUN2026-ABCD1234

  -- Sender info
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),

  -- Recipient info
  recipient_name VARCHAR(255) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Birth data for reading
  birth_data JSONB NOT NULL,
  chart_id UUID REFERENCES charts(id),

  -- Gift details
  gift_type VARCHAR(50) NOT NULL DEFAULT 'solar_return',
  personal_message TEXT,
  year INTEGER NOT NULL,  -- Solar return year

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending_payment',

  -- Dates
  delivery_date DATE NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Payment
  stripe_payment_intent_id VARCHAR(255),
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  refunded_at TIMESTAMP WITH TIME ZONE,

  -- Generated reading
  reading_id UUID REFERENCES solar_return_readings(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN (
    'pending_payment', 'scheduled', 'delivered',
    'claimed', 'completed', 'expired', 'refunded'
  ))
);

CREATE INDEX idx_gifts_code ON gifts (code);
CREATE INDEX idx_gifts_sender ON gifts (sender_id);
CREATE INDEX idx_gifts_recipient ON gifts (recipient_email);
CREATE INDEX idx_gifts_status ON gifts (status);
CREATE INDEX idx_gifts_delivery ON gifts (delivery_date);
```

---

## 5. Pricing & Products

### 5.1 Gift Products

| Product | Price | Description |
|---------|-------|-------------|
| Solar Return Reading | $19.99 | Full year solar return interpretation |
| Solar Return + Transit Package | $29.99 | Solar return + 3 months of transit updates |
| Premium Gift Bundle | $49.99 | Solar return + synastry + 6 months transits |

### 5.2 Stripe Integration

```typescript
const GIFT_PRODUCTS = {
  solar_return: {
    priceId: 'price_solar_return_2026',
    amount: 1999,
    name: 'Solar Return Reading Gift'
  },
  solar_return_transit: {
    priceId: 'price_solar_transit_2026',
    amount: 2999,
    name: 'Solar Return + Transit Package Gift'
  },
  premium_bundle: {
    priceId: 'price_premium_bundle_2026',
    amount: 4999,
    name: 'Premium Gift Bundle'
  }
};
```

---

## 6. Frontend Components

### 6.1 GiftPurchaseFlow Component

**File:** `frontend/src/components/GiftPurchaseFlow.tsx`

```typescript
interface GiftPurchaseFlowProps {
  onComplete: (giftId: string) => void;
  onCancel: () => void;
}

// Multi-step wizard:
// Step 1: Recipient Information
//   - Name, email
//   - Birth data form (reuse BirthDataForm)
// Step 2: Delivery Options
//   - Delivery date picker (defaults to birthday)
//   - Personal message textarea
// Step 3: Payment
//   - Product selection
//   - Stripe checkout
// Step 4: Confirmation
//   - Gift summary
//   - Preview email
```

### 6.2 GiftClaim Component

**File:** `frontend/src/components/GiftClaim.tsx`

```typescript
interface GiftClaimProps {
  giftCode: string;
  onClaimed: (readingId: string) => void;
}

// Features:
// - Display gift preview (sender name, message)
// - Claim button
// - Account creation option
// - Error handling for expired/invalid
// - Success animation
```

### 6.3 GiftCardEmail Template

**File:** `backend/src/templates/gift-email.html`

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .gift-card {
      max-width: 600px;
      margin: 0 auto;
      border-radius: 16px;
      overflow: hidden;
    }
    .gift-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .gift-body {
      background: #f9f9f9;
      padding: 40px;
    }
    .claim-button {
      display: inline-block;
      background: #10B981;
      color: white;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="gift-card">
    <div class="gift-header">
      <h1>🌟 You received a gift!</h1>
      <p>{senderName} sent you a Solar Return Reading</p>
    </div>
    <div class="gift-body">
      <p>Hi {recipientName},</p>
      <p>{senderName} has gifted you a personalized Solar Return Reading for {year}!</p>

      <div class="message-box">
        <p><em>"{personalMessage}"</em></p>
      </div>

      <p>Your Solar Return Reading includes:</p>
      <ul>
        <li>Complete year-ahead forecast</li>
        <li>Key themes and focus areas</li>
        <li>Important dates to watch</li>
        <li>Personalized advice and insights</li>
      </ul>

      <a href="{claimUrl}" class="claim-button">Claim Your Gift</a>

      <p class="expires">This gift expires on {expiresAt}</p>
    </div>
  </div>
</body>
</html>
```

---

## 7. Email & Notifications

### 7.1 Email Events

| Event | Template | Recipient |
|-------|----------|-----------|
| Gift created (payment confirmed) | gift-confirmation | Sender |
| Gift delivered | gift-card | Recipient |
| Gift claimed | gift-claimed | Sender |
| Gift expiring soon (7 days) | gift-expiring | Recipient |
| Gift expired | gift-expired | Sender |

### 7.2 Scheduled Jobs

```typescript
// Daily job to process gifts
async function processScheduledGifts(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Find gifts to deliver
  const toDeliver = await db.gifts.findMany({
    where: {
      status: 'scheduled',
      deliveryDate: today
    }
  });

  for (const gift of toDeliver) {
    await sendGiftEmail(gift);
    await db.gifts.update(gift.id, { status: 'delivered' });
  }

  // Find expired gifts
  const expired = await db.gifts.findMany({
    where: {
      status: 'delivered',
      expiresAt: { lt: new Date() }
    }
  });

  for (const gift of expired) {
    await processRefund(gift);
    await db.gifts.update(gift.id, { status: 'expired' });
  }
}
```

---

## 8. Test Cases

### 8.1 Unit Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| UT-GIFT-001 | Generate unique gift code | Valid format, unique |
| UT-GIFT-002 | Calculate expiry date | 90 days from creation |
| UT-GIFT-003 | Validate birth data | Valid/invalid correctly identified |
| UT-GIFT-004 | Calculate gift price | Correct amount from product |
| UT-GIFT-005 | Generate claim URL | Valid URL with code |

### 8.2 Integration Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| IT-GIFT-001 | Create gift | Gift in database |
| IT-GIFT-002 | Payment confirmation | Status = scheduled |
| IT-GIFT-003 | Deliver gift email | Email sent, status = delivered |
| IT-GIFT-004 | Claim gift | Status = claimed, reading created |
| IT-GIFT-005 | Claim expired gift | Error returned |
| IT-GIFT-006 | Refund expired gift | Payment refunded |

### 8.3 E2E Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| E2E-GIFT-001 | Complete gift purchase | Gift created, confirmation shown |
| E2E-GIFT-002 | Claim gift as new user | Account created, reading available |
| E2E-GIFT-003 | Claim gift as existing user | Reading added to account |
| E2E-GIFT-004 | Resend gift email | New email sent |
| E2E-GIFT-005 | View sent gifts | All sent gifts listed |
| E2E-GIFT-006 | Schedule future delivery | Gift scheduled correctly |

---

## 9. Security & Fraud Prevention

### 9.1 Gift Code Security
- Codes are cryptographically random
- 12-character alphanumeric (SUN2026-ABCD1234)
- Single use only
- Rate limited claiming attempts

### 9.2 Fraud Prevention
- Limit 10 gifts per user per day
- Require verified email for purchases > $50
- Flag suspicious patterns for review
- CAPTCHA on gift claim page

### 9.3 Privacy
- Recipient email not visible to sender after sending
- Birth data encrypted at rest
- GDPR-compliant data handling

---

## 10. Implementation Checklist

### Week 1: Backend Core

**Day 1-2: Data Model**
- [ ] Create database migrations
- [ ] Implement gift service
- [ ] Gift code generation
- [ ] Status management

**Day 3-4: API Endpoints**
- [ ] Create gift endpoint
- [ ] Payment confirmation webhook
- [ ] Claim gift endpoint
- [ ] Gift listing endpoints

**Day 5: Email & Jobs**
- [ ] Email templates
- [ ] Scheduled delivery job
- [ ] Expiry handling job

### Week 2: Frontend & Integration

**Day 1-2: Purchase Flow**
- [ ] GiftPurchaseFlow component
- [ ] Birth data form integration
- [ ] Stripe checkout integration
- [ ] Confirmation page

**Day 3-4: Claim Flow**
- [ ] GiftClaim component
- [ ] Claim page
- [ ] Account creation flow
- [ ] Success animation

**Day 5: Testing & Polish**
- [ ] E2E tests
- [ ] Email rendering tests
- [ ] Mobile responsiveness
- [ ] Documentation

---

## 11. Analytics & Metrics

### 11.1 Key Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Gift conversion rate | 15% | Recipients who create account |
| Gift completion rate | 80% | Gifts that result in viewed reading |
| Average gift value | $25 | Mean purchase amount |
| Resend rate | < 10% | Gifts requiring resend |
| Refund rate | < 5% | Expired gifts requiring refund |

### 11.2 Tracking Events

```typescript
const GIFT_EVENTS = {
  GIFT_CREATED: 'gift_created',
  GIFT_PAYMENT_COMPLETED: 'gift_payment_completed',
  GIFT_DELIVERED: 'gift_delivered',
  GIFT_EMAIL_OPENED: 'gift_email_opened',
  GIFT_CLAIMED: 'gift_claimed',
  GIFT_COMPLETED: 'gift_completed',
  GIFT_EXPIRED: 'gift_expired',
  GIFT_REFUNDED: 'gift_refunded'
};
```

---

## 12. Acceptance Criteria

- [ ] User can purchase gift for any recipient
- [ ] Payment processes correctly via Stripe
- [ ] Gift email sends on scheduled date
- [ ] Recipient can claim without account
- [ ] Claiming creates reading automatically
- [ ] Sender receives confirmation and claim notification
- [ ] Expired gifts are refunded
- [ ] All test cases pass
- [ ] Mobile responsive

---

**Ready for development!** ✅

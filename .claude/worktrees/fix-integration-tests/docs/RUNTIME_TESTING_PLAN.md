# Runtime Testing Plan - Expansion Features

**Document Version:** 1.0
**Date:** 2026-02-17
**Author:** Claude Sonnet 4.5
**Status:** Ready for Execution
**Prerequisites:** Database running, servers started

---

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Pre-Test Checklist](#pre-test-checklist)
3. [API Endpoint Testing](#api-endpoint-testing)
4. [Integration Testing](#integration-testing)
5. [Security Testing](#security-testing)
6. [Performance Testing](#performance-testing)
7. [Frontend UI Testing](#frontend-ui-testing)
8. [Error Scenario Testing](#error-scenario-testing)
9. [Accessibility Testing](#accessibility-testing)
10. [Test Reporting](#test-reporting)

---

## Environment Setup

### Prerequisites

```bash
# 1. Start PostgreSQL Database
# Windows
pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start

# Linux/Mac
sudo service postgresql start

# Or using Docker
docker run --name postgres-test -e POSTGRES_PASSWORD=test123 -p 5432:5432 -d postgres:16

# 2. Install dependencies
cd backend
npm install

cd ../frontend
npm install

# 3. Run database migrations
cd backend
npx knex migrate:latest --knexfile knexfile.ts

# 4. Seed test data (optional)
npm run seed:test

# 5. Start backend server
cd backend
npm run dev
# Expected: Server running on http://localhost:3000

# 6. Start frontend server (new terminal)
cd frontend
npm run dev
# Expected: Server running on http://localhost:5173
```

### Environment Variables

**Backend (.env.test):**
```env
DATABASE_URL=postgresql://postgres:test123@localhost:5432/astrology_test
JWT_SECRET=test_secret_key_for_testing_only
NODE_ENV=test
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env.test):**
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Test Accounts

Create test users in database:

```sql
-- Test User 1: Premium user with multiple charts
INSERT INTO users (id, email, password_hash, full_name, subscription_tier) VALUES
('11111111-1111-1111-1111-111111111111', 'test1@example.com', '$2b$10$hash', 'Test User 1', 'premium');

-- Test User 2: Free user with basic chart
INSERT INTO users (id, email, password_hash, full_name, subscription_tier) VALUES
('22222222-2222-2222-2222-222222222222', 'test2@example.com', '$2b$10$hash', 'Test User 2', 'free');

-- Test User 3: Premium user for synastry testing
INSERT INTO users (id, email, password_hash, full_name, subscription_tier) VALUES
('33333333-3333-3333-3333-333333333333', 'test3@example.com', '$2b$10$hash', 'Test User 3', 'premium');
```

---

## Pre-Test Checklist

### Database Checks

- [ ] PostgreSQL is running and accessible
- [ ] Test database created: `astrology_test`
- [ ] All migrations run successfully
- [ ] Test data seeded (users, charts)
- [ ] Can connect to database from backend
- [ ] Foreign key constraints working

### Backend Checks

- [ ] Backend server starts without errors
- [ ] All modules load correctly
- [ ] Environment variables loaded
- [ ] JWT authentication working
- [ ] API v1 routes registered
- [ ] No console errors on startup

### Frontend Checks

- [ ] Frontend server starts without errors
- [ ] VITE_API_URL points to correct backend
- [ ] React app loads in browser
- [ ] No console errors on load
- [ ] Routes are accessible
- [ ] Components render without errors

### Test Tools Ready

- [ ] Postman installed or curl available
- [ ] Browser DevTools accessible
- [ ] Database client (pgAdmin/DBeaver) connected
- [ ] Test JWT tokens generated

---

## API Endpoint Testing

### Test Authentication Helper

First, obtain auth tokens for testing:

```bash
# Login and get token
TOKEN=$(curl -s -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@example.com", "password": "test123"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"

# Or export for reuse
export AUTH_TOKEN=$TOKEN
```

### 1. Calendar API Tests

#### 1.1 Get Month Events - Success Case

```bash
# Test: Get events for February 2026
curl -X GET "http://localhost:3000/api/v1/calendar/month/2026/2" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "...",
        "user_id": null,
        "event_type": "new_moon",
        "event_date": "2026-02-17T12:34:56Z",
        "event_data": {
          "sign": "aquarius",
          "degree": 29,
          "illumination": 0
        },
        "interpretation": "New Moon in Aquarius - Time for new beginnings"
      },
      {
        "id": "...",
        "user_id": null,
        "event_type": "mercury_retrograde",
        "event_date": "2026-02-01T00:00:00Z",
        "event_data": {
          "sign": "aquarius",
          "degree": 25
        },
        "interpretation": "Mercury retrograde in Aquarius"
      }
    ],
    "meta": {
      "year": 2026,
      "month": 2,
      "total": 15
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Response status is 200
- [ ] Response has `success: true`
- [ ] `data.events` array exists
- [ ] Events have all required fields (id, event_type, event_date, interpretation)
- [ ] Global events included (new moons, full moons, retrogrades)
- [ ] Month-specific events only (no January or March events)

#### 1.2 Get Month Events - Invalid Input

```bash
# Test: Invalid month (13)
curl -X GET "http://localhost:3000/api/v1/calendar/month/2026/13" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (400 Bad Request):
{
  "success": false,
  "error": {
    "message": "Invalid month. Must be between 1 and 12.",
    "code": "INVALID_INPUT"
  }
}

# Test: Invalid year (past)
curl -X GET "http://localhost:3000/api/v1/calendar/month/1800/1" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (400 Bad Request)
```

**Acceptance Criteria:**
- [ ] Response status is 400
- [ ] Error message is clear
- [ ] No stack traces exposed
- [ ] Invalid input rejected before database query

#### 1.3 Create Custom Event - Success

```bash
# Test: Create personal event
curl -X POST "http://localhost:3000/api/v1/calendar/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "personal_transit",
    "event_date": "2026-02-20T12:00:00Z",
    "event_data": {
      "planet": "Jupiter",
      "sign": "Gemini"
    },
    "interpretation": "Jupiter enters Gemini - expansion in communication"
  }'

# Expected Response (201 Created):
{
  "success": true,
  "data": {
    "event": {
      "id": "...",
      "user_id": "11111111-1111-1111-1111-111111111111",
      "event_type": "personal_transit",
      "event_date": "2026-02-20T12:00:00Z",
      "event_data": {
        "planet": "Jupiter",
        "sign": "Gemini"
      },
      "interpretation": "Jupiter enters Gemini - expansion in communication",
      "created_at": "2026-02-17T10:00:00Z"
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Response status is 201
- [ ] Event created with user_id from token
- [ ] Event has generated UUID
- [ ] created_at timestamp present
- [ ] Event retrievable in subsequent month query

#### 1.4 Create Custom Event - Validation Errors

```bash
# Test: Missing required field
curl -X POST "http://localhost:3000/api/v1/calendar/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "personal_transit"
  }'

# Expected Response (400 Bad Request):
{
  "success": false,
  "error": {
    "message": "event_date is required",
    "code": "VALIDATION_ERROR"
  }
}

# Test: Invalid event type
curl -X POST "http://localhost:3000/api/v1/calendar/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "invalid_type",
    "event_date": "2026-02-20T12:00:00Z"
  }'

# Expected Response (400 Bad Request)
```

**Acceptance Criteria:**
- [ ] Validation errors return 400
- [ ] Missing fields clearly identified
- [ ] Invalid enum values rejected
- [ ] No database records created on validation failure

#### 1.5 Delete Event - Success & Authorization

```bash
# First, create an event to delete
CREATE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/v1/calendar/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event_type": "personal", "event_date": "2026-02-20T12:00:00Z"}')

EVENT_ID=$(echo $CREATE_RESPONSE | jq -r '.data.event.id')

# Test: Delete own event
curl -X DELETE "http://localhost:3000/api/v1/calendar/events/$EVENT_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200 OK):
{
  "success": true,
  "message": "Event deleted successfully"
}

# Test: Try to retrieve deleted event
curl -X GET "http://localhost:3000/api/v1/calendar/events/$EVENT_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (404 Not Found)
```

**Acceptance Criteria:**
- [ ] Event successfully deleted
- [ ] Subsequent queries don't return event
- [ ] Only event owner can delete
- [ ] Cascade delete works (if applicable)

### 2. Lunar Return API Tests

#### 2.1 Get Next Lunar Return - Success

```bash
# Test: Get next lunar return
curl -X GET "http://localhost:3000/api/v1/lunar-return/next" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "nextReturn": "2026-03-05T14:23:45Z",
    "natalMoon": {
      "sign": "leo",
      "degree": 15,
      "minute": 30,
      "second": 0
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Response status is 200
- [ ] nextReturn is a future date
- [ ] natalMoon matches user's natal chart
- [ ] Date is approximately 27.3 days from previous return

#### 2.2 Get Current Lunar Return - Countdown

```bash
# Test: Get current lunar return info
curl -X GET "http://localhost:3000/api/v1/lunar-return/current" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "returnDate": "2026-03-05T14:23:45Z",
    "daysUntil": 16
  }
}
```

**Acceptance Criteria:**
- [ ] `daysUntil` is positive integer
- [ ] `daysUntil` matches actual days to returnDate
- [ ] Calculation accurate (27.3-day cycle)
- [ ] Handles case where lunar return is today (daysUntil = 0)

#### 2.3 Calculate Lunar Return Chart - Success

```bash
# Test: Calculate chart for specific date
curl -X POST "http://localhost:3000/api/v1/lunar-return/chart" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "returnDate": "2026-03-05T14:23:45Z"
  }'

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "returnDate": "2026-03-05T14:23:45Z",
    "moonPosition": {
      "sign": "leo",
      "degree": 15,
      "minute": 30,
      "second": 0
    },
    "moonPhase": "waxing-gibbous",
    "housePlacement": 8,
    "aspects": [
      {
        "planets": ["Moon", "Saturn"],
        "type": "opposition",
        "orb": 3.5,
        "applying": false,
        "interpretation": "Emotional tension between needs and responsibilities"
      }
    ],
    "theme": "Emotional depth and transformation",
    "intensity": 7
  }
}
```

**Acceptance Criteria:**
- [ ] Moon position calculated accurately
- [ ] Moon phase correct for date
- [ ] House placement between 1-12
- [ ] Aspects array present
- [ ] Theme is descriptive string
- [ ] Intensity between 1-10

#### 2.4 Get Monthly Forecast - Success

```bash
# Test: Get forecast for lunar return
curl -X POST "http://localhost:3000/api/v1/lunar-return/forecast" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "returnDate": "2026-03-05T14:23:45Z"
  }'

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "userId": "11111111-1111-1111-1111-111111111111",
    "returnDate": "2026-03-05T14:23:45Z",
    "theme": "Emotional depth and transformation",
    "intensity": 7,
    "emotionalTheme": "Focus on inner growth and emotional healing",
    "actionAdvice": [
      "Nurture yourself",
      "Create a peaceful home",
      "Honor your feelings"
    ],
    "keyDates": [
      {
        "date": "2026-03-05T00:00:00Z",
        "type": "aspect-exact",
        "description": "Lunar Return",
        "significance": "Your lunar return in Leo brings fresh energy"
      },
      {
        "date": "2026-03-21T00:00:00Z",
        "type": "new-moon",
        "description": "New Moon",
        "significance": "Set intentions for the lunar month"
      }
    ],
    "predictions": [
      {
        "category": "relationships",
        "prediction": "Deep emotional transformations are possible",
        "likelihood": 8,
        "advice": ["Face fears", "Release old patterns", "Trust the process"]
      },
      {
        "category": "creativity",
        "prediction": "Creative self-expression is highlighted",
        "likelihood": 7,
        "advice": ["Express yourself", "Create art", "Take risks"]
      }
    ],
    "rituals": [
      {
        "phase": "new-moon",
        "title": "Set Intentions",
        "description": "Create a sacred space to set your intentions",
        "materials": ["Journal", "Pen", "Candle"],
        "steps": [
          "Light a candle",
          "Reflect on goals",
          "Write 3-5 intentions",
          "Speak them aloud"
        ]
      }
    ],
    "journalPrompts": [
      "What emotional patterns am I noticing?",
      "How can I nurture myself more deeply?",
      "What does 'home' mean to me?"
    ]
  }
}
```

**Acceptance Criteria:**
- [ ] Forecast includes all sections (theme, predictions, rituals, journalPrompts)
- [ ] Predictions have likelihood scores (1-10)
- [ ] Rituals have materials and steps arrays
- [ ] Journal prompts are thought-provoking questions
- [ ] keyDates include new moon and full moon
- [ ] Content is personalized based on house placement

#### 2.5 Get Lunar Return History - Pagination

```bash
# Test: Get first page
curl -X GET "http://localhost:3000/api/v1/lunar-return/history?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "returns": [
      {
        "id": "...",
        "returnDate": "2026-03-05T14:23:45Z",
        "theme": "Emotional depth and transformation",
        "intensity": 7,
        "emotionalTheme": "Focus on inner growth",
        "createdAt": "2026-02-17T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 24,
      "totalPages": 3
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Pagination metadata accurate
- [ ] Total count matches database
- [ ] Page limit respected
- [ ] Returns user's own lunar returns only
- [ ] Ordered by returnDate DESC (newest first)

### 3. Synastry API Tests

#### 3.1 Compare Two Charts - Success

```bash
# Test: Compare two charts
curl -X POST "http://localhost:3000/api/v1/synastry/compare" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart1Id": "chart1-uuid-here",
    "chart2Id": "chart2-uuid-here"
  }'

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "id": "...",
    "chart1Id": "chart1-uuid-here",
    "chart2Id": "chart2-uuid-here",
    "overallCompatibility": 75,
    "categoryScores": {
      "romantic": 80,
      "communication": 70,
      "emotional": 75,
      "intellectual": 85,
      "spiritual": 65,
      "values": 72
    },
    "synastryAspects": [
      {
        "planet1": "Venus",
        "planet2": "Mars",
        "aspect": "trine",
        "orb": 5,
        "applying": true,
        "interpretation": "Strong romantic attraction and harmony",
        "weight": 10,
        "soulmateIndicator": true
      }
    ],
    "compositeChart": {
      "planets": {
        "Sun": {
          "name": "Sun",
          "degree": 185,
          "minute": 0,
          "second": 0,
          "sign": "libra"
        }
      },
      "interpretation": "Relationship focused on balance and harmony"
    },
    "relationshipTheme": "Partnership with potential for deep commitment",
    "strengths": [
      "Strong romantic attraction",
      "Easy communication",
      "Shared values"
    ],
    "challenges": [
      "Different emotional needs",
      "Occasional misunderstandings"
    ],
    "advice": "Communicate openly about your needs to maintain harmony"
  }
}
```

**Acceptance Criteria:**
- [ ] Overall compatibility score between 0-100
- [ ] All category scores present (romantic, communication, etc.)
- [ ] Category scores also between 0-100
- [ ] Synastry aspects include planet names, aspect type, orb
- [ ] Composite chart calculated using midpoints
- [ ] Soulmate indicators flagged correctly
- [ ] Advice is practical and actionable

#### 3.2 Generate Shareable Link - Success

```bash
# First, compare charts to get report ID
COMPARE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/v1/synastry/compare" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"chart1Id": "uuid1", "chart2Id": "uuid2"}')

REPORT_ID=$(echo $COMPARE_RESPONSE | jq -r '.data.id')

# Test: Generate shareable link
curl -X POST "http://localhost:3000/api/v1/synastry/$REPORT_ID/share" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "expirationDays": 30
  }'

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "shareId": "abc123def456",
    "shareUrl": "http://localhost:5173/synastry/shared/abc123def456",
    "expiresAt": "2026-03-19T00:00:00Z",
    "createdAt": "2026-02-17T10:00:00Z"
  }
}
```

**Acceptance Criteria:**
- [ ] shareId is unique string
- [ ] shareUrl is accessible URL
- [ ] expiresAt is calculated correctly (today + expirationDays)
- [ ] shareId stored in database
- [ ] Default expiration if not specified (e.g., 30 days)

#### 3.3 Access Shared Report - Public Access

```bash
# Test: Access shared report WITHOUT authentication
SHARE_ID="abc123def456"

curl -X GET "http://localhost:3000/api/v1/synastry/shared/$SHARE_ID" \
  -H "Content-Type: application/json"

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "chart1Name": "John's Chart",
    "chart2Name": "Jane's Chart",
    "overallCompatibility": 75,
    "categoryScores": {...},
    "synastryAspects": [...],
    "compositeChart": {...},
    "relationshipTheme": "...",
    "strengths": [...],
    "challenges": [...]
  }
}
```

**Acceptance Criteria:**
- [ ] Works without authentication header
- [ ] Report data is present
- [ ] Personal data (birth dates, locations) removed
- [ ] Share expiration checked
- [ ] Returns 404 if share_id invalid

#### 3.4 Share Link Expiration - Edge Case

```bash
# Test: Access expired share link
curl -X GET "http://localhost:3000/api/v1/synastry/shared/expired-share-id" \
  -H "Content-Type: application/json"

# Expected Response (410 Gone):
{
  "success": false,
  "error": {
    "message": "This share link has expired",
    "code": "SHARE_EXPIRED"
  }
}
```

**Acceptance Criteria:**
- [ ] Expired links return 410 Gone
- [ ] Clear error message
- [ ] No data revealed for expired links

---

## Integration Testing

### Test Scenario 1: Complete Calendar Workflow

**Story:** As a user, I want to view my astrological calendar, add personal events, and see them alongside global events.

```bash
# Step 1: User logs in
TOKEN=$(curl -s -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@example.com", "password": "test123"}' \
  | jq -r '.data.token')

# Step 2: User navigates to February 2026
FEB_EVENTS=$(curl -s -X GET "http://localhost:3000/api/v1/calendar/month/2026/2" \
  -H "Authorization: Bearer $TOKEN")

echo "Step 2: ✅ Retrieved $(echo $FEB_EVENTS | jq '.data.meta.total') events for February"

# Step 3: User adds a personal event
CREATE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/v1/calendar/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "personal",
    "event_date": "2026-02-14T12:00:00Z",
    "event_data": {"note": "Valentine\"s Day"},
    "interpretation": "Personal celebration"
  }')

echo "Step 3: ✅ Created personal event"

# Step 4: User refreshes calendar and sees personal event
FEB_EVENTS_AFTER=$(curl -s -X GET "http://localhost:3000/api/v1/calendar/month/2026/2" \
  -H "Authorization: Bearer $TOKEN")

PERSONAL_COUNT=$(echo $FEB_EVENTS_AFTER | jq '[.data.events[] | select(.event_type == "personal")] | length')

if [ $PERSONAL_COUNT -gt 0 ]; then
  echo "Step 4: ✅ Personal event visible in calendar"
else
  echo "Step 4: ❌ Personal event not found"
fi

# Step 5: User deletes personal event
EVENT_ID=$(echo $CREATE_RESPONSE | jq -r '.data.event.id')
curl -s -X DELETE "http://localhost:3000/api/v1/calendar/events/$EVENT_ID" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo "Step 5: ✅ Deleted personal event"

# Step 6: User confirms event is gone
FEB_EVENTS_FINAL=$(curl -s -X GET "http://localhost:3000/api/v1/calendar/month/2026/2" \
  -H "Authorization: Bearer $TOKEN")

FINAL_PERSONAL_COUNT=$(echo $FEB_EVENTS_FINAL | jq '[.data.events[] | select(.event_type == "personal")] | length')

if [ $FINAL_PERSONAL_COUNT -eq 0 ]; then
  echo "Step 6: ✅ Personal event successfully removed"
else
  echo "Step 6: ❌ Personal event still exists"
fi
```

**Acceptance Criteria:**
- [ ] All steps complete without errors
- [ ] Personal events appear alongside global events
- [ ] CRUD operations work correctly
- [ ] Data persists between calls
- [ ] User can only see their own events

### Test Scenario 2: Lunar Return Journey

**Story:** As a user, I want to see my next lunar return, understand the forecast, and save journal entries.

```bash
# Step 1: Get next lunar return
NEXT_RETURN=$(curl -s -X GET "http://localhost:3000/api/v1/lunar-return/next" \
  -H "Authorization: Bearer $TOKEN")

RETURN_DATE=$(echo $NEXT_RETURN | jq -r '.data.nextReturn')
echo "Step 1: ✅ Next lunar return on $RETURN_DATE"

# Step 2: Get detailed forecast
FORECAST=$(curl -s -X POST "http://localhost:3000/api/v1/lunar-return/forecast" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"returnDate\": \"$RETURN_DATE\"}")

PROMPT_COUNT=$(echo $FORECAST | jq '.data.journalPrompts | length')
echo "Step 2: ✅ Retrieved forecast with $PROMPT_COUNT journal prompts"

# Step 3: Verify forecast has all required sections
HAS_PREDICTIONS=$(echo $FORECAST | jq 'has("data.predictions")')
HAS_RITUALS=$(echo $FORECAST | jq 'has("data.rituals")')
HAS_KEY_DATES=$(echo $FORECAST | jq 'has("data.keyDates")')

echo "Step 3: Predictions: $HAS_PREDICTIONS, Rituals: $HAS_RITUALS, Key Dates: $HAS_KEY_DATES"

# Step 4: Get historical lunar returns
HISTORY=$(curl -s -X GET "http://localhost:3000/api/v1/lunar-return/history?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")

HISTORY_COUNT=$(echo $HISTORY | jq '.data.returns | length')
echo "Step 4: ✅ Retrieved $HISTORY_COUNT past lunar returns"

# Step 5: Calculate custom lunar return for specific date
CUSTOM_CHART=$(curl -s -X POST "http://localhost:3000/api/v1/lunar-return/chart" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"returnDate": "2026-06-15T12:00:00Z"}')

INTENSITY=$(echo $CUSTOM_CHART | jq '.data.intensity')
echo "Step 5: ✅ Custom chart calculated with intensity $INTENSITY"
```

**Acceptance Criteria:**
- [ ] Lunar return date is accurate
- [ ] Forecast includes all sections
- [ ] Journal prompts are meaningful
- [ ] Historical data paginates correctly
- [ ] Custom calculations work

### Test Scenario 3: Synastry Comparison & Sharing

**Story:** As a user, I want to compare my chart with a partner's and share the results.

```bash
# Step 1: Compare two charts
SYNASTRY=$(curl -s -X POST "http://localhost:3000/api/v1/synastry/compare" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart1Id": "11111111-1111-1111-1111-111111111111",
    "chart2Id": "22222222-2222-2222-2222-222222222222"
  }')

OVERALL=$(echo $SYNASTRY | jq '.data.overallCompatibility')
echo "Step 1: ✅ Charts compared, overall compatibility: $OVERALL%"

# Step 2: Verify category scores
ROMANCE=$(echo $SYNASTRY | jq '.data.categoryScores.romantic')
COMMUNICATION=$(echo $SYNASTRY | jq '.data.categoryScores.communication')
echo "Step 2: Romance: $ROMANCE%, Communication: $COMMUNICATION%"

# Step 3: Check for soulmate aspects
ASPECT_COUNT=$(echo $SYNASTRY | jq '[.data.synastryAspects[] | select(.soulmateIndicator == true)] | length')
echo "Step 3: Found $ASPECT_COUNT soulmate indicator aspects"

# Step 4: Generate shareable link
REPORT_ID=$(echo $SYNASTRY | jq -r '.data.id')
SHARE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/v1/synastry/$REPORT_ID/share" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

SHARE_URL=$(echo $SHARE_RESPONSE | jq -r '.data.shareUrl')
echo "Step 4: ✅ Share URL generated: $SHARE_URL"

# Step 5: Access shared report without auth
SHARE_ID=$(echo $SHARE_RESPONSE | jq -r '.data.shareId')
SHARED_REPORT=$(curl -s -X GET "http://localhost:3000/api/v1/synastry/shared/$SHARE_ID")

SHARED_OVERALL=$(echo $SHARED_REPORT | jq '.data.overallCompatibility')
echo "Step 5: ✅ Shared report accessible (compatibility: $SHARED_OVERALL%)"
```

**Acceptance Criteria:**
- [ ] Compatibility scores calculated
- [ ] Category scores make sense
- [ ] Soulmate aspects identified
- [ ] Share link works publicly
- [ ] Shared report doesn't expose sensitive data

---

## Security Testing

### 1. Authentication & Authorization

#### Test 1.1: Unauthenticated Access

```bash
# Test: Access protected route without token
curl -X GET "http://localhost:3000/api/v1/calendar/month/2026/2"

# Expected Response (401 Unauthorized):
{
  "success": false,
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

**Acceptance Criteria:**
- [ ] All calendar routes require auth
- [ ] All lunar return routes require auth
- [ ] All synastry routes require auth (except shared)
- [ ] Error message doesn't reveal internal details

#### Test 1.2: Invalid Token

```bash
# Test: Use invalid/expired token
curl -X GET "http://localhost:3000/api/v1/calendar/month/2026/2" \
  -H "Authorization: Bearer invalid_token_12345"

# Expected Response (401 Unauthorized)
```

**Acceptance Criteria:**
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected
- [ ] Malformed tokens rejected
- [ ] Consistent error handling

#### Test 1.3: Cross-User Data Access

```bash
# Test: User 1 tries to access User 2's events
# Login as User 1
TOKEN1=$(curl -s -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@example.com", "password": "test123"}' \
  | jq -r '.data.token')

# Try to access User 2's event (created by User 2)
curl -X DELETE "http://localhost:3000/api/v1/calendar/events/user2-event-id" \
  -H "Authorization: Bearer $TOKEN1"

# Expected Response (403 Forbidden or 404 Not Found)
```

**Acceptance Criteria:**
- [ ] Users cannot access other users' data
- [ ] Proper authorization checks on all operations
- [ ] User isolation enforced at database level
- [ ] No information leakage in error messages

### 2. Input Validation

#### Test 2.1: SQL Injection Attempts

```bash
# Test: SQL injection in event_type
curl -X POST "http://localhost:3000/api/v1/calendar/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "new_moon; DROP TABLE users; --",
    "event_date": "2026-02-20T12:00:00Z"
  }'

# Expected: Validation error or sanitized input
```

**Acceptance Criteria:**
- [ ] Malicious input rejected
- [ ] No SQL errors exposed
- [ ] Input sanitized or parameterized queries used
- [ ] Database not compromised

#### Test 2.2: XSS in Interpretation Text

```bash
# Test: XSS in event interpretation
curl -X POST "http://localhost:3000/api/v1/calendar/events" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "personal",
    "event_date": "2026-02-20T12:00:00Z",
    "interpretation": "<script>alert('XSS')</script>"
  }'

# Then retrieve the event
curl -X GET "http://localhost:3000/api/v1/calendar/month/2026/2" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Script tags escaped or sanitized
```

**Acceptance Criteria:**
- [ ] HTML tags escaped in output
- [ ] Script doesn't execute in frontend
- [ ] Content-Security-Policy headers set
- [ ] XSS vulnerabilities prevented

#### Test 2.3: Path Traversal

```bash
# Test: Path traversal in chart ID
curl -X POST "http://localhost:3000/api/v1/synastry/compare" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "chart1Id": "../../../etc/passwd",
    "chart2Id": "valid-uuid"
  }'

# Expected: Validation error
```

**Acceptance Criteria:**
- [ ] Path traversal attempts blocked
- [ ] UUID validation enforced
- [ ] No file system access

### 3. Rate Limiting

```bash
# Test: Rapid requests to check rate limiting
for i in {1..150}; do
  curl -s -X GET "http://localhost:3000/api/v1/calendar/month/2026/2" \
    -H "Authorization: Bearer $TOKEN" &
done
wait

# Expected: After threshold, get 429 Too Many Requests
```

**Acceptance Criteria:**
- [ ] Rate limiting implemented
- [ ] 429 status code returned
- [ ] Retry-After header present
- [ ] Reasonable limits (e.g., 100 req/min)

---

## Performance Testing

### 1. Database Query Performance

```bash
# Enable query logging
psql -U postgres -d astrology_test -c "SET log_min_duration_statement = 100;"

# Test: Query month with many events
curl -X GET "http://localhost:3000/api/v1/calendar/month/2026/2" \
  -H "Authorization: Bearer $TOKEN" \
  -w "\nTime Total: %{time_total}s\n"

# Check query logs
tail -f /var/log/postgresql/postgresql-16-main.log | grep "calendar"

# Acceptance: Queries complete in < 100ms
```

**Performance Targets:**
- [ ] Calendar month query: < 100ms with 1000 events
- [ ] Lunar return forecast: < 200ms
- [ ] Synastry comparison: < 500ms
- [ ] All indexes used (EXPLAIN ANALYZE)

### 2. API Response Time

```bash
# Test: Response times for all endpoints
echo "Testing API Response Times..."

# Calendar endpoints
for month in {1..12}; do
  curl -s -X GET "http://localhost:3000/api/v1/calendar/month/2026/$month" \
    -H "Authorization: Bearer $TOKEN" \
    -w "Month $month: %{time_total}s\n" \
    -o /dev/null
done

# Lunar return endpoints
curl -s -X GET "http://localhost:3000/api/v1/lunar-return/next" \
  -H "Authorization: Bearer $TOKEN" \
  -w "Next Return: %{time_total}s\n" \
  -o /dev/null

curl -s -X POST "http://localhost:3000/api/v1/lunar-return/forecast" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"returnDate": "2026-03-05T12:00:00Z"}' \
  -w "Forecast: %{time_total}s\n" \
  -o /dev/null

# Synastry endpoints
curl -s -X POST "http://localhost:3000/api/v1/synastry/compare" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"chart1Id": "uuid1", "chart2Id": "uuid2"}' \
  -w "Synastry: %{time_total}s\n" \
  -o /dev/null
```

**Performance Targets:**
- [ ] All GET requests: < 200ms (p95)
- [ ] All POST requests: < 500ms (p95)
- [ ] No requests exceed 2 seconds

### 3. Frontend Render Performance

```bash
# Use Chrome DevTools Lighthouse
# 1. Open http://localhost:5173/calendar
# 2. Open DevTools > Lighthouse
# 3. Run Performance audit

# Target metrics:
# - First Contentful Paint (FCP): < 1.8s
# - Largest Contentful Paint (LCP): < 2.5s
# - Total Blocking Time (TBT): < 200ms
# - Cumulative Layout Shift (CLS): < 0.1
# - Speed Index: < 3.4s
```

**Manual Test:**
```javascript
// In browser console on /calendar page
performance.mark('calendar-start');
// Wait for calendar to load
performance.mark('calendar-end');
performance.measure('calendar-load', 'calendar-start', 'calendar-end');
const measure = performance.getEntriesByName('calendar-load')[0];
console.log(`Calendar load time: ${measure.duration}ms`);
// Target: < 1000ms
```

**Acceptance Criteria:**
- [ ] Calendar renders in < 1 second
- [ ] 100 events display without lag
- [ ] Month navigation is instant
- [ ] No visible jank

---

## Frontend UI Testing

### 1. Calendar Component Tests

#### Manual Test Checklist

**Navigation:**
- [ ] Previous month button works
- [ ] Next month button works
- [ ] Today button returns to current month
- [ ] Month title updates correctly
- [ ] Year displays correctly

**Event Display:**
- [ ] Global events appear in calendar
- [ ] Personal events appear in calendar
- [ ] Event badges have correct colors:
  - New moon: Blue (#E0E7FF)
  - Full moon: Red (#FEE2E2)
  - Retrograde: Red/orange
  - Eclipse: Red with border
- [ ] Zodiac signs display correctly
- [ ] Emoji icons render (🌑, 🌕, ⇄)
- [ ] Tooltips show on hover

**Responsive Design:**
- [ ] Desktop (1920x1080): Full calendar visible
- [ ] Tablet (768x1024): Month navigation stacks
- [ ] Mobile (375x667): Single column layout
- [ ] Calendar grid responsive
- [ ] Event badges readable on mobile

**Empty States:**
- [ ] Loading state displays during fetch
- [ ] Error state displays with retry button
- [ ] Empty month shows no events

**Accessibility:**
```javascript
// In browser console
// Test keyboard navigation
const buttons = document.querySelectorAll('button');
buttons.forEach(btn => {
  console.log(`${btn.textContent}: tabindex=${btn.tabIndex}`);
});

// Check ARIA labels
const ariaElements = document.querySelectorAll('[aria-label]');
console.log(`ARIA labels: ${ariaElements.length}`);
```

**Acceptance Criteria:**
- [ ] All buttons accessible via Tab key
- [ ] Focus indicators visible
- [ ] ARIA labels present on icon buttons
- [ ] Calendar is screen reader friendly

### 2. Lunar Return Component Tests

#### Manual Test Checklist

**Dashboard View:**
- [ ] Countdown displays correct days until
- [ ] Next return date formatted correctly
- [ ] Natal moon info displays
- [ ] Quick action buttons work
- [ ] Info cards display

**Forecast View:**
- [ ] All tabs work (overview, predictions, rituals, journal)
- [ ] Prediction cards display correctly
- [ ] Likelihood bars render properly
- [ ] Ritual steps are numbered
- [ ] Journal prompts are bulleted

**Navigation:**
- [ ] Back button returns to dashboard
- [ ] View mode tabs switch correctly
- [ ] Active tab highlighted
- [ ] History pagination works

### 3. Synastry Component Tests

#### Manual Test Checklist

**Calculator:**
- [ ] Chart selector dropdowns work
- [ ] Chart 1 selection saves
- [ ] Chart 2 selection saves
- [ ] Compare button disabled until both selected
- [ ] Loading state during comparison
- [ ] Error state for invalid charts

**Results Display:**
- [ ] Overall score prominent (0-100)
- [ ] Category scores have visual bars
- [ ] Color coding:
  - 80-100: Green
  - 60-79: Yellow
  - 40-59: Orange
  - 0-39: Red
- [ ] Soulmate aspects highlighted
- [ ] Composite chart renders

**Sharing:**
- [ ] Share button generates link
- [ ] Copy to clipboard works
- [ ] Share URL is accessible
- [ ] Shared page displays correctly

---

## Error Scenario Testing

### 1. Database Connection Errors

```bash
# Test: Stop database and make request
# Stop PostgreSQL
pg_ctl stop

# Make request
curl -X GET "http://localhost:3000/api/v1/calendar/month/2026/2" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (500 Internal Server Error):
{
  "success": false,
  "error": {
    "message": "Database connection error",
    "code": "DATABASE_ERROR"
  }
}

# Restart database
pg_ctl start
```

**Acceptance Criteria:**
- [ ] Graceful error handling
- [ ] No stack traces exposed
- [ ] User-friendly error message
- [ ] Server recovers when database restarts

### 2. External Service Failures

**Test:** Swiss Ephemeris unavailable

```javascript
// In backend service, mock failure
// Then test frontend handles it
```

**Acceptance Criteria:**
- [ ] Frontend displays error
- [ ] Retry option available
- [ ] No infinite loading states
- [ ] Error is logged

### 3. Network Timeouts

```bash
# Test: Slow database query
psql -U postgres -d astrology_test -c "SELECT pg_sleep(30);"

# In another terminal, make API request
curl -X GET "http://localhost:3000/api/v1/calendar/month/2026/2" \
  -H "Authorization: Bearer $TOKEN" \
  --max-time 5

# Expected: Timeout error or slow response
```

**Acceptance Criteria:**
- [ ] Request times out after configured duration
- [ ] Timeout error is clear
- [ ] Frontend handles timeout
- [ ] No memory leaks

---

## Accessibility Testing

### 1. Keyboard Navigation

**Test Plan:**
```
1. Open calendar page
2. Press Tab - focus should move to Previous button
3. Press Enter - should go to previous month
4. Press Tab - focus on Today button
5. Press Enter - should go to current month
6. Press Tab - focus on Next button
7. Press Enter - should go to next month
8. Press Tab - focus on first day in calendar
9. Use arrow keys - should navigate days (if implemented)
```

**Acceptance Criteria:**
- [ ] All interactive elements keyboard accessible
- [ ] Logical tab order
- [ ] Visible focus indicators
- [ ] No keyboard traps

### 2. Screen Reader Testing

**Test with NVDA (Windows) or VoiceOver (Mac):**
```
1. Enable screen reader
2. Navigate to /calendar
3. Navigate calendar grid
4. Verify:
   - Day numbers announced
   - Event badges announced
   - Buttons have labels
   - Month title announced
```

**Acceptance Criteria:**
- [ ] All content screen reader accessible
- [ ] ARIA labels correct
- [ ] Semantic HTML used
- [ ] Alt text for images

### 3. Color Contrast

**Test:** Use Chrome DevTools Lighthouse

```
1. Open DevTools
2. Lighthouse > Options
3. Check "Accessibility"
4. Run audit
```

**Manual Check:**
```javascript
// In browser console, check contrast ratios
const elements = document.querySelectorAll('*');
elements.forEach(el => {
  const styles = window.getComputedStyle(el);
  const color = styles.color;
  const bg = styles.backgroundColor;
  // Calculate contrast ratio
  // Target: 4.5:1 for normal text, 3:1 for large text
});
```

**Acceptance Criteria:**
- [ ] All text WCAG AA compliant
- [ ] Event badges have sufficient contrast
- [ ] Buttons meet contrast requirements
- [ ] No color-only information

---

## Test Reporting

### Test Results Template

```markdown
## Test Execution Results - [Date]

**Tester:** [Name]
**Environment:** [Local/Staging/Production]
**Test Duration:** [Hours]

### Summary

| Feature | Tests Run | Passed | Failed | Blocked |
|---------|-----------|--------|--------|---------|
| Calendar API | 15 | 15 | 0 | 0 |
| Lunar Return API | 12 | 11 | 1 | 0 |
| Synastry API | 10 | 10 | 0 | 0 |
| Integration | 3 | 3 | 0 | 0 |
| Security | 8 | 8 | 0 | 0 |
| Performance | 5 | 4 | 1 | 0 |
| **Total** | **53** | **51** | **2** | **0** |

### Failed Tests

1. **Lunar Return - Get Current Return**
   - Issue: daysUntil calculation off by 1
   - Severity: Medium
   - Status: Assigned to dev

2. **Performance - Calendar Query**
   - Issue: Query takes 150ms (target < 100ms)
   - Severity: Low
   - Status: Optimization needed

### Blocked Tests

None

### Recommendations

1. Fix daysUntil calculation before release
2. Add index to calendar_events table for performance
3. Ready for staging deployment after fixes

### Sign-off

**QA Lead:** _________  **Date:** _________
**Developer:** _________  **Date:** _________
```

### Bug Report Template

```markdown
## Bug Report: [Title]

**Feature:** [Calendar/Lunar Return/Synastry]
**Severity:** [Critical/High/Medium/Low]
**Priority:** [P1/P2/P3/P4]

### Steps to Reproduce

1. Go to [page]
2. Click [element]
3. Enter [input]
4. See error

### Expected Behavior

[What should happen]

### Actual Behavior

[What actually happens]

### Screenshots

[Attach screenshot]

### Environment

- OS: [Windows/Mac/Linux]
- Browser: [Chrome/Firefox/Safari]
- Version: [X.X]

### Additional Context

[Logs, error messages, etc.]
```

---

## Conclusion

This runtime testing plan provides:

1. ✅ **Specific test commands** for all endpoints
2. ✅ **Integration test scenarios** covering complete workflows
3. ✅ **Security testing** for authentication and input validation
4. ✅ **Performance testing** with measurable targets
5. ✅ **Frontend UI testing** with manual checklists
6. ✅ **Error scenario testing** for edge cases
7. ✅ **Accessibility testing** for inclusive design
8. ✅ **Test reporting templates** for documentation

**Next Steps:**
1. Set up test environment with database
2. Execute API endpoint tests (automated with scripts)
3. Perform manual UI testing
4. Document results in test report template
5. Address any failures before deployment

**Estimated Testing Time:** 4-6 hours for complete execution

---

*Document Version: 1.0*
*Last Updated: 2026-02-17*
*Author: Claude Sonnet 4.5*

# Feature Specification: Google Calendar Integration

**Version:** 1.0
**Status:** Ready for Development
**Priority:** P1 (High Impact, Medium Effort)
**Requirement ID:** REQ-CAL-004
**Timeline:** 1.5 weeks

---

## 1. Feature Overview

### 1.1 Objective
Enable users to export their astrological calendar events directly to Google Calendar via OAuth integration, providing seamless calendar synchronization.

### 1.2 User Stories
- **As a user**, I want to connect my Google Calendar so I can see astrological events alongside my regular events
- **As a user**, I want to export selected events to Google Calendar so I can manage my schedule holistically
- **As a user**, I want to sync automatically so I don't have to manually export

### 1.3 Success Criteria
- OAuth flow completes successfully
- Events appear in Google Calendar within 5 seconds
- Recurring events are properly created
- User can disconnect Google Calendar
- Token refresh works automatically

---

## 2. Technical Architecture

### 2.1 OAuth 2.0 Flow

```
User clicks "Connect Google Calendar"
        ↓
Redirect to Google OAuth consent screen
        ↓
User grants calendar permissions
        ↓
Google redirects back with auth code
        ↓
Backend exchanges code for tokens
        ↓
Store refresh_token in database
        ↓
User can now export events
```

### 2.2 Required Google API Scopes

```typescript
const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',    // Create/edit events
  'https://www.googleapis.com/auth/calendar.readonly',  // Read calendar list
];
```

### 2.3 Token Management

```typescript
interface GoogleCalendarTokens {
  access_token: string;   // Short-lived (1 hour)
  refresh_token: string;  // Long-lived, stored encrypted
  expires_at: number;     // Unix timestamp
  scope: string;
  token_type: 'Bearer';
}
```

---

## 3. API Specification

### 3.1 OAuth Endpoints

#### `GET /api/calendar/google/connect`
**Description:** Initiate Google OAuth flow

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### `GET /api/calendar/google/callback`
**Description:** OAuth callback handler

**Query Parameters:**
- `code` (required): Authorization code from Google
- `state` (required): CSRF state token

**Response:** Redirect to calendar settings with success/error message

#### `DELETE /api/calendar/google/disconnect`
**Description:** Revoke Google Calendar access

**Response:**
```json
{
  "success": true,
  "message": "Google Calendar disconnected"
}
```

### 3.2 Export Endpoints

#### `POST /api/calendar/google/export`
**Description:** Export events to Google Calendar

**Request Body:**
```json
{
  "startDate": "2026-03-01",
  "endDate": "2026-03-31",
  "eventTypes": ["transit", "lunar_phase", "retrograde"],
  "includePersonal": true,
  "calendarId": "primary"
}
```

**Response:**
```json
{
  "success": true,
  "exportedCount": 12,
  "calendarId": "primary",
  "events": [
    {
      "googleEventId": "abc123",
      "astroEventId": "evt_456",
      "summary": "Mercury enters Aries"
    }
  ]
}
```

### 3.3 Calendar Management

#### `GET /api/calendar/google/calendars`
**Description:** List user's Google Calendars

**Response:**
```json
{
  "calendars": [
    {
      "id": "primary",
      "summary": "user@example.com",
      "primary": true
    },
    {
      "id": "calendar123",
      "summary": "Astrology",
      "primary": false
    }
  ]
}
```

---

## 4. Database Schema

### 4.1 `google_calendar_integrations` Table

```sql
CREATE TABLE google_calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  google_user_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,           -- Encrypted
  refresh_token TEXT NOT NULL,          -- Encrypted
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT,
  calendar_id VARCHAR(255) DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_google_cal_user ON google_calendar_integrations (user_id);
```

### 4.2 `exported_calendar_events` Table

```sql
CREATE TABLE exported_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES google_calendar_integrations(id) ON DELETE CASCADE,
  astro_event_id UUID REFERENCES astrological_events(id),
  google_event_id VARCHAR(255) NOT NULL,
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(integration_id, astro_event_id)
);

CREATE INDEX idx_exported_events ON exported_calendar_events (integration_id);
```

---

## 5. Frontend Components

### 5.1 GoogleCalendarConnect Component

**File:** `frontend/src/components/GoogleCalendarConnect.tsx`

```typescript
interface GoogleCalendarConnectProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  connectedEmail?: string;
}

// Features:
// - "Connect Google Calendar" button when not connected
// - Connected state shows Google account email
// - Disconnect button
// - Loading states during OAuth
// - Error handling for OAuth failures
```

### 5.2 GoogleCalendarExport Component

**File:** `frontend/src/components/GoogleCalendarExport.tsx`

```typescript
interface GoogleCalendarExportProps {
  startDate: Date;
  endDate: Date;
  onExport: (options: ExportOptions) => void;
  isExporting: boolean;
  lastExport?: Date;
}

// Features:
// - Date range picker
// - Event type checkboxes (transits, lunar phases, retrogrades)
// - Include personal transits toggle
// - Calendar selector dropdown
// - Export button with progress indicator
// - Export history display
```

---

## 6. Event Mapping

### 6.1 Astrological Event to Google Calendar Event

```typescript
function mapToGoogleEvent(astroEvent: AstrologicalEvent): GoogleCalendarEvent {
  return {
    summary: astroEvent.eventName,
    description: `${astroEvent.description}\n\nAdvice: ${astroEvent.advice}`,
    start: {
      dateTime: astroEvent.startDate.toISOString(),
      timeZone: astroEvent.timezone
    },
    end: {
      dateTime: (astroEvent.endDate || astroEvent.startDate).toISOString(),
      timeZone: astroEvent.timezone
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 24 * 60 },  // 1 day before
      ]
    },
    extendedProperties: {
      private: {
        astroEventId: astroEvent.id,
        eventType: astroEvent.eventType,
        intensity: astroEvent.intensity.toString()
      }
    },
    colorId: getColorIdForIntensity(astroEvent.intensity)
  };
}

function getColorIdForIntensity(intensity: number): string {
  if (intensity >= 8) return '11';  // Red - high intensity
  if (intensity >= 5) return '5';   // Yellow - medium
  return '2';                       // Green - low
}
```

---

## 7. Test Cases

### 7.1 Unit Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| UT-GCAL-001 | Generate OAuth URL | URL contains correct scopes |
| UT-GCAL-002 | Exchange code for tokens | Tokens stored correctly |
| UT-GCAL-003 | Refresh expired token | New access token obtained |
| UT-GCAL-004 | Map event to Google format | Correct event structure |
| UT-GCAL-005 | Handle API rate limits | Retry with backoff |

### 7.2 Integration Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| IT-GCAL-001 | Complete OAuth flow | Integration record created |
| IT-GCAL-002 | Export single event | Event appears in Google Calendar |
| IT-GCAL-003 | Export batch events | All events exported |
| IT-GCAL-004 | Disconnect integration | Tokens revoked and deleted |
| IT-GCAL-005 | Token auto-refresh | Expired token refreshed on API call |

### 7.3 E2E Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| E2E-GCAL-001 | Connect Google Calendar | Redirect and successful connection |
| E2E-GCAL-002 | Export events to Google | Success message, events exported |
| E2E-GCAL-003 | Select target calendar | Events appear in selected calendar |
| E2E-GCAL-004 | Disconnect Google Calendar | Confirmation, integration removed |
| E2E-GCAL-005 | Handle OAuth denial | Graceful error message |

---

## 8. Security Considerations

### 8.1 Token Storage
- Encrypt refresh tokens at rest using AES-256
- Store in database, not in frontend
- Never log tokens

### 8.2 OAuth State
- Use cryptographically secure state parameter
- Validate state on callback
- State expires after 10 minutes

### 8.3 API Security
- Validate Google webhook signatures
- Rate limit export endpoints
- Audit log all calendar operations

---

## 9. Implementation Checklist

### Week 1: Backend Foundation

**Day 1-2: OAuth Setup**
- [ ] Configure Google Cloud Console project
- [ ] Implement OAuth initiation endpoint
- [ ] Implement OAuth callback handler
- [ ] Create token encryption/decryption service
- [ ] Database migration for integration table

**Day 3-4: Google Calendar API**
- [ ] Implement token refresh logic
- [ ] Create Google Calendar API client
- [ ] Implement event export service
- [ ] Create calendar listing endpoint

**Day 5: Testing & Documentation**
- [ ] Unit tests for OAuth flow
- [ ] Integration tests with mocked Google API
- [ ] API documentation

### Week 2: Frontend & E2E

**Day 1-2: Components**
- [ ] GoogleCalendarConnect component
- [ ] GoogleCalendarExport component
- [ ] Update CalendarSettings page

**Day 3-4: Integration**
- [ ] Connect frontend to backend
- [ ] Handle OAuth redirects
- [ ] Error handling and loading states

**Day 5: E2E Testing**
- [ ] E2E tests with Playwright
- [ ] Manual testing with real Google accounts
- [ ] Documentation

---

## 10. Environment Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/calendar/google/callback

# Encryption
TOKEN_ENCRYPTION_KEY=your_32_byte_encryption_key
```

---

## 11. Acceptance Criteria

- [ ] User can initiate Google OAuth flow
- [ ] User can grant calendar permissions
- [ ] Connection persists across sessions
- [ ] User can select target calendar
- [ ] Events export to Google Calendar
- [ ] Events include proper descriptions and reminders
- [ ] User can disconnect integration
- [ ] All test cases pass
- [ ] Security audit completed

---

**Ready for development!** ✅

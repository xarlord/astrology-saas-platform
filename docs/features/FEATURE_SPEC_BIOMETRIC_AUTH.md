# Feature Specification: Biometric Authentication for PWA

**Version:** 1.0
**Status:** Ready for Development
**Priority:** P3 (Low Impact, High Effort)
**Requirement ID:** REQ-PWA-004
**Timeline:** 2 weeks

---

## 1. Feature Overview

### 1.1 Objective
Implement biometric authentication (FaceID/TouchID) for the Progressive Web App, providing a seamless and secure login experience for mobile users.

### 1.2 User Stories
- **As a mobile user**, I want to log in with my face/fingerprint so I don't have to type my password
- **As a mobile user**, I want to enable/disable biometric login so I can control my security preferences
- **As a mobile user**, I want a fallback to password when biometric fails

### 1.3 Success Criteria
- Biometric prompt appears on login screen
- Authentication completes in < 2 seconds
- Fallback to password always available
- User can manage biometric settings
- Works on iOS Safari and Android Chrome

---

## 2. Technical Architecture

### 2.1 Web Authentication API

This feature uses the Web Authentication API (WebAuthn) which provides:
- Public key cryptography
- Platform authenticator integration (FaceID, TouchID, Windows Hello)
- Fallback to password

### 2.2 Authentication Flow

```
User enables biometric in settings
        ↓
App creates credential with WebAuthn
        ↓
Credential stored in device authenticator
        ↓
User returns to login
        ↓
App requests biometric authentication
        ↓
User verifies with face/fingerprint
        ↓
App verifies assertion with backend
        ↓
User logged in
```

### 2.3 Browser Support

| Platform | Browser | Support |
|----------|---------|---------|
| iOS 14+ | Safari | ✅ FaceID/TouchID |
| Android 9+ | Chrome | ✅ Fingerprint |
| Windows 10+ | Edge | ✅ Windows Hello |
| macOS | Safari | ✅ TouchID |
| Desktop | Chrome | ⚠️ Platform key |

---

## 3. API Specification

### 3.1 Registration Endpoints

#### `POST /api/auth/webauthn/register/start`
**Description:** Start biometric registration

**Request Body:**
```json
{
  "deviceName": "iPhone 15 Pro"
}
```

**Response:**
```json
{
  "challenge": "base64-encoded-challenge",
  "rp": {
    "id": "astrovers.com",
    "name": "AstroVerse"
  },
  "user": {
    "id": "base64-user-id",
    "name": "user@example.com",
    "displayName": "John Doe"
  },
  "pubKeyCredParams": [
    { "type": "public-key", "alg": -7 },
    { "type": "public-key", "alg": -257 }
  ],
  "timeout": 60000,
  "attestation": "direct"
}
```

#### `POST /api/auth/webauthn/register/finish`
**Description:** Complete biometric registration

**Request Body:**
```json
{
  "credential": {
    "id": "credential-id",
    "rawId": "base64-raw-id",
    "type": "public-key",
    "response": {
      "clientDataJSON": "...",
      "attestationObject": "..."
    }
  },
  "deviceName": "iPhone 15 Pro"
}
```

**Response:**
```json
{
  "success": true,
  "credentialId": "cred_abc123",
  "deviceName": "iPhone 15 Pro"
}
```

### 3.2 Authentication Endpoints

#### `POST /api/auth/webauthn/authenticate/start`
**Description:** Start biometric authentication

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "challenge": "base64-challenge",
  "timeout": 60000,
  "rpId": "astrovers.com",
  "allowCredentials": [
    {
      "type": "public-key",
      "id": "base64-credential-id",
      "transports": ["internal"]
    }
  ]
}
```

#### `POST /api/auth/webauthn/authenticate/finish`
**Description:** Complete biometric authentication

**Request Body:**
```json
{
  "credential": {
    "id": "credential-id",
    "rawId": "base64-raw-id",
    "type": "public-key",
    "response": {
      "clientDataJSON": "...",
      "authenticatorData": "...",
      "signature": "...",
      "userHandle": "..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 3.3 Management Endpoints

#### `GET /api/auth/webauthn/credentials`
**Description:** List registered credentials

**Response:**
```json
{
  "credentials": [
    {
      "id": "cred_abc123",
      "deviceName": "iPhone 15 Pro",
      "createdAt": "2026-03-19T10:00:00Z",
      "lastUsedAt": "2026-03-19T15:00:00Z",
      "aaguid": "device-aaguid"
    }
  ]
}
```

#### `DELETE /api/auth/webauthn/credentials/:id`
**Description:** Remove a credential

---

## 4. Database Schema

### 4.1 `webauthn_credentials` Table

```sql
CREATE TABLE webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  credential_id BYTEA NOT NULL UNIQUE,
  public_key BYTEA NOT NULL,
  sign_count BIGINT NOT NULL DEFAULT 0,
  aaguid UUID,
  device_name VARCHAR(255),
  transports TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, credential_id)
);

CREATE INDEX idx_webauthn_user ON webauthn_credentials (user_id);
CREATE INDEX idx_webauthn_cred ON webauthn_credentials (credential_id);
```

### 4.2 `webauthn_challenges` Table

```sql
CREATE TABLE webauthn_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge BYTEA NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('register', 'authenticate')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_webauthn_challenges ON webauthn_challenges (user_id, expires_at);
```

---

## 5. Frontend Components

### 5.1 BiometricSettings Component

**File:** `frontend/src/components/BiometricSettings.tsx`

```typescript
interface BiometricSettingsProps {
  credentials: WebAuthnCredential[];
  onEnable: () => Promise<void>;
  onDisable: (credentialId: string) => Promise<void>;
  isLoading: boolean;
}

// Features:
// - List of registered devices
// - "Add biometric" button
// - Device management (rename, delete)
// - Enable/disable toggle
// - Platform detection and guidance
```

### 5.2 BiometricLogin Component

**File:** `frontend/src/components/BiometricLogin.tsx`

```typescript
interface BiometricLoginProps {
  email: string;
  onSuccess: (user: User) => void;
  onFallback: () => void;
}

// Features:
// - Check if biometric is available
// - Show biometric login button
// - Handle WebAuthn ceremony
// - Fallback to password link
// - Error handling
```

### 5.3 WebAuthn Service

**File:** `frontend/src/services/webauthnService.ts`

```typescript
class WebAuthnService {
  // Check if WebAuthn is available
  isAvailable(): boolean;

  // Check if user has credentials
  hasCredentials(email: string): Promise<boolean>;

  // Register new credential
  register(deviceName: string): Promise<WebAuthnCredential>;

  // Authenticate with credential
  authenticate(email: string): Promise<User>;

  // Get credentials for current user
  getCredentials(): Promise<WebAuthnCredential[]>;

  // Remove credential
  removeCredential(credentialId: string): Promise<void>;
}
```

---

## 6. Security Considerations

### 6.1 Challenge Management
- Challenges are single-use
- Challenges expire after 5 minutes
- Challenges are at least 32 bytes
- Challenges are cryptographically random

### 6.2 Credential Storage
- Public keys stored securely
- Sign count tracked for clone detection
- Credential IDs are unique per user

### 6.3 User Verification
- Require user verification (UV) flag
- Fall back to password if UV fails
- Track failed attempts

### 6.4 Origin Validation
- Validate RP ID matches origin
- Check TLS in production
- Validate client data

---

## 7. Test Cases

### 7.1 Unit Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| UT-BIO-001 | Generate registration challenge | Valid challenge created |
| UT-BIO-002 | Verify registration response | Credential stored |
| UT-BIO-003 | Generate auth challenge | Valid challenge created |
| UT-BIO-004 | Verify auth response | User authenticated |
| UT-BIO-005 | Detect cloned authenticator | Error on sign count mismatch |
| UT-BIO-006 | Challenge expiration | Expired challenge rejected |

### 7.2 Integration Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| IT-BIO-001 | Full registration flow | Credential in database |
| IT-BIO-002 | Full authentication flow | JWT token returned |
| IT-BIO-003 | Duplicate credential | Error returned |
| IT-BIO-004 | Delete credential | Credential removed |
| IT-BIO-005 | List credentials | All user credentials returned |

### 7.3 E2E Tests

| Test ID | Description | Expected Result |
|---------|-------------|-----------------|
| E2E-BIO-001 | Enable biometric in settings | Credential registered |
| E2E-BIO-002 | Login with biometric | User logged in |
| E2E-BIO-003 | Fallback to password | Password login works |
| E2E-BIO-004 | Remove biometric device | Credential deleted |
| E2E-BIO-005 | Biometric unavailable message | Clear user guidance |

---

## 8. Implementation Checklist

### Week 1: Backend

**Day 1-2: Setup**
- [ ] Install @simplewebauthn/server package
- [ ] Create database migrations
- [ ] Configure RP settings
- [ ] Implement challenge service

**Day 3-4: Endpoints**
- [ ] Registration start/finish endpoints
- [ ] Authentication start/finish endpoints
- [ ] Credential management endpoints
- [ ] Unit tests

**Day 5: Security**
- [ ] Origin validation
- [ ] Challenge cleanup job
- [ ] Sign count verification
- [ ] Security testing

### Week 2: Frontend

**Day 1-2: Service Layer**
- [ ] Install @simplewebauthn/browser
- [ ] Create WebAuthnService
- [ ] Handle browser compatibility
- [ ] Error handling

**Day 3-4: Components**
- [ ] BiometricSettings component
- [ ] BiometricLogin component
- [ ] Update Login page
- [ ] Update Settings page

**Day 5: Testing**
- [ ] E2E tests
- [ ] Manual testing on devices
- [ ] Documentation

---

## 9. Environment Configuration

```bash
# WebAuthn Configuration
WEBAUTHN_RP_ID=astrovers.com
WEBAUTHN_RP_NAME=AstroVerse
WEBAUTHN_RP_ICON=https://astrovers.com/icon.png
WEBAUTHN_TIMEOUT=60000
WEBAUTHN_CHALLENGE_EXPIRY=300
```

---

## 10. Fallback Strategy

When biometric authentication is not available:

1. **WebAuthn not supported** → Show password login only
2. **No credentials registered** → Show password login + enable prompt
3. **Authentication failed** → Show retry + fallback to password
4. **Device not available** → Show fallback options

```typescript
async function handleLogin(email: string): Promise<void> {
  // Check WebAuthn availability
  if (!webAuthnService.isAvailable()) {
    return fallbackToPassword();
  }

  // Check if user has credentials
  const hasCredentials = await webAuthnService.hasCredentials(email);
  if (!hasCredentials) {
    return fallbackToPassword();
  }

  // Attempt biometric auth
  try {
    const user = await webAuthnService.authenticate(email);
    return onSuccess(user);
  } catch (error) {
    // Show biometric failed, offer password fallback
    return showPasswordFallback();
  }
}
```

---

## 11. Acceptance Criteria

- [ ] WebAuthn registration works on iOS Safari
- [ ] WebAuthn registration works on Android Chrome
- [ ] FaceID prompt appears on supported iOS devices
- [ ] Fingerprint prompt appears on supported Android devices
- [ ] User can manage multiple devices
- [ ] Fallback to password always available
- [ ] All test cases pass
- [ ] Security review completed

---

**Ready for development!** ✅

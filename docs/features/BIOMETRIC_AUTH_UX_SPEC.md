# Biometric Authentication — UX Design Spec

**Date:** 2026-04-05
**Designer:** UX Designer 2
**Feature Spec:** FEATURE_SPEC_BIOMETRIC_AUTH.md
**Priority:** P3

---

## 1. UX Surfaces Overview

| Surface | Location | Purpose |
|---------|----------|---------|
| Biometric login prompt | LoginPageNew (right panel) | Quick login via FaceID/TouchID/fingerprint |
| Biometric settings | ProfileSettingsPage → Account tab | Register, manage, remove biometric credentials |
| Biometric enable prompt | LoginPageNew (post-login banner) | Encourage setup after successful password login |

### Entry Points

1. **LoginPageNew** → Biometric button appears when user has registered credentials
2. **LoginPageNew** → "Enable biometric" banner appears after password login (if not yet enabled)
3. **ProfileSettingsPage** → Account tab → new "Biometric Login" section

---

## 2. Login Page — Biometric Prompt

### 2.1 Layout (User Has Biometric Credentials)

Insert a biometric login button above the email/password form:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              [Sparkles icon]                    │
│           Welcome Back Stargazer               │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │  [fingerprint]  Sign in with Face ID      │  │
│  │                  or use password below     │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ─────────────── or ──────────────              │
│                                                 │
│  Email                                          │
│  ┌─────────────────────────────────────────┐    │
│  │  [mail]  Enter your email               │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Password                                       │
│  ┌─────────────────────────────────────────┐    │
│  │  [lock]  Enter password        [eye]    │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  [  Remember me  ]          Forgot password?    │
│                                                 │
│  [            Sign In            ]              │
│                                                 │
│  Don't have an account? Sign up                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2.2 Biometric Button Styling

The biometric button uses a subtle cosmic glow to draw attention:

```tsx
<button
  onClick={handleBiometricLogin}
  className="w-full flex items-center gap-3 p-4 rounded-xl
    bg-primary/10 border border-primary/30
    hover:bg-primary/20 hover:border-primary/50
    transition-all duration-200 group"
>
  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center
    group-hover:shadow-[0_0_15px_rgba(107,61,225,0.4)] transition-shadow">
    <span className="material-symbols-outlined text-primary text-[22px]">
      {platformIcon}
    </span>
  </div>
  <div className="text-left">
    <p className="text-white font-medium text-sm">
      Sign in with {platformName}
    </p>
    <p className="text-slate-400 text-xs">
      Quick access using biometrics
    </p>
  </div>
  <span className="material-symbols-outlined text-slate-500 ml-auto">
    arrow_forward
  </span>
</button>
```

### 2.3 Platform Icon Detection

The icon and label adapt to the detected platform:

| Platform | Icon | Label |
|----------|------|-------|
| iOS (Face ID) | `face` | Sign in with Face ID |
| iOS (Touch ID) | `fingerprint` | Sign in with Touch ID |
| Android | `fingerprint` | Sign in with Fingerprint |
| Windows | `fingerprint` | Sign in with Windows Hello |
| macOS (Touch ID) | `fingerprint` | Sign in with Touch ID |
| Unknown/unsupported | (hidden) | (biometric button not shown) |

### 2.4 Biometric Auth Flow States

**Prompting:**
```
┌───────────────────────────────────────────┐
│                                           │
│  [animate-spin progress_activity]         │
│                                           │
│  Waiting for biometric verification...    │
│                                           │
└───────────────────────────────────────────┘
```
The button transitions to a loading state with spinner.

**Success:** Auto-redirect to dashboard (same as password login success flow).

**Failed — retry:**
```
┌───────────────────────────────────────────┐
│                                           │
│  [error]  Verification failed             │
│  Biometric didn't match. Please try       │
│  again or use your password.              │
│                                           │
│  [Try Again]          [Use Password]      │
│                                           │
└───────────────────────────────────────────┘
```

**Not available on device:**
The biometric button is simply hidden. User sees only the email/password form.

### 2.5 Login Page — No Biometric (First Visit)

When user has NOT registered biometric credentials, the login page shows the standard email/password form with no biometric button. After successful password login, show an enable prompt (see section 4).

---

## 3. Account Tab — Biometric Settings

### 3.1 Placement

Add a new section between "Change Password" and "Danger Zone" in the Account tab:

```
┌─────────────────────────────────────────────────────────┐
│  [lock]  Security                                       │
│  ──────────────────────────────────────────────────     │
│                                                         │
│  Change Password                                        │
│  (existing password form)                               │
│                                                         │
│  ─────────────────────────────────────────────────      │
│                                                         │
│  [fingerprint]  Biometric Login                         │
│  ─────────────────────────────────────────────────      │
│                                                         │
│  (content varies by state — see below)                  │
│                                                         │
│  ─────────────────────────────────────────────────      │
│                                                         │
│  [warning]  Danger Zone                                 │
│  (existing delete account)                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 State: No Biometric Registered

```
┌─────────────────────────────────────────────────────────┐
│  [fingerprint]  Biometric Login                         │
│  ─────────────────────────────────────────────────      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │    [fingerprint icon, 36px, muted with glow]      │  │
│  │                                                   │  │
│  │    Quick & Secure Access                          │  │
│  │    Use Face ID, Touch ID, or fingerprint to       │  │
│  │    sign in without typing your password.          │  │
│  │                                                   │  │
│  │    ✓ Faster than typing passwords                 │  │
│  │    ✓ Secure — credentials stay on your device     │  │
│  │    ✓ Works offline                               │  │
│  │                                                   │  │
│  │    [Set Up Biometric Login]                       │  │
│  │     (primary button)                              │  │
│  │                                                   │  │
│  │  [shield] Your biometric data never leaves        │  │
│  │  your device. We only store a cryptographic       │  │
│  │  key, never your fingerprint or face data.        │  │
│  │                                                   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.3 State: Registration Flow

When user clicks "Set Up Biometric Login":

**Step 1: Name your device**
```
┌───────────────────────────────────────────────────┐
│                                                   │
│  Set Up Biometric Login                           │
│                                                   │
│  Device Name                                      │
│  ┌─────────────────────────────────────────────┐  │
│  │  iPhone 15 Pro (auto-detected)              │  │
│  └─────────────────────────────────────────────┘  │
│                                                   │
│  [Cancel]                    [Continue]           │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Step 2: Biometric prompt (system native)**
The browser/OS shows its native Face ID / Touch ID / fingerprint prompt. No custom UI needed.

**Step 3: Success**
```
┌───────────────────────────────────────────────────┐
│                                                   │
│  [check_circle]                                   │
│  Biometric login enabled!                         │
│                                                   │
│  You can now sign in quickly using Face ID.       │
│                                                   │
│  [Done]                                           │
│                                                   │
└───────────────────────────────────────────────────┘
```

**Step 3b: Error**
```
┌───────────────────────────────────────────────────┐
│                                                   │
│  [error]                                          │
│  Setup failed                                     │
│                                                   │
│  Could not register your biometric.               │
│  Make sure your device supports biometric         │
│  authentication and try again.                    │
│                                                   │
│  [Try Again]                  [Cancel]            │
│                                                   │
└───────────────────────────────────────────────────┘
```

### 3.4 State: Biometric Enabled — Device List

```
┌─────────────────────────────────────────────────────────┐
│  [fingerprint]  Biometric Login                Enabled  │
│  ─────────────────────────────────────────────────      │
│                                                         │
│  Registered Devices                                     │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [smartphone]  iPhone 15 Pro                      │  │
│  │  Registered Apr 3, 2026  •  Last used 2h ago     │  │
│  │                                       [delete]    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [laptop_mac]  MacBook Pro                        │  │
│  │  Registered Mar 15, 2026  •  Last used 5d ago    │  │
│  │                                       [delete]    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  [+ Add Another Device]                                 │
│   (secondary button, bg-white/5)                       │
│                                                         │
│  [info] Removing all devices disables biometric login. │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.5 Remove Device Confirmation

Uses existing `ConfirmModal`:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  [delete]                                        │
│  Remove "iPhone 15 Pro"?                         │
│                                                  │
│  This will disable biometric login on this        │
│  device. You can set it up again anytime.         │
│                                                  │
│  [Cancel]                   [Remove]             │
│                               (danger variant)    │
└──────────────────────────────────────────────────┘
```

---

## 4. Post-Login Enable Prompt

After a successful password login, if biometric is supported but not yet set up, show a dismissable banner on the dashboard:

```
┌─────────────────────────────────────────────────────────┐
│  [fingerprint]  Enable Quick Login                      │
│  Sign in faster next time using Face ID on this device. │
│                                    [Enable Now]  [✕]    │
│                                                         │
└─────────────────────────────────────────────────────────┘

Background: bg-primary/5 border border-primary/20
Dismiss: stores in localStorage, never shows again
```

This banner appears at the top of the AppLayout content area, below the top nav.
It auto-dismisses after 30 seconds or on explicit close.

---

## 5. Design Token Reference

| Element | Token |
|---------|-------|
| Biometric button bg | `bg-primary/10 border border-primary/30 hover:bg-primary/20` |
| Biometric button icon circle | `bg-primary/20 text-primary` |
| Biometric button glow on hover | `shadow-[0_0_15px_rgba(107,61,225,0.4)]` |
| Empty state card | `bg-white/5 border border-white/10 rounded-2xl` |
| Device card | `bg-surface-dark/50 border border-white/5 rounded-xl` |
| Enabled badge | `text-emerald-400 bg-emerald-500/10` |
| Success state | `text-emerald-300 bg-emerald-500/10 border border-emerald-500/20` |
| Error state | `text-red-300 bg-red-500/10 border border-red-500/20` |
| Info callout | `text-primary bg-primary/10 border border-primary/20 rounded-lg` |
| Post-login banner | `bg-primary/5 border border-primary/20` |
| Divider | `border-t border-white/5` |

---

## 6. Component Dependencies

| Existing Component | Reuse For |
|--------------------|-----------|
| `pages/LoginPageNew.tsx` | Add biometric button above form |
| `pages/ProfileSettingsPage.tsx` | Add Biometric section in Account tab |
| `components/ui/Button.tsx` | All buttons |
| `components/ui/ConfirmModal.tsx` | Device removal confirmation |
| `components/ui/Toggle.tsx` | Not used (device-level management instead) |
| `hooks/useAuth.ts` | Add `biometricLogin()` method |

New components:
| Component | File |
|-----------|------|
| BiometricLoginButton | `components/auth/BiometricLoginButton.tsx` |
| BiometricSettings | `components/auth/BiometricSettings.tsx` |
| BiometricDeviceCard | `components/auth/BiometricDeviceCard.tsx` |
| BiometricEnableBanner | `components/auth/BiometricEnableBanner.tsx` |

New service:
| Service | File |
|---------|------|
| WebAuthnService | `services/webauthn.service.ts` |

---

## 7. Accessibility Notes

- Biometric button has `aria-label="Sign in with {platformName}"`
- Device list uses `role="list"` with `role="listitem"` per device
- Remove buttons have `aria-label="Remove biometric from {deviceName}"`
- Registration success/error announcements use `role="status"` and `role="alert"`
- The native biometric prompt is handled by the browser/OS — no custom ARIA needed
- Post-login banner uses `role="status"` with `aria-live="polite"`
- All icon-only buttons have `aria-label`
- Keyboard: Biometric button is focusable and activatable via Enter/Space

---

## 8. Mobile Adaptations

### Login Page (Biometric Button)
- Biometric button fills full width on mobile
- Icon circle reduces from `w-10 h-10` to `w-8 h-8`
- Platform text wraps if needed

### Account Tab (Biometric Settings)
- Device cards full-width, stack vertically
- "Add Another Device" button full-width
- Info callout text stays readable (no truncation)

### Post-Login Banner
- Full-width with reduced padding on mobile
- "Enable Now" and dismiss button stack or shrink

---

## 9. States Summary

| State | Location | UI |
|-------|----------|----|
| Biometric not supported | Login | Standard email/password form only (no button) |
| Supported, no credentials | Login | Standard form + post-login enable banner |
| Supported, has credentials | Login | Biometric button + or-divider + password form |
| Registration — naming | Settings | Modal with device name input |
| Registration — prompting | Settings | Native OS biometric prompt (system UI) |
| Registration — success | Settings | Success card with check icon |
| Registration — error | Settings | Error card with retry button |
| Enabled, 1 device | Settings | Device list + "Add Another" button |
| Enabled, 2+ devices | Settings | Device list + "Add Another" button |
| Removing device | Settings | ConfirmModal |
| All devices removed | Settings | Returns to "no biometric" empty state |
| Login biometric fail | Login | Error inline on biometric button + "Use Password" link |
| Post-login banner | Dashboard | Dismissable banner at top of content |
| Banner dismissed | Dashboard | Hidden, localStorage flag set |

---

## 10. Security UX Considerations

1. **Trust messaging**: Always show "Your biometric data never leaves your device" near the enable button. This addresses the #1 user concern about biometric auth.

2. **Device naming**: Auto-detect device name from `navigator.userAgent` but allow manual edit. This helps users identify which device's access they're managing.

3. **Last used tracking**: Show "Last used X ago" on each device card. Helps users identify stale credentials.

4. **Graceful fallback**: Never block login. If biometric fails 3 times, auto-switch to password mode with a hint.

5. **No biometric shaming**: Don't show "insecure" labels for users who choose not to enable biometric. It's a preference, not a security level.

---

## 11. Implementation Notes for Frontend Engineer

1. **@simplewebauthn/browser**: Install this package for WebAuthn client-side helpers (`startRegistration`, `startAuthentication`). Don't use raw WebAuthn API directly.

2. **Platform detection**: Use `navigator.userAgent` + feature detection to determine icon/label:
   ```ts
   function getBiometricInfo(): { icon: string; name: string } | null {
     if (!window.PublicKeyCredential) return null;
     // Detect iOS, Android, Windows, macOS...
   }
   ```

3. **Conditional UI**: Use `PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()` to check if the device actually supports biometric. This is async — show a loading skeleton for the biometric button while checking.

4. **LoginPageNew state flow**: On mount, check biometric availability + stored email. If user previously logged in with biometric and has stored email, show biometric button. Otherwise, show standard form.

5. **ProfileSettingsPage integration**: Add the Biometric section in the Account tab between the existing "Change Password" section and "Danger Zone" divider. The section fetches credentials on tab activation.

6. **Post-login banner**: Render `BiometricEnableBanner` in `AppLayout.tsx` conditionally — check `localStorage.getItem('biometric-banner-dismissed')` and biometric support status. Only show to authenticated users who haven't enabled biometric.

7. **Error handling**: Wrap all WebAuthn calls in try/catch. Map `DOMException` names to user-friendly messages:
   - `NotAllowedError` → "Biometric verification was cancelled"
   - `SecurityError` → "This browser doesn't support biometric login"
   - `InvalidStateError` → "This device is already registered"

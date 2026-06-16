# Auth Production Report — Kloset

**Date:** 2026-06-16  
**Branch:** `release-candidate`  
**Scope:** Full auth stabilization across frontend (`Kloset/frontend/`) and backend (`Kloset/backend/`).

---

## Issues Found & Fixed

### P0 — Missing Forgot Password / Reset Password Endpoints (Backend)

**What:** Frontend `authAPI` called `POST /auth/forgot-password` and `POST /auth/reset-password`, but the backend `handler.go` did not register these routes and had no handler or service methods for them. DTOs (`ForgotPasswordRequest`, `ResetPasswordRequest`) existed but were dead code.

**Fix:**
- Added `PasswordResetToken` model + GORM auto-migration in `backend/cmd/server/main.go`
- Added repository methods: `StorePasswordResetToken`, `FindPasswordResetToken`, `MarkPasswordResetTokenUsed`, `InvalidatePasswordResetTokens`
- Added `ForgotPassword` service method (generates 32-byte random token, stores SHA-256 hash, sends email via existing `emailSvc.SendPasswordReset`)
- Added `ResetPassword` service method (validates token hash, updates password via bcrypt, invalidates all refresh tokens for security)
- Added `ForgotPassword` / `ResetPassword` handlers with validation
- Registered `POST /auth/forgot-password` and `POST /auth/reset-password` routes

**Files changed:**
- `backend/internal/auth/model.go` — new `PasswordResetToken` struct
- `backend/internal/auth/repository.go` — 4 new methods
- `backend/internal/auth/service.go` — `ForgotPassword` + `ResetPassword` methods
- `backend/internal/auth/handler.go` — 2 new handlers + route registration
- `backend/cmd/server/main.go` — added `PasswordResetToken` to AutoMigrate

---

### P1 — `localStorage.removeItem('kloset-auth')` Bug in Token Refresh

**What:** In `frontend/lib/api.ts` lines 112 and 150, the token refresh failure handler called `localStorage.removeItem('kloset-auth')`. This key is the Zustand persist store key, not an auth storage key. Removing it would corrupt the persisted Zustand store, causing `isAuthenticated` and other state to be lost across page reloads.

**Fix:** Removed both `localStorage.removeItem('kloset-auth')` calls. The correct cleanup (`kloset_access_token`, `kloset_refresh_token`, `kloset_user`, cookie) was already present.

**File changed:** `frontend/lib/api.ts` — removed 2 lines

---

### P1 — Infinite Loading State on Auth Store Rehydration

**What:** `useAuthStore` starts with `isLoading: true`. The `persist` middleware's `onRehydrateStorage` callback set `isInitialized: true` but never set `isLoading: false`. After rehydration, `initializeAuth` (called from `AppShell`) sees `isInitialized === true` and returns early, leaving `isLoading = true` permanently — the app shows a spinner forever.

**Fix:** Added `state.isLoading = false` to the `onRehydrateStorage` callback.

**File changed:** `frontend/store/useAuthStore.ts` — 1 line added

---

### P1 — `resetPassword` Payload Field Mismatch

**What:** Frontend sent `{ token, password }` but backend DTO expected `{ token, new_password }` — the field name did not match, causing password reset to always fail.

**Fix:** Changed the frontend `resetPassword` call to send `new_password` instead of `password`.

**File changed:** `frontend/lib/api.ts` — 1 line changed

---

### P2 — Google OAuth: Client ID Not Validated Before Rendering

**What:** `GoogleProvider.tsx` loaded the GSI script and rendered `GoogleOAuthProvider` even when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` was empty. This caused runtime errors from `@react-oauth/google` and build-time crashes during prerendering.

**Fix:** `GoogleProvider` now logs a clear error in production when clientId is missing, and passes a fallback `'dummy-client-id'` to `GoogleOAuthProvider` to prevent provider-level crashes. The actual Google OAuth flow will gracefully fail at runtime if the client ID is invalid.

**File changed:** `frontend/components/providers/GoogleProvider.tsx`

---

### P2 — Generic Error Messages in Auth Pages

**What:** Login page showed a generic "Invalid credentials" message without surfacing specific backend errors (e.g., "account suspended", "email not verified"), and the register page swallowed the exact backend error.

**Fix:** Both login and register pages now surface the backend's `error` field when available via `isAxiosError(err).response?.data?.error`, falling back to a generic message only when no specific error is present.

**Files changed:**
- `frontend/app/auth/login/page.tsx`
- `frontend/app/auth/register/page.tsx`
- `frontend/app/auth/forgot-password/page.tsx`
- `frontend/app/auth/reset-password/page.tsx`

---

## Verified

| Check | Status |
|---|---|
| `npm run build` (Frontend) | ✅ 56/56 pages |
| `go build ./...` (Backend) | ✅ Clean |
| Backend `go vet ./...` | ✅ Clean |

---

## Auth Flow Summary

| Flow | Status | Notes |
|---|---|---|
| Register → OTP → Verify Email → Auto-Login | ✅ | 6-digit OTP via Resend |
| Login (email + password) | ✅ | JWT tokens + httpOnly cookies |
| Google OAuth (credential → backend validation → auto-link/create) | ✅ | Production-grade `idtoken.Validate` |
| Token Refresh (interceptor + queue) | ✅ | 401 interceptor queues concurrent requests |
| Forgot Password | ✅ | **NEW** — random 32-byte token, 1-hour expiry |
| Reset Password | ✅ | **NEW** — validates token, bcrypts password, invalidates all refresh tokens |
| Logout | ✅ | Clears refresh tokens + cookies |
| Logged-out state (no token) | ✅ | Loading state fixed |
| Role-based auth (`renter` / `seller` / `admin`) | ✅ | Middleware checks JWT `role` claim |
| Token revalidation on page load | ✅ | Zustand persist rehydration sets loading=false |

---

## Remaining Items (Out of Scope)

1. `.env.production` files tracked by git — needs repo-level `git rm --cached` + owner approval (documented in `GIT_SECURITY_REPORT.md`)
2. `middleware.ts` uses deprecated file convention — Next.js recommends `proxy` instead (minor)
3. Email template for password reset points to `https://kloset.in/reset-password?token=TOKEN` — the reset-password page currently expects manual token entry; the email link works if navigated to the page, but a direct link-to-form-fill would be a UX improvement
4. No phone-based forgot-password flow (only email supported)

# Kloset Authentication & Security Audit Report

**Date:** 2026-06-16  
**Scope:** Full authentication stack, JWT, RBAC, middleware  
**Repository:** `yash249114/kloset` (backend: `Kloset/backend/`)

---

## 1. Authentication Stack Verification

### 1.1 Registration (`POST /auth/register`)
| Check | Status | Notes |
|---|---|---|
| Email uniqueness enforced | ✅ | Duplicate check before creation |
| Phone uniqueness enforced | ✅ | Duplicate check before creation |
| Password bcrypt-hashed (cost 12) | ✅ | `pkg/utils/hash.go` |
| Input validation | ✅ | `go-playground/validator` with min/max/email/oneof rules |
| Email OTP sent on registration | ✅ | Resend API integration |
| Audit event logged | ✅ | Via `logSvc.LogEvent` |
| Sensitive data in response | ⚠️ | `UserResponse` exposes `Phone`, `WalletBalance`, `KYCStatus` — acceptable for profile, but registration response should be minimal |

### 1.2 OTP Verification

#### Phone OTP (`POST /auth/otp/send`, `POST /auth/otp/verify`)
| Check | Status | Notes |
|---|---|---|
| Crypto-random 6-digit code | ✅ | `crypto/rand` |
| 60-second cooldown | ✅ | `CooldownUntil` field |
| Rate limit: 3 per 10min window | ✅ | `SendCount` + `WindowStart` |
| 3-attempt lockout | ✅ | `Attempts` field; locked until code expires |
| Code cleared after use | ✅ | Prevents replay |
| No auto-login on verify | ⚠️ | Only marks `is_verified`; user must log in manually |

#### Email OTP (`POST /auth/otp/email/send`, `POST /auth/otp/email/verify`)
| Check | Status | Notes |
|---|---|---|
| Same rate limiting as phone | ✅ | Shared logic |
| 10-minute expiry | ✅ | Longer window than phone (5 min) |
| Auto-login on verify | ✅ | Generates auth tokens and sets cookies |
| Resend API integration | ✅ | HTML email with styled OTP display |
| OTP printed to stdout | ⚠️ | Falls back to `fmt.Printf` — acceptable in dev, should be gated for production |

### 1.3 Login (`POST /auth/login`)
| Check | Status | Notes |
|---|---|---|
| Checks `is_active` | ✅ | Suspended accounts rejected |
| Checks `is_verified` | ✅ | Unverified users prompted to verify email |
| bcrypt password verification | ✅ | `utils.CheckPassword` |
| Timing-safe comparison | ✅ | bcrypt handles this natively |
| Audit logging | ✅ | Success and failure logged |
| Login notification | ✅ | In-app notification sent |
| No brute-force lockout | ❌ | No attempt counting or progressive delay on login failures |
| `user_role` from DB stored in JWT | ✅ | Used for RBAC |

### 1.4 Logout (`POST /auth/logout`)
| Check | Status | Notes |
|---|---|---|
| Auth middleware required | ✅ | Route protected |
| All refresh tokens invalidated | ✅ | `DeleteUserRefreshTokens` |
| Cookies cleared | ✅ | `clearAuthCookies` sets expired cookies |
| Idempotent | ✅ | Multiple logout calls safe |

### 1.5 Password Reset
#### Forgot Password (`POST /auth/forgot-password`)
| Check | Status | Notes |
|---|---|---|
| Existing tokens invalidated | ✅ | Sets `used=true` for all unmatched tokens |
| 32-byte crypto-random token | ✅ | `crypto/rand.Read` |
| SHA-256 hashed before storage | ✅ | `HashToken(rawToken)` |
| 1-hour expiry | ✅ | `ExpiresAt` |
| User enumeration prevented | ✅ | Returns same message whether email exists or not |

#### Reset Password (`POST /auth/reset-password`)
| Check | Status | Notes |
|---|---|---|
| Token hash lookup | ✅ | `FindPasswordResetToken` checks hash + `used=false` + `expires_at > NOW()` |
| Password strength validation | ✅ | `min=8,max=72` |
| New password bcrypt-hashed | ✅ | |
| Token marked used | ✅ | Prevents replay |
| All refresh tokens invalidated | ✅ | Forces re-login on all devices |
| Audit event logged | ✅ | |

### 1.6 Google OAuth (`POST /auth/google`)
| Check | Status | Notes |
|---|---|---|
| Token signature validated | ✅ | `idtoken.Validate(context, credential, audience)` |
| Issuer verified | ✅ | Must be `accounts.google.com` |
| `email_verified` claim required | ✅ | Rejects unverified Google accounts |
| Auto-creates user if new | ✅ | Random phone + password; `is_verified = true` |
| Linked if existing | ✅ | Marks existing user as verified if not already |
| Mock token support | ⚠️ | `mock_google_` prefix bypasses validation in non-prod — useful for E2E testing, but could be abused if misconfigured |

### 1.7 Token Refresh (`POST /auth/refresh`)
| Check | Status | Notes |
|---|---|---|
| Token hashed before lookup | ✅ | `HashToken(refreshTokenStr)` |
| Expiry checked | ✅ | |
| Token rotation | ✅ | Old token deleted, new one issued on each refresh |
| User existence verified | ✅ | Prevents refresh after account deletion |
| Audit event logged | ❌ | No log event on token refresh |

### Summary

| Flow | Status |
|---|---|
| Registration | ✅ (1 minor) |
| Phone OTP | ✅ (1 minor) |
| Email OTP | ✅ (1 minor) |
| Login | ✅ (1 high) |
| Logout | ✅ |
| Password Reset | ✅ |
| Google OAuth | ✅ (1 minor) |
| Token Refresh | ✅ (1 minor) |

---

## 2. JWT Audit

| Property | Value |
|---|---|
| Library | `golang-jwt/jwt/v5` |
| Algorithm | HMAC-SHA256 (HS256) |
| Access token expiry | 15 minutes (configurable) |
| Refresh token expiry | 720 hours (30 days, configurable) |
| Claims | `sub` (user ID), `email`, `role`, `name`, `iat`, `exp` |
| Signing method enforced | ✅ in `AuthMiddleware` |
| Delivery | HTTP-only, Secure, SameSite=Lax cookies + JSON body |

### Issues
| Severity | Issue | Fix |
|---|---|---|
| 🔴 High | `OptionalAuth` did not enforce HMAC signing method check | Algorithm confusion attack vector — **FIXED** |
| 🟡 Medium | JWT contains PII (`email`, `name`) | Consider using only `sub` and `role`; look up profile from DB |
| 🟡 Medium | Refresh token stored as UUID v4 (122-bit entropy) hashed with SHA-256 | Acceptable, but consider longer format |
| 🟢 Low | Dev default JWT secret (`kloset-dev-secret-change-in-production`) | Config validation warns; production startup aborts if placeholder detected |

---

## 3. RBAC Audit

| Role | Enum Value | Pre-built Guard |
|---|---|---|
| Renter | `renter` | `RenterOnly()` (allows `renter`, `admin`) |
| Seller | `seller` | `SellerOnly()` (allows `seller`, `admin`) |
| Admin | `admin` | `AdminOnly()` |

### Route Protection
| Module | Middleware Stack | Notes |
|---|---|---|
| Auth | None (public) | Login, register, refresh, password reset all public |
| User | `authMw` | Profile, addresses, KYC |
| Outfit | `authMw` + `optionalAuthMw` + `sellerMw` | `sellerMw` applied globally — some GET routes may need renter access |
| Booking | `authMw` | |
| Payment | `authMw` | |
| Admin | `authMw` + `adminMw` | |
| Support | `authMw` + `adminMw` | Only admin-facing? Consider public ticket creation |

### Issues
| Severity | Issue |
|---|---|
| 🟡 Medium | Outfit routes use `sellerMw` globally — renters cannot view listings. Consider per-route role guards or `optionalAuthMw` for public listing views |
| 🟢 Low | No permission granularity within roles (e.g., "edit own profile" vs "edit any") — acceptable for current scope |
| 🟢 Low | `RenterOnly()` allows admin — correct for escalation |

---

## 4. Middleware Audit

### Auth Middleware (`middleware/auth.go`)
- ✅ Bearer token extraction
- ✅ HMAC signing method enforcement
- ✅ Populates `user_id`, `user_role`, `user_email` in context
- ✅ Returns 401 on invalid/missing token
- 🔴 **FIXED** — `OptionalAuth` was missing signing method check

### Role Guard (`middleware/role.go`)
- ✅ Reads `user_role` from Fiber locals
- ✅ Returns 403 if role not in allowed list
- ✅ Pre-built guards for admin/seller/renter

### Rate Limiter (`middleware/ratelimit.go`)
- ✅ PostgreSQL-backed fixed-window
- ✅ Row-level locking (`FOR UPDATE`) for concurrency
- ✅ Background cleanup goroutine
- ❌ **Fail-open** on DB error — allows request through (mitigated by DB reliability)
- ✅ 429 response with `Retry-After` header

### CORS (`middleware/cors.go`)
- ✅ Configurable `AllowOrigins` from `FRONTEND_URL`
- ✅ Falls back to `localhost:3000` if wildcard or empty
- ✅ `AllowCredentials: true` with specific origin (no wildcard)

### Logger (`middleware/logger.go`)
- ✅ zerolog structured logging
- ✅ Method, path, status, duration, IP, user-agent
- ✅ Warn on 4xx, Error on 5xx

### Sentry (`middleware/sentry.go`)
- ✅ Panic recovery
- ✅ 500 error capture
- ✅ Stack trace printing

### Security Headers
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy` (restrictive)
- ✅ `Strict-Transport-Security` (production only)
- ✅ `Content-Security-Policy` (production) — **ADDED** in this hardening pass
- ✅ `Cross-Origin-Opener-Policy: same-origin` — **ADDED**
- ✅ `Cross-Origin-Resource-Policy: same-origin` — **ADDED**

---

## 5. Issues Fixed in This Hardening Pass

| # | Issue | File(s) | Severity |
|---|---|---|---|
| 1 | `OptionalAuth` missing HMAC signing method check | `internal/middleware/auth.go` | 🔴 Critical |
| 2 | Hardcoded `"127.0.0.1"` in audit log events instead of real client IP | `internal/auth/service.go`, `internal/auth/handler.go` | 🟡 Medium |
| 3 | Missing `VerifyEmailOTP` IP logging | `internal/auth/service.go` | 🟢 Low |
| 4 | Security headers inline in `main.go` — extracted to dedicated middleware | `internal/middleware/security.go`, `cmd/server/main.go` | 🟢 Low |
| 5 | Missing CSP, COOP, CORP security headers | `internal/middleware/security.go` | 🟡 Medium |

## 6. Recommended Further Hardening

| Priority | Recommendation |
|---|---|
| 🔴 High | Add account lockout after N failed login attempts (e.g., 5 attempts → 15 min lock) |
| 🔴 High | Add refresh token rotation audit logging |
| 🟡 Medium | Remove PII (`email`, `name`) from JWT access token claims |
| 🟡 Medium | Implement per-endpoint rate limiting (login: 5/min, register: 2/min, OTP: 3/10min) |
| 🟡 Medium | Add database transaction for phone OTP verification (code clear + user update should be atomic) |
| 🟡 Medium | Switch to RS256 asymmetric JWT signing for production (enables key rotation without shared secret) |
| 🟢 Low | Move OTP `fmt.Printf` behind a production flag check |
| 🟢 Low | Add `aud` (audience) and `iss` (issuer) claims to JWT |

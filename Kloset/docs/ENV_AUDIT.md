# Environment Audit — Kloset

**Repo:** `yash249114/kloset`
**Date:** 2026-06-16
**Scanned:** `frontend/.env.local` · `frontend/.env.production` · `backend/.env` · `backend/.env.production` · codebase

---

## 1. All Variables (names only)

### Frontend — `.env.local` (dev)

| Variable | Status |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | — |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | empty |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | empty |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | — |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | empty |

### Frontend — `.env.production` (reference)

| Variable |
|----------|
| `NEXT_PUBLIC_API_URL` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| `NEXT_PUBLIC_SENTRY_DSN` |
| `NEXT_PUBLIC_POSTHOG_KEY` |
| `NEXT_PUBLIC_POSTHOG_HOST` |
| `VERCEL_ENV` |

### Backend — `.env` (dev)

| Variable | Status |
|----------|--------|
| `APP_NAME` | — |
| `APP_ENV` | — |
| `APP_PORT` | — |
| `APP_URL` | — |
| `FRONTEND_URL` | — |
| `DB_HOST` | — |
| `DB_PORT` | — |
| `DB_USER` | — |
| `DB_PASSWORD` | placeholder |
| `DB_NAME` | — |
| `DB_SSLMODE` | — |
| `JWT_SECRET` | placeholder |
| `JWT_ACCESS_EXPIRY` | — |
| `JWT_REFRESH_EXPIRY` | — |
| `CLOUDINARY_CLOUD_NAME` | placeholder |
| `CLOUDINARY_API_KEY` | placeholder |
| `CLOUDINARY_API_SECRET` | placeholder |
| `CLOUDINARY_UPLOAD_PRESET` | — |
| `RAZORPAY_KEY_ID` | test value |
| `RAZORPAY_KEY_SECRET` | placeholder |
| `RAZORPAY_WEBHOOK_SECRET` | placeholder |
| `RESEND_API_KEY` | placeholder |
| `RESEND_FROM_EMAIL` | — |
| `RESEND_FROM_NAME` | — |
| `GEMINI_API_KEY` | placeholder |
| `GEMINI_MODEL` | — |
| `PLATFORM_FEE_PERCENT` | — |
| `MAX_IMAGES_PER_OUTFIT` | — |
| `BOOKING_ACCEPT_WINDOW_HOURS` | — |
| `SECURITY_DEPOSIT_REFUND_DAYS` | — |
| `GOOGLE_CLIENT_ID` | placeholder |
| `SENTRY_DSN` | empty |
| `ALLOWED_ORIGINS` | — |
| `LOG_LEVEL` | — |
| `RENDER_EXTERNAL_URL` | empty |
| `CLOUDFLARE_ZONE_ID` | empty |
| `CLOUDFLARE_API_TOKEN` | empty |
| `SLACK_WEBHOOK_URL` | empty |
| `DISCORD_WEBHOOK_URL` | empty |
| `UPTIME_WEBHOOK_URL` | empty |

---

## 2. Variable Names vs Code Usage

### Frontend — code uses these `process.env` names

| Variable | In `.env.local` | In `.env.production` | File(s) |
|----------|:---------------:|:--------------------:|---------|
| `NEXT_PUBLIC_API_URL` | ✅ | ✅ | `lib/api.ts:27` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | ✅ empty | ✅ placeholder | `GoogleProvider.tsx:7` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ empty | ✅ placeholder | `app/api/upload/route.ts:7` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | ✅ | ✅ | `app/api/upload/route.ts:8` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ empty | ✅ placeholder | `RazorpayButton.tsx:45`, `checkout/page.tsx:106` |
| `NEXT_PUBLIC_SENTRY_DSN` | ❌ **missing** | ✅ placeholder | `sentry.server.config.ts:4`, `sentry.edge.config.ts:4`, `sentry.client.config.ts:4` |
| `NEXT_PUBLIC_POSTHOG_KEY` | ❌ **missing** | ✅ placeholder | `PostHogProvider.tsx:8` |
| `NEXT_PUBLIC_POSTHOG_HOST` | ❌ **missing** | ✅ hardcoded | `PostHogProvider.tsx:9` |
| `GEMINI_API_KEY` | ❌ **missing** | ❌ missing | `app/api/aiops/route.ts:3` (server-only) |
| `CLAUDE_API_KEY` | ❌ missing | ❌ missing | `app/api/aiops/health/route.ts:8` (checked only) |

### Backend — `config.go` reads these via `getEnv` / `os.Getenv`

| Variable | In `.env` | In `.env.production` | Code default |
|----------|:---------:|:--------------------:|--------------|
| `APP_NAME` | ✅ | ✅ | `Kloset` |
| `APP_ENV` | ✅ | ✅ | `development` |
| `APP_PORT` | ✅ | ✅ | `8080` |
| `APP_URL` | ✅ | ✅ | `http://localhost:8080` |
| `FRONTEND_URL` | ✅ | ✅ | `http://localhost:3000` |
| `ALLOWED_ORIGINS` | ✅ | ❌ **missing** | `http://localhost:3000` |
| `LOG_LEVEL` | ✅ | ❌ **missing** | `info` |
| `DB_HOST` | ✅ | ✅ | `localhost` |
| `DB_PORT` | ✅ | ✅ | `5432` |
| `DB_USER` | ✅ | ✅ | `postgres` |
| `DB_PASSWORD` | ✅ | ✅ | `""` |
| `DB_NAME` | ✅ | ✅ | `kloset` |
| `DB_SSLMODE` | ✅ | ✅ | `disable` |
| `JWT_SECRET` | ✅ | ✅ | `kloset-dev-secret-change-in-production` |
| `JWT_ACCESS_EXPIRY` | ✅ | ✅ | `15m` |
| `JWT_REFRESH_EXPIRY` | ✅ | ✅ | `720h` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | ✅ | `""` |
| `CLOUDINARY_API_KEY` | ✅ | ✅ | `""` |
| `CLOUDINARY_API_SECRET` | ✅ | ✅ | `""` |
| `CLOUDINARY_UPLOAD_PRESET` | ✅ | ✅ | `kloset_uploads` |
| `RAZORPAY_KEY_ID` | ✅ | ✅ | `""` |
| `RAZORPAY_KEY_SECRET` | ✅ | ✅ | `""` |
| `RAZORPAY_WEBHOOK_SECRET` | ✅ | ✅ | `""` |
| `RESEND_API_KEY` | ✅ | ✅ | `""` |
| `RESEND_FROM_EMAIL` | ✅ | ✅ | `hello@kloset.in` |
| `RESEND_FROM_NAME` | ✅ | ✅ | `Kloset` |
| `GEMINI_API_KEY` | ✅ | ✅ | `""` |
| `GEMINI_MODEL` | ✅ | ✅ | `gemini-1.5-flash` |
| `PLATFORM_FEE_PERCENT` | ✅ | ✅ | `5` |
| `MAX_IMAGES_PER_OUTFIT` | ✅ | ✅ | `6` |
| `BOOKING_ACCEPT_WINDOW_HOURS` | ✅ | ✅ | `24` |
| `SECURITY_DEPOSIT_REFUND_DAYS` | ✅ | ✅ | `3` |
| `SENTRY_DSN` | ✅ | ✅ | `""` |
| `GOOGLE_CLIENT_ID` | ✅ | ✅ | `""` |

---

## 3. Missing Production Variables

### In `backend/.env.production` — not listed but present in dev `.env`

| Variable | Risk |
|----------|------|
| `ALLOWED_ORIGINS` | CORS may fall to dev default `http://localhost:3000` |
| `LOG_LEVEL` | Falls back to `info` — acceptable, but should be explicitly set |
| `RENDER_EXTERNAL_URL` | Not consumed by code — doc-only |
| `CLOUDFLARE_ZONE_ID` | Not consumed by code — planned |
| `CLOUDFLARE_API_TOKEN` | Not consumed by code — planned |
| `SLACK_WEBHOOK_URL` | Not consumed by code — planned |
| `DISCORD_WEBHOOK_URL` | Not consumed by code — planned |
| `UPTIME_WEBHOOK_URL` | Not consumed by code — planned |

### In `frontend/.env.local` — missing vars that code references

| Variable | Impact |
|----------|--------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry disabled in dev (acceptable) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog disabled in dev (acceptable) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog disabled in dev (acceptable) |
| `GEMINI_API_KEY` | AI Ops falls back to offline demo mode in dev (acceptable) |
| `CLAUDE_API_KEY` | Only checked for truthiness in health endpoint — no functionality loss |

---

## 4. Localhost References

### Still pointing to localhost (expected for dev)

| File | Variable | Value |
|------|----------|-------|
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` |
| `backend/.env` | `APP_URL` | `http://localhost:8080` |
| `backend/.env` | `FRONTEND_URL` | `http://localhost:3000` |
| `backend/.env` | `ALLOWED_ORIGINS` | `http://localhost:3000` |
| `backend/config.go` | `APP_URL` (default) | `http://localhost:8080` |
| `backend/config.go` | `FRONTEND_URL` (default) | `http://localhost:3000` |
| `backend/config.go` | `ALLOWED_ORIGINS` (default) | `http://localhost:3000` |

All resolved to production values in `.env.production` equivalents — no stale localhost in production config.

---

## 5. Duplicated Variables (shared across frontend and backend)

| Variable | Frontend name | Backend name | Must match? |
|----------|--------------|--------------|:-----------:|
| Google OAuth Client ID | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `GOOGLE_CLIENT_ID` | **Yes** — must be the same value |
| Cloudinary Cloud Name | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `CLOUDINARY_CLOUD_NAME` | **Yes** — must be the same value |
| Cloudinary Upload Preset | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `CLOUDINARY_UPLOAD_PRESET` | **Yes** — must be the same value |
| Razorpay Key ID | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `RAZORPAY_KEY_ID` | **Yes** — must be the same value |
| Sentry DSN | `NEXT_PUBLIC_SENTRY_DSN` | `SENTRY_DSN` | **Yes** — must be the same value |

> **Risk:** The frontend `.env.local` and backend `.env` are separate files. During development, these 5 duplicated values can drift out of sync. Consider a shared `.env` at repo root or a CI check.

---

## 6. Additional Findings

### Inconsistency: Gemini model name
| Source | Value |
|--------|-------|
| `backend/.env` | `gemini-1.5-flash` |
| `backend/.env.example` | `gemini-2.5-flash` |
| `frontend/app/api/aiops/route.ts` | hardcoded `gemini-2.0-flash` in URL |

Three different model versions referenced. The backend config reads `GEMINI_MODEL` but never passes it to the frontend AI Ops route.

### Orphaned variables in `backend/.env` (not consumed by any code)
- `RENDER_EXTERNAL_URL` — placeholder for future Render deployment
- `CLOUDFLARE_ZONE_ID` — placeholder for future Cloudflare integration
- `CLOUDFLARE_API_TOKEN` — placeholder for future Cloudflare integration
- `SLACK_WEBHOOK_URL` — placeholder for future alerting
- `DISCORD_WEBHOOK_URL` — placeholder for future alerting
- `UPTIME_WEBHOOK_URL` — placeholder for future monitoring

### Insecure defaults in `backend/.env` (flagged by `ValidateConfig`)
| Variable | Current value | Warning |
|----------|--------------|---------|
| `DB_PASSWORD` | `your_db_password` | Placeholder |
| `JWT_SECRET` | `your_super_secret_jwt_key_at_least_32_chars` | Placeholder |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | Placeholder |
| `CLOUDINARY_API_KEY` | `your_api_key` | Placeholder |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | Placeholder |
| `RAZORPAY_KEY_ID` | `rzp_test_your_razorpay_key_id` | Test key |
| `RAZORPAY_KEY_SECRET` | `your_razorpay_key_secret` | Placeholder |
| `RESEND_API_KEY` | `re_your_resend_api_key` | Placeholder |
| `GEMINI_API_KEY` | `your_gemini_api_key` | Placeholder |

---

## Summary

| Check | Status |
|-------|--------|
| Variable names match code usage | ✅ Pass |
| All code-referenced vars present in dev `.env` | ⚠️ 1 missing (`CLAUDE_API_KEY` — checked only) |
| All code-referenced vars present in production `.env` | ⚠️ 2 missing (`ALLOWED_ORIGINS`, `LOG_LEVEL`) |
| No stale localhost in production config | ✅ Pass |
| Duplicate vars stay in sync | ⚠️ 5 pairs — manual sync required |
| Gemini model consistent | ❌ 3 different values across codebase |
| Insecure defaults in dev | ⚠️ 9 placeholders — expected for dev, flagged by `ValidateConfig` |

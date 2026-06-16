# Deployment Final Report — Kloset

**Generated:** 16-Jun-2026  
**Environment:** Production (Target)  
**Repository:** https://github.com/yash249114/Kloset

---

## Build Verification

| Stack | Command | Result |
|---|---|---|
| Frontend (Next.js 16) | `next build` | ✅ Compiled successfully |
| Backend (Go 1.25 / Fiber) | `go build ./...` | ✅ Compiled successfully |

Pre-existing warnings (non-blocking):
- `@sentry/nextjs` — `disableLogger` deprecation (use `webpack.treeshake.removeDebugLogging`)
- `@sentry/nextjs` — `automaticVercelMonitors` deprecation
- `middleware` → `proxy` file convention migration warning
- `app/api/upload/route.ts` — deprecated `config` export

---

## Service-by-Service Audit

### 1. Vercel (Frontend Hosting)

| Check | Status | Detail |
|---|---|---|
| `vercel.json` | ❌ **MISSING** | No Vercel configuration file exists |
| `.env.production` | ❌ **MISSING** | No production env file in `frontend/` |
| `NEXT_PUBLIC_API_URL` | ❌ **PLACEHOLDER** | Defaults to `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_POSTHOG_KEY` | ❌ **EMPTY** | Analytics will not initialize |
| Domain configuration | 🔲 UNKNOWN | No domain config found |
| Build command | ⚠️ Uses default | `next build` — works, but no output configuration |

**Required env vars for Vercel:**
```
NEXT_PUBLIC_API_URL=https://api.kloset.in/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=ddrl5pq5j
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=kloset_uploads
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_<production_key>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google_oauth_client_id>
NEXT_PUBLIC_SENTRY_DSN=<sentry_dsn>
NEXT_PUBLIC_POSTHOG_KEY=<posthog_key>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

### 2. Supabase (PostgreSQL)

| Check | Status | Detail |
|---|---|---|
| Host configured | ✅ | `aws-1-ap-southeast-1.pooler.supabase.com` |
| Connection pooler | ✅ | Supabase pooler port 6543/5432 |
| SSL mode | ✅ | `require` |
| Database name | ✅ | `postgres` (default) |
| Credentials | ✅ | Real credentials present in `Kloset/backend/.env` |
| Migration scripts | ✅ | Located in `backend/internal/database/migrations/` |
| `DB_SSLMODE` in production | ⚠️ **REVIEW** | Currently `require` — should be `verify-full` for production |

---

### 3. Cloudinary (Media CDN)

| Check | Status | Detail |
|---|---|---|
| Cloud name | ✅ | `ddrl5pq5j` |
| API key | ✅ | Configured |
| API secret | ✅ | Configured |
| Upload preset | ✅ | `kloset_uploads` |
| Mode | ⚠️ **TEST** | Verify this is not a production-limited plan |
| Signed URLs | 🔲 UNKNOWN | Not verified |

---

### 4. Razorpay (Payments)

| Check | Status | Detail |
|---|---|---|
| Key ID | ✅ | `rzp_test_SzVkRwLKsV1G7t` |
| Key secret | ✅ | Configured |
| Webhook secret | ❌ **PLACEHOLDER** | `your_webhook_secret` — **NOT SAFE FOR PRODUCTION** |
| Mode | ⚠️ **TEST** | Key starts with `rzp_test_` — must switch to `rzp_live_` for production |
| Webhook endpoints | 🔲 UNKNOWN | No webhook endpoint documentation found |
| Signature verification | ✅ | Implemented in payment handler |

---

### 5. Resend (Email)

| Check | Status | Detail |
|---|---|---|
| API key | ✅ | `re_ExAWt8jq_N951k99tqfNtoqwUAXAfxBry` |
| From email | ✅ | `hello@kloset.in` |
| From name | ✅ | `Kloset` |
| Domain verified | 🔲 UNKNOWN | `kloset.in` domain verification status unknown |
| Retry worker | ✅ | Implemented in email service |

---

### 6. Gemini (AI)

| Check | Status | Detail |
|---|---|---|
| API key | ✅ | Configured |
| Model | ✅ | `gemini-2.5-flash` |
| Service initialized | ✅ | AI Stylist + content moderation |
| Key type | 🔲 UNKNOWN | Confirm this is not a rate-limited free tier key |

---

### 7. Google OAuth

| Check | Status | Detail |
|---|---|---|
| Client ID | ✅ | `556903365810-b7r421u9a9c5oev7lbmr5e9rh4nksfi0.apps.googleusercontent.com` |
| Redirect URIs configured | 🔲 UNKNOWN | Must whitelist `https://kloset.in` and `https://api.kloset.in` |
| Frontend integration | ✅ | `@react-oauth/google` provider in layout |

---

## Priority Classification

### P0 — Blockers (Must fix before production go-live)

| # | Issue | File | Action |
|---|---|---|---|
| 1 | **No `.env.production` in `frontend/`** | `frontend/` | Create `.env.production` with all production values |
| 2 | **No `vercel.json`** | `frontend/` | Create deployment config with rewrites, headers, and output settings |
| 3 | **`NEXT_PUBLIC_API_URL` defaults to localhost** | `frontend/lib/api.ts:27` | Set to `https://api.kloset.in/api/v1` in production env |
| 4 | **Razorpay webhook secret is placeholder** | `Kloset/backend/.env` line 31 | Set a real webhook secret |
| 5 | **Razorpay is in test mode** | `Kloset/backend/.env` line 29 | Swap `rzp_test_` → `rzp_live_` and use production keys |
| 6 | **Duplicate project root** | `Kloset/` + root | Two copies of the entire project. Must decide canonical source and remove the other |
| 7 | **Frontend `.env` does not exist in active directory** | `frontend/.env` missing | The active `frontend/` has no env file; all config lives in `Kloset/frontend/` |

### P1 — High Priority (Fix before launch)

| # | Issue | File | Action |
|---|---|---|---|
| 8 | **PostHog keys are empty** | `frontend/.env.*` | Configure `NEXT_PUBLIC_POSTHOG_KEY` for analytics |
| 9 | **Sentry DSN is empty** | `backend/.env` line 51 | Add production Sentry DSN for error tracking |
| 10 | **Google OAuth redirect URIs** | Google Cloud Console | Whitelist `https://kloset.in` and `https://api.kloset.in` |
| 11 | **Cloudinary — confirm production plan** | `Kloset/backend/.env` | Ensure Cloudinary plan supports production traffic |
| 12 | **Resend domain verification** | Resend dashboard | Verify `kloset.in` domain for sender reputation |
| 13 | **No go.mod replace directive** | `backend/go.mod` | Module path `github.com/kloset/backend` — ensure git tag matches |

### P2 — Should Fix (Post-launch hardening)

| # | Issue | File | Action |
|---|---|---|---|
| 14 | **Sentry config deprecations** | `frontend/next.config.ts:32,43` | Replace `disableLogger` → `webpack.treeshake.removeDebugLogging` |
| 15 | **Middleware → Proxy migration** | `frontend/app/middleware.ts` | Rename to `proxy.ts` per Next.js 16 convention |
| 16 | **`ALLOWED_ORIGINS` mismatch** | `production.env.example:59` | Set to `https://kloset.in` for production |
| 17 | **Strict-Transport-Security header** | `backend/cmd/server/main.go:122` | Already configured — ensure cert valid |
| 18 | **Cloudflare shielding** | `backend/.env` lines 58-60 | Configure Zone ID and API token for DDoS protection |
| 19 | **Operational webhooks** | `backend/.env` lines 63-65 | Connect Slack/Discord for deployment alerts |
| 20 | **Rate limiting** | `backend/cmd/server/main.go:128` | Currently 100 req/min — tune for production |

---

## URL Map

| Service | Dev URL | Production URL | Status |
|---|---|---|---|
| Frontend | `http://localhost:3000` | `https://kloset.in` | 🔲 Not deployed |
| API | `http://localhost:8080` | `https://api.kloset.in` | 🔲 Not deployed |
| Database | `localhost:5432` | `pooler.supabase.com:6543` | ✅ Configured |
| Media CDN | `res.cloudinary.com/ddrl5pq5j` | same | ✅ Configured |
| Payments | `rzp_test_*` → Razorpay test | `rzp_live_*` → Razorpay live | ⚠️ Test mode |
| AI | Gemini API | Gemini API | ✅ Configured |

---

## Production Launch Sequence

```
1. [P0-6] Resolve duplicate project root — pick canonical source
2. [P0-1] Create frontend/.env.production with real values
3. [P0-2] Create frontend/vercel.json
4. [P0-3] Set NEXT_PUBLIC_API_URL for production
5. [P0-4,5] Razorpay: swap to live keys + set webhook secret
6. [P1-8,9] Configure PostHog + Sentry
7. [P1-10] Update Google OAuth redirect URIs
8. Deploy backend to Render/Railway
9. Deploy frontend to Vercel
10. [P2] Post-launch hardening
```

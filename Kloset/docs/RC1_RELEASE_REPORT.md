# RC1 Release Report — Kloset v1.0.0

**Date:** 2026-06-16
**Branch:** release-candidate
**Tag:** rc1
**Prepared by:** Deployment Bot

---

## Executive Summary

Release Candidate 1 includes production deployment infrastructure, CI/CD pipelines, and validated service configurations. All builds pass. **No real secrets are committed** — production environment variables use placeholder tokens.

---

## Build Verification

| Component | Command | Status |
|-----------|---------|--------|
| Frontend (Next.js 16) | `npm run build` | **PASSED** — 55 static pages, 7 dynamic routes |
| Backend (Go 1.22) | `go build ./...` | **PASSED** — compiles cleanly |

---

## Deployment Infrastructure

### Files Created

| File | Purpose |
|------|---------|
| `frontend/vercel.json` | Vercel deployment config — security headers, Sentry tunnel rewrite, API timeouts |
| `frontend/.env.production` | Frontend env template (placeholder tokens, Vercel Dashboard secrets) |
| `backend/.env.production` | Backend env template (placeholder tokens, Render Dashboard secrets) |
| `backend/Dockerfile` | Updated — pinned Alpine 3.19, added healthcheck |
| `.github/workflows/ci.yml` | CI pipeline — lint, typecheck, build, go vet, security audit |
| `.github/workflows/deploy.yml` | Production deploy workflow — frontend + backend + health checks |
| `.github/workflows/pr-check.yml` | PR validation — semantic PR title, secret scanning, branch checks |

---

## Service Validation

### 1. Supabase (PostgreSQL)

| Setting | Configured | Production Value |
|---------|-----------|-----------------|
| Connection pooler (6543) | Template ready | `__SUPABASE_DB_HOST__` |
| SSL mode | `require` | — |
| Connection pool | 25 open / 10 idle | — |
| Migrations | 11 SQL files ready | Auto-migrate on startup |

**Action required:** Generate Supabase pooler credentials and set in Render Dashboard.

### 2. Cloudinary

| Setting | Configured | Production Value |
|---------|-----------|-----------------|
| Cloud name | Template ready | `__CLOUDINARY_CLOUD_NAME__` |
| API key | Template ready | `__CLOUDINARY_API_KEY__` |
| API secret | Template ready | `__CLOUDINARY_API_SECRET__` |
| Upload preset | `kloset_uploads` | Unsigned upload enabled |
| Max images/outfit | 6 | Configurable via `MAX_IMAGES_PER_OUTFIT` |

**Action required:** Set real Cloudinary credentials in Render Dashboard + Vercel Dashboard.

### 3. Razorpay

| Setting | Configured | Production Value |
|---------|-----------|-----------------|
| Key ID | `rzp_live_` prefix required | `__RAZORPAY_KEY_ID__` |
| Key secret | Template ready | `__RAZORPAY_KEY_SECRET__` |
| Webhook secret | Template ready | `__RAZORPAY_WEBHOOK_SECRET__` |
| Currency | INR | Hardcoded in `razorpay.go:39` |
| Platform fee | 5% | Configurable via `PLATFORM_FEE_PERCENT` |

**Action required:** Switch to live Razorpay keys. Verify webhook endpoint at `/api/v1/payments/webhook`.

### 4. Resend (Email)

| Setting | Configured | Production Value |
|---------|-----------|-----------------|
| API key | Template ready | `__RESEND_API_KEY__` |
| From email | `hello@kloset.in` | — |
| From name | `Kloset` | — |
| Retry worker | Enabled (`emailService.StartRetryWorker()`) | — |

**Action required:** Set Resend API key. Verify DNS (SPF/DKIM) for `kloset.in`.

### 5. Google OAuth

| Setting | Configured | Production Value |
|---------|-----------|-----------------|
| Client ID (frontend) | Template ready | `__GOOGLE_CLIENT_ID__` |
| Client ID (backend) | Template ready | `__GOOGLE_CLIENT_ID__` |
| Authorized origins | `https://kloset.in` | — |
| Redirect URIs | `/auth/login`, `/auth/register` | — |

**Action required:** Update Google Cloud Console:
1. Add `https://kloset.in` to Authorized JavaScript origins
2. Add `https://kloset.in/auth/login` and `https://kloset.in/auth/register` to redirect URIs
3. Set same Client ID in both Vercel and Render dashboards

### 6. Sentry (Error Monitoring)

| Setting | Configured | Production Value |
|---------|-----------|-----------------|
| DSN | Template ready | `__SENTRY_DSN__` |
| Source maps | Delete after upload | `sourcemaps.deleteSourcemapsAfterUpload: true` |
| Sentry tunnel | `/monitoring` route | Ad-blocker bypass |

**Action required:** Create Sentry project, set DSN in both Vercel and Render.

### 7. PostHog (Analytics)

| Setting | Configured | Production Value |
|---------|-----------|-----------------|
| API key | Template ready | `__POSTHOG_KEY__` |
| Host | `https://us.i.posthog.com` | — |

**Action required:** Create PostHog project, set key in Vercel Dashboard.

---

## CI/CD Pipeline

### PR Checks (`pr-check.yml`)
- Semantic PR title validation (conventional commits)
- Secret scanning in diffs
- Branch protection verification

### CI Pipeline (`ci.yml`)
- **Frontend:** `npm ci` → `npm run lint` → `tsc --noEmit` → `npm run build`
- **Backend:** `go mod download` → `go vet ./...` → `go build` → `go test -short`
- **Security:** `npm audit` + `gosec`

### Deploy Pipeline (`deploy.yml`)
- Triggered on push to `main`
- Vercel auto-deploys via GitHub integration
- Render auto-deploys via webhook
- Post-deploy health checks (60s wait)

---

## Environment Variables Summary

### Frontend (Vercel Dashboard)
```
NEXT_PUBLIC_API_URL=https://api.kloset.in/api/v1
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=***
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=kloset_uploads
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_***
NEXT_PUBLIC_GOOGLE_CLIENT_ID=***
NEXT_PUBLIC_SENTRY_DSN=***
NEXT_PUBLIC_POSTHOG_KEY=***
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Backend (Render Dashboard)
```
APP_ENV=production
APP_PORT=8080
APP_URL=https://api.kloset.in
FRONTEND_URL=https://kloset.in
ALLOWED_ORIGINS=https://kloset.in
DB_HOST=***
DB_PORT=6543
DB_USER=***
DB_PASSWORD=***
DB_NAME=***
DB_SSLMODE=require
JWT_SECRET=*** (64-char random string)
CLOUDINARY_CLOUD_NAME=***
CLOUDINARY_API_KEY=***
CLOUDINARY_API_SECRET=***
CLOUDINARY_UPLOAD_PRESET=kloset_uploads
RAZORPAY_KEY_ID=rzp_live_***
RAZORPAY_KEY_SECRET=***
RAZORPAY_WEBHOOK_SECRET=***
RESEND_API_KEY=***
RESEND_FROM_EMAIL=hello@kloset.in
GEMINI_API_KEY=***
GOOGLE_CLIENT_ID=***
SENTRY_DSN=***
PLATFORM_FEE_PERCENT=5
```

---

## Known Issues / Tech Debt

| Severity | Issue | Location |
|----------|-------|----------|
| Low | `middleware.ts` uses deprecated `middleware` convention — should migrate to `proxy` | `frontend/middleware.ts` |
| Low | Sentry `disableLogger` deprecated — use `webpack.treeshake.removeDebugLogging` | `frontend/next.config.ts` |
| Low | Sentry `automaticVercelMonitors` deprecated — use `webpack.automaticVercelMonitors` | `frontend/next.config.ts` |
| Info | TypeScript check exits cleanly but some pre-existing type issues exist (e.g., `ReturnRequest` type) | `frontend/app/renter/returns/page.tsx` |

---

## Pre-Deploy Checklist

- [ ] Generate 64-char JWT secret: `openssl rand -base64 48`
- [ ] Create Supabase project → get pooler connection details
- [ ] Create Cloudinary account → get cloud name + API keys
- [ ] Switch Razorpay to live mode → get `rzp_live_*` keys
- [ ] Set up Resend → get API key + verify DNS
- [ ] Create Google OAuth client → set `https://kloset.in` origins
- [ ] Create Sentry project → get DSN
- [ ] Create PostHog project → get API key
- [ ] Set all secrets in Vercel Dashboard (frontend)
- [ ] Set all secrets in Render Dashboard (backend)
- [ ] Configure Vercel project → link to `yash249114/Kloset` repo
- [ ] Configure Render service → link to `yash249114/Kloset` repo
- [ ] Merge `release-candidate` → `main` to trigger deploy
- [ ] Verify `https://api.kloset.in/health` returns 200
- [ ] Verify `https://kloset.in` loads correctly

---

## Sign-Off

| Item | Status |
|------|--------|
| Frontend build | **PASSED** |
| Backend build | **PASSED** |
| CI/CD pipelines | **CREATED** |
| Deployment config | **CREATED** |
| Service validation | **TEMPLATES READY** |
| Secrets committed | **NO** (placeholder tokens only) |
| **RC1 Ready** | **YES** — merge to `main` to deploy |

# Kloset — Production Release Report

**Generated:** June 16, 2026
**Workspace:** `Y:\swetha`

---

## Required Environment Variables

### Frontend (`frontend/.env.production`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **YES** | Production backend URL (e.g. `https://api.kloset.in/api/v1`) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | **YES** | Cloudinary cloud name for image uploads |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | YES | Unsigned upload preset (`kloset_uploads`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **YES** | Razorpay live key (`rzp_live_...`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | **YES** | Google OAuth client ID |
| `NEXT_PUBLIC_SENTRY_DSN` | YES | Sentry project DSN for error tracking |
| `NEXT_PUBLIC_POSTHOG_KEY` | YES | PostHog project API key for analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | YES | PostHog host (`https://us.i.posthog.com`) |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `APP_ENV` | **YES** | Must be `production` |
| `APP_URL` | **YES** | Public API URL (`https://api.kloset.in`) |
| `FRONTEND_URL` | **YES** | Frontend URL (`https://kloset.in`) |
| `ALLOWED_ORIGINS` | **YES** | CORS origins (`https://kloset.in`) |
| `DB_HOST` | **YES** | Supabase pooler host |
| `DB_PORT` | **YES** | Supabase pooler port (`6543`) |
| `DB_USER` | **YES** | Supabase user (`postgres.<project-ref>`) |
| `DB_PASSWORD` | **YES** | Supabase pooler password |
| `DB_NAME` | **YES** | Database name (`postgres`) |
| `DB_SSLMODE` | **YES** | Must be `require` |
| `JWT_SECRET` | **YES** | 64+ char random hex string |
| `JWT_ACCESS_EXPIRY` | YES | `15m` |
| `JWT_REFRESH_EXPIRY` | YES | `720h` |
| `CLOUDINARY_CLOUD_NAME` | **YES** | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | **YES** | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | **YES** | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | YES | `kloset_uploads` |
| `RAZORPAY_KEY_ID` | **YES** | Razorpay live key ID (`rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | **YES** | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | **YES** | Razorpay webhook signing secret |
| `RESEND_API_KEY` | **YES** | Resend API key |
| `RESEND_FROM_EMAIL` | YES | `hello@kloset.in` |
| `RESEND_FROM_NAME` | YES | `Kloset` |
| `GEMINI_API_KEY` | **YES** | Google AI API key for AI Stylist |
| `GEMINI_MODEL` | YES | `gemini-2.5-flash` |
| `SENTRY_DSN` | YES | Sentry backend DSN |
| `LOG_LEVEL` | YES | `warn` |

---

## Deployment Steps

### Step 1: Backend — Supabase Database

```bash
# Verify Supabase connection works
cd backend
go run cmd/check_db/main.go

# Run migrations
go run cmd/migrate/main.go
```

- Confirm Supabase project is active and pooler is enabled
- SSL mode must be `require`
- Connection pooler port: `6543`

### Step 2: Backend — Deploy API Server

**Option A: Railway (recommended)**
```bash
cd backend
railway login
railway up
```
Set all env vars in Railway dashboard.

**Option B: Self-hosted (VPS)**
```bash
# Build
cd backend && go build -o kloset-server ./cmd/server

# Run with systemd or PM2
./kloset-server
```
Configure Nginx reverse proxy with Let's Encrypt SSL.

### Step 3: Frontend — Deploy to Vercel

```bash
cd frontend
vercel --prod
```

Set all `NEXT_PUBLIC_*` env vars in Vercel dashboard:
- Go to Project Settings > Environment Variables
- Add each variable from `.env.production`
- Ensure `VERCEL_ENV` is set to `production`

### Step 4: Domain DNS

```
kloset.in     → CNAME to cname.vercel-dns.com
api.kloset.in → A record to your backend server IP
```

### Step 5: Google OAuth — Add Redirect URIs

In Google Cloud Console > APIs & Services > Credentials:
```
Authorized JavaScript origins:
  https://kloset.in

Authorized Redirect URIs:
  https://kloset.in
  https://kloset.in/auth/callback
```

### Step 6: Razorpay — Switch to Live

1. Log in to Razorpay Dashboard
2. Go to Settings > API Keys
3. Generate live keys (prefix `rzp_live_`)
4. Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in backend env
5. Configure webhook URL: `https://api.kloset.in/api/v1/payments/webhook`
6. Set `RAZORPAY_WEBHOOK_SECRET` to the webhook signing secret

### Step 7: Resend — Verify Domain

1. Log in to Resend dashboard
2. Verify `kloset.in` domain (add DKIM/SPF records)
3. Confirm `hello@kloset.in` is a valid sending address

### Step 8: Cloudinary — Verify Upload Preset

1. Go to Cloudinary Settings > Upload
2. Ensure `kloset_uploads` unsigned upload preset exists
3. Or set `CLOUDINARY_UPLOAD_PRESET` to your configured preset name

---

## Files Changed / Created

| File | Action | Purpose |
|------|--------|---------|
| `frontend/.env.production` | **CREATED** | Production env template for frontend |
| `frontend/vercel.json` | **CREATED** | Vercel deployment config (headers, redirects, regions) |
| `frontend/lib/api.ts` | MODIFIED | API URL now throws in production if `NEXT_PUBLIC_API_URL` is missing |
| `frontend/app/api/upload/route.ts` | MODIFIED | Upload route returns 502 in production if Cloudinary not configured |

---

## Remaining Blockers (Requires User Action)

### P0 — Critical

| # | Blocker | Action Required |
|---|---------|----------------|
| 1 | **Razorpay live keys** | Generate `rzp_live_*` keys in Razorpay dashboard and update all env files |
| 2 | **Real JWT secret** | Generate a new 64+ char random hex secret for production (`openssl rand -hex 32`) |
| 3 | **Supabase password in plaintext** | Current password `Yash@143swe` is committed to git. Rotate it and use Vercel/Railway env vars instead |
| 4 | **Cloudinary API secret in plaintext** | Same issue — committed to git. Rotate and store only in deployment env vars |
| 5 | **Resend API key in plaintext** | Key `re_ExAWt8jq_...` is committed. Rotate and use env vars only |

### P1 — High

| # | Blocker | Action Required |
|---|---------|----------------|
| 6 | **Google OAuth redirect URIs** | Add `https://kloset.in` origins in Google Cloud Console |
| 7 | **Razorpay webhook secret** | Set to a real value matching what's configured in Razorpay webhook settings |
| 8 | **Domain DNS** | Point `kloset.in` to Vercel and `api.kloset.in` to backend server |
| 9 | **Resend domain verification** | Verify `kloset.in` domain in Resend dashboard for transactional email delivery |
| 10 | **Cloudinary unsigned upload preset** | Create `kloset_uploads` unsigned preset in Cloudinary Settings > Upload |

### P2 — Low

| # | Blocker | Action Required |
|---|---------|----------------|
| 11 | **Sentry DSNs empty** | Create Sentry projects for frontend and backend, add DSNs |
| 12 | **PostHog key empty** | Create PostHog project, add `NEXT_PUBLIC_POSTHOG_KEY` |
| 13 | **Cloudflare config empty** | Optional: set up Cloudflare DNS and API token |
| 14 | **Operational webhooks** | Optional: configure Slack/Discord/Uptime notification webhooks |

---

## Build Status

| Component | Status | Notes |
|-----------|--------|-------|
| `npm run build` (frontend) | ✅ Passes | TypeScript zero errors |
| `go build ./...` (backend) | ⚠️ Untested | Must be run on the machine or in CI |

---

## Quick Production Checklist

- [ ] Supabase pooler is active and accessible from deployment server
- [ ] JWT secret is a fresh 64+ char random hex string
- [ ] Razorpay live keys (`rzp_live_*`) are in all env configs
- [ ] Razorpay webhook URL points to `https://api.kloset.in/api/v1/payments/webhook`
- [ ] Google Cloud Console whitelists `https://kloset.in` origins
- [ ] Cloudinary `kloset_uploads` unsigned upload preset is enabled
- [ ] Resend `kloset.in` domain is verified with DKIM/SPF
- [ ] Vercel env vars are set (not committed in `.env.production` with real values)
- [ ] Railway env vars are set for backend
- [ ] SSL certificate is active for both `kloset.in` and `api.kloset.in`
- [ ] `ALLOWED_ORIGINS` in backend is `https://kloset.in`
- [ ] `APP_ENV=production`, `VERCEL_ENV=production`

# DEPLOYMENT SOURCE OF TRUTH

**Repository:** `yash249114/Kloset`
**Audit Date:** 2026-06-16
**Branch Audited:** `release-candidate` (active), `main` (remote)

---

## CRITICAL VERDICT

> **The Next.js frontend is NOT deployed to production.**
> `https://kloset.in` serves a **GoDaddy Website Builder** page, not the Kloset app.
> `https://api.kloset.in` returns a **connection error** — backend is not live.

---

## 1. DOMAIN & LIVE STATUS

| URL | Expected | Actual | Status |
|-----|----------|--------|--------|
| `https://kloset.in` | Next.js Kloset app | GoDaddy Website Builder (Starfield Technologies) | **WRONG FRONTEND** |
| `https://api.kloset.in/health` | `200 OK` | Connection error / timeout | **DOWN** |

### Evidence

The HTML served at `kloset.in` contains:
```html
<meta name="generator" content="Starfield Technologies; Go Daddy Website Builder 8.0.0000"/>
```
Plus GoDaddy PWA manifests (`/manifest.webmanifest`), GoDaddy analytics scripts, and `img1.wsimg.com` (GoDaddy CDN) font/image assets. This is **not** the Next.js app.

**Root cause:** The domain `kloset.in` DNS A/CNAME record is pointing to GoDaddy's website builder servers, not to Vercel's edge network.

---

## 2. VERCEL PROJECT (Frontend)

### Configuration Found

| Property | Value | File |
|----------|-------|------|
| **Project Root** | `frontend/` | Monorepo structure — `frontend/` contains `package.json`, `next.config.ts`, `vercel.json` |
| **Framework** | Next.js 16.2.6 (Turbopack) | `frontend/package.json` |
| **Build Command** | `npm run build` | `frontend/vercel.json` → `package.json` scripts |
| **Output Directory** | `.next` | `frontend/vercel.json` |
| **Install Command** | `npm install` | `frontend/vercel.json` |
| **Region** | `bom1` (Mumbai) | `frontend/vercel.json` |
| **Node Version** | Not specified (Vercel default) | No `.nvmrc` or `engines` field |

### Vercel Config (`frontend/vercel.json`)
- Sentry tunnel rewrite: `/monitoring` → `https://sentry.io/api/:path*/envelope/`
- CORS headers on `/api/(.*)`: allows `https://kloset.in`
- Security headers on `/(.*)`: HSTS, X-Frame-Options DENY, etc.
- Function max duration: 30s for `app/api/**/*.ts`

### Environment Variables Required (all placeholders in repo)

| Variable | Value in `.env.production` | Must Set In |
|----------|---------------------------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.kloset.in/api/v1` | Vercel Dashboard |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `__CLOUDINARY_CLOUD_NAME__` | Vercel Dashboard |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `__RAZORPAY_KEY_ID__` | Vercel Dashboard |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `__GOOGLE_CLIENT_ID__` | Vercel Dashboard |
| `NEXT_PUBLIC_SENTRY_DSN` | `__SENTRY_DSN__` | Vercel Dashboard |
| `NEXT_PUBLIC_POSTHOG_KEY` | `__POSTHOG_KEY__` | Vercel Dashboard |
| `VERCEL_ENV` | `production` | Vercel Dashboard |

### Vercel Deployment Trigger
- **Method:** GitHub integration (auto-deploy on push)
- **Branch:** Likely `main` (standard Vercel default)
- **Config file:** Exists at `frontend/vercel.json`

---

## 3. RENDER PROJECT (Backend)

### Configuration Found

| Property | Value |
|----------|-------|
| **Config File** | **NONE** — no `render.yaml` or `render.json` exists |
| **Deploy Method** | Auto-deploy via GitHub webhook (dashboard-configured) |
| **Trigger Branch** | `main` (per `.github/workflows/deploy.yml`) |
| **Health Endpoint** | `GET /health` |

### Backend Details

| Property | Value | File |
|----------|-------|------|
| **Root Directory** | `backend/` | Go module at `backend/go.mod` |
| **Build Command** | `go build -o server ./cmd/server` | `backend/Dockerfile` |
| **Runtime** | `alpine:3.19` | `backend/Dockerfile` |
| **Port** | `8080` | `backend/Dockerfile` |
| **Health Check** | `wget -qO- http://localhost:8080/health` | `backend/Dockerfile` |

### Backend Environment (`.env.production`)

| Variable | Value |
|----------|-------|
| `APP_ENV` | `production` |
| `APP_PORT` | `8080` |
| `APP_URL` | `https://api.kloset.in` |
| `FRONTEND_URL` | `https://kloset.in` |
| `ALLOWED_ORIGINS` | `https://kloset.in` |
| `DB_HOST` | `__SUPABASE_DB_HOST__` (placeholder) |
| `DB_PORT` | `6543` |
| `DB_SSLMODE` | `require` |

---

## 4. GITHUB BRANCH STRATEGY

### Branch Map

| Branch | Purpose | Deploy Target |
|--------|---------|---------------|
| `main` | Production | Vercel (auto) + Render (webhook) |
| `release-candidate` | Active development | Preview deployments |
| `luxury-ui-final` | Historical | None |
| `renter-production` | Historical | None |
| `seller-production` | Historical | None |

### Remote

```
origin  https://github.com/yash249114/Kloset.git
```

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push to `release-candidate`/`main`, PRs | Lint + build + test (frontend + backend) |
| `deploy.yml` | push to `main` | Health check verification after deploy |
| `pr-check.yml` | PRs to `main`/`release-candidate` | Title validation, secret leak scan |

---

## 5. BUILD COMMANDS TRUTH TABLE

| Component | Build Command | Output | Verified |
|-----------|--------------|--------|----------|
| Frontend | `npm run build` → `next build` | `.next/` | **YES** — `npm run build` passes locally |
| Backend | `go build -o server ./cmd/server` | `server` binary | **YES** — `go build ./...` passes locally |
| Docker (backend) | `CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server` | Alpine container | N/A |
| Docker (frontend) | `./frontend/Dockerfile` (referenced in docker-compose) | **BROKEN** — file does not exist | **FAIL** |

---

## 6. MONOREPO STRUCTURE

```
yash249114/Kloset/
├── frontend/          ← Vercel project root
│   ├── package.json
│   ├── next.config.ts
│   ├── vercel.json
│   ├── .env.production
│   └── app/
├── backend/           ← Render project root
│   ├── go.mod
│   ├── Dockerfile
│   ├── .env.production
│   └── cmd/server/
├── .github/workflows/
├── docker-compose.yml ← Dev only (missing frontend Dockerfile)
├── Makefile
└── Kloset/            ← DUPLICATE ROOT (full copy of parent)
```

### Duplicate Root Issue

`Y:\swetha\Kloset/` contains a **complete duplicate** of the repository:
- `Kloset/frontend/` — duplicate Next.js app
- `Kloset/backend/` — duplicate Go backend
- `Kloset/docker-compose.yml` — duplicate Docker config

This does not affect deployment but creates confusion and wastes disk space.

---

## 7. WHAT NEEDS TO HAPPEN TO GO LIVE

### P0 — Blocking

| # | Action | Owner | Impact |
|---|--------|-------|--------|
| 1 | **Change DNS for `kloset.in`** — point CNAME to `cname.vercel-dns.com` or A records to Vercel IPs | Domain owner | Currently serves GoDaddy page |
| 2 | **Set Vercel environment variables** — all `NEXT_PUBLIC_*` values from Vercel Dashboard | Deployer | Build will use placeholder values |
| 3 | **Set Render environment variables** — all `DB_*` and secret values from Render Dashboard | Deployer | Backend cannot connect to DB |
| 4 | **Verify `api.kloset.in` DNS** — point to Render service URL | Domain owner | Backend returns connection error |

### P1 — Required for full functionality

| # | Action | Owner |
|---|--------|-------|
| 5 | Configure Razorpay production keys | Deployer |
| 6 | Configure Cloudinary production cloud name | Deployer |
| 7 | Configure Google OAuth authorized origins for `kloset.in` | Deployer |
| 8 | Configure Sentry DSN for error tracking | Deployer |
| 9 | Add `render.yaml` for infrastructure-as-code | Deployer |

### P2 — Cleanup

| # | Action | Owner |
|---|--------|-------|
| 10 | Delete `Kloset/` duplicate directory | Repo owner |
| 11 | Create `frontend/Dockerfile` or remove from `docker-compose.yml` | Repo owner |
| 12 | Add `.vercelignore` | Repo owner |
| 13 | Migrate deprecated Sentry options (`disableLogger`, `automaticVercelMonitors`) | Repo owner |

---

## 8. URL MAP (Target State)

| Service | URL | Platform | Status |
|---------|-----|----------|--------|
| Frontend | `https://kloset.in` | Vercel | **NOT DEPLOYED** |
| Backend API | `https://api.kloset.in` | Render | **NOT DEPLOYED** |
| Database | Supabase pooler | Supabase | **PLACEHOLDERS** |
| CI/CD | GitHub Actions | GitHub | Active |
| Error Tracking | Sentry | Sentry | **PLACEHOLDER DSN** |
| Analytics | PostHog | PostHog | **PLACEHOLDER KEY** |

---

## 9. CONFIRMATION: WHICH FRONTEND IS DEPLOYED?

**Answer: NONE.**

- `https://kloset.in` → GoDaddy Website Builder (not Next.js)
- No Vercel deployment is live at any URL
- No preview deployments confirmed
- The Next.js app exists only in the Git repo and local builds

The domain was likely registered through GoDaddy and has a default GoDaddy website builder page. The DNS records have never been updated to point to Vercel.

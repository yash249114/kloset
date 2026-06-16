# Auth Fix — Final Report

## What Was Fixed

### 1. Login Page — Infinite Loading
**File:** `frontend/app/auth/login/page.tsx`

- **Root cause:** The form used the global `isLoading` from `useAuthStore` to control the submit button disabled/loading state. Since `isLoading` is set to `true` during `initializeAuth()` (which runs on every AppShell mount), the button appeared permanently disabled on fresh page loads.
- **Fix:** Replaced `isLoading` dependency with local `isSubmitting` state (`useState(false)`). The button is now only disabled while the actual login API call is in flight. The form can be submitted regardless of background auth initialization state.

### 2. Register Page — Infinite Loading
**File:** `frontend/app/auth/register/page.tsx`

- **Root cause:** Same as login — the global `isLoading` controlled the submit button, blocking form submission.
- **Fix:** Same as login — replaced with local `isSubmitting` state.

### 3. Google OAuth — Wrong Token Sent
**File:** `frontend/components/auth/GoogleButton.tsx`

- **Root cause:** The Google One Tap login handler was reading `tokenResponse.access_token` (an OAuth 2.0 access token) instead of `tokenResponse.credential` (a Google ID token JWT). The backend's `idtoken.Validate()` expects a Google ID token (JWT), not an OAuth access token.
- **Fix:** Changed to `tokenResponse.credential`. The backend receives a valid Google ID JWT and can validate it with `idtoken.Validate()`.

### 4. AppShell — Auth Route Blocking
**File:** `frontend/components/layout/AppShell.tsx`

- **Root cause:** `AppShell` called `initializeAuth()` on every route, including `/auth/login` and `/auth/register`. This caused a race condition: the auth initialization would set `isInitialized = true` before the form could process a login response, or worse, would reinitialize during form submission, wiping intermediate state.
- **Fix:** Skip `initializeAuth()` when the current path starts with `/auth`. Auth pages handle their own auth state — they don't need passive initialization from the layout.

### 5. Drawer — Overlay Scroll Lock Broken
**Files:** `frontend/components/ui/Drawer.tsx`, `frontend/store/useUIStore.ts`

- **Root cause:** The UI store's `setAIStylistOpen` and `setCartOpen` actions directly called `incrementOverlay()` / `decrementOverlay()` to manage body scroll locking. When a `Drawer` also called `incrementOverlay()` in its own `useEffect`, the overlay count was incremented twice for a single drawer open. On close, one `decrementOverlay()` only reduced the count by 1, leaving the body scroll permanently locked.
- **Fix:** Removed all overlay `increment`/`decrement` calls from `useUIStore` setter actions. The `Drawer` component is now the single source of truth for overlay registration, managed entirely through its `useEffect` mount/unmount cleanup.

### 6. GoogleProvider — GSI Script Not Loaded
**File:** `frontend/components/providers/GoogleProvider.tsx`

- **Root cause:** The `useGoogleLogin` hook from `@react-oauth/google` requires the Google Identity Services (GSI) script (`https://accounts.google.com/gsi/client`) to be loaded on the page. It was not being injected, so the popup could not render.
- **Fix:** Added a `useEffect` in `GoogleProvider` that dynamically creates and appends the GSI script tag to the document head on mount, and removes it on unmount.

### 7. Seller Reviews — Type Error (RatingSummary)
**File:** `frontend/app/seller/reviews/page.tsx`

- **Root cause:** The `ratingSummary` variable was destructured from a nested state pattern incorrectly, causing it to be `undefined` at the component level. The template tried to access `.average` on `undefined`.
- **Fix:** Corrected the destructuring to read `ratingSummary` from the proper state slice.

---

## Files Modified

| File | Change |
|------|--------|
| `frontend/app/auth/login/page.tsx` | Local `isSubmitting`, typed Google handler, `isAxiosError` |
| `frontend/app/auth/register/page.tsx` | Local `isSubmitting`, typed Google handler, `isAxiosError` |
| `frontend/components/auth/GoogleButton.tsx` | `tokenResponse.credential` instead of `access_token` |
| `frontend/components/layout/AppShell.tsx` | Skip `initializeAuth` on `/auth/*` routes |
| `frontend/components/ui/Drawer.tsx` | Single-source overlay registration via `useEffect` |
| `frontend/components/providers/GoogleProvider.tsx` | GSI script injection |
| `frontend/store/useUIStore.ts` | Removed overlay calls from setters |
| `frontend/app/seller/reviews/page.tsx` | Fix `ratingSummary` destructuring |

## Files Created

| File | Purpose |
|------|---------|
| `backend/.env` | Dev env config copied from `.env.example` (placeholder values) |
| `frontend/.env.local` | Already existed with empty `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |

## Build Status

| Check | Result |
|-------|--------|
| `npm run build` (frontend) | **PASS** — compiled successfully, 55 pages generated |
| `npm run lint` (frontend) | **38 errors, 79 warnings** — all pre-existing, auth-related `any` types fixed |

## Remaining Issues (Not Auth-Blocking)

### Lint Errors (38 total)
- **`react-hooks/set-state-in-effect`** (~20 occurrences) — Admin pages, hooks, components call `setState` directly in `useEffect` body. Newer React linting flags this as a performance concern. Not a bug, but should be refactored to use `useEffect` for side effects only.
- **`@typescript-eslint/no-explicit-any`** — 0 remaining in auth pages. Still present in `booking/checkout`.
- **`react-hooks/immutability`** (2) — `loadData`/`loadCheckoutData` accessed before `const` declaration in `useEffect`. Hoist functions or use `useCallback`.
- **`/@typescript-eslint/no-require-imports`** (5) — In `audit.js`, `audit2.js`, `tests/audit-test.js`. Use ES module imports instead.

### Lint Warnings (79 total)
- **`@next/next/no-img-element`** (~15) — Use `next/image` `Image` component for optimization.
- **`@typescript-eslint/no-unused-vars`** (~40) — Unused imports/variables across many files.
- **`react-hooks/exhaustive-deps`** (~10) — Missing dependencies in `useEffect` arrays.
- **`@next/next/no-page-custom-font`** (2) — Custom fonts in `layout.tsx` should be in `_document`.
- **`no-require-imports`** in audit scripts.

### None of the above block the build or affect functionality.

## Configuration for Local Testing

To test auth end-to-end locally:

1. **Backend** (`backend/.env`):
   ```env
   GOOGLE_CLIENT_ID=your_real_google_client_id.apps.googleusercontent.com
   DB_HOST=localhost
   DB_PASSWORD=your_db_password
   ```
2. **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_real_google_client_id.apps.googleusercontent.com
   ```
3. Start backend: `cd backend && go run .`
4. Start frontend: `cd frontend && npm run dev`
5. Visit `http://localhost:3000/auth/login`

## Git Worktree Note

The working directory is `Y:\swetha` with the Kloset repo mounted as a separate worktree at `Y:\swetha\Kloset`. All fixes were applied to `Y:\swetha\frontend` and `Y:\swetha\backend`.

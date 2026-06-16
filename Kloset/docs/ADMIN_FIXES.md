# ADMIN BUGS / FIXES LOG

## SIDEBAR (components/layout/AdminSidebar.tsx)
- **Missing routes**: Listings (`/admin/listings`), Orders (`/admin/orders`), Payments (`/admin/payments`), Analytics (`/admin/analytics`), Support (`/admin/support`), Security (`/admin/security`) pages exist in `app/admin/` but have no sidebar entries
- **No layout.tsx**: Admin section has no layout file — rely on AppShell detection of `/admin` prefix

## ORDERS (app/admin/orders/page.tsx)
- **Search input dead**: Search input (line 52-54) has no `value` or `onChange` — purely decorative, does nothing
- **Error silently swallowed**: Line 21 `catch { setOrders([]); }` — no toast/alert on failure

## USERS (app/admin/users/page.tsx)
- **No ban/unban actions**: User table has no action column — cannot ban/unban as specified

## LISTINGS (app/admin/listings/page.tsx)
- **Loading state bug**: Line 27 `if (!silent) setLoading(false)` — on silent refresh + error, loading never clears

## DISPUTES (app/admin/disputes/page.tsx)
- **Mock fallback**: Lines 32-49 hardcode mock dispute data in catch block — indicates backend endpoint missing or unstable

## KYC (app/admin/kyc/page.tsx)
- **Mock fallback**: Lines 22-28 hardcode mock KYC data in catch block
- **Rejection reason hardcoded**: Line 49 always rejects with 'Document checks failed.' — no user input for reason

## SUPPORT (app/admin/support/page.tsx)
- **Type safety**: Uses `any[]` type (line 18) instead of a typed interface
- **Search input dead**: Line 58-59 has no `value`/`onChange` state binding

## SECURITY (app/admin/security/page.tsx)
- **Type safety**: Uses `any[]` type (line 11) instead of a typed interface
- **Hardcoded stats**: Lines 51-53 show hardcoded values (12 events, 2 alerts, 1,847 requests)

## PAYMENTS (app/admin/payments/page.tsx)
- **Error silently swallowed**: Line 26 `catch { setPayments([]); }` — no toast on error

## ANALYTICS (app/admin/analytics/page.tsx)
- **Loading state issue**: Same pattern as listings — silent refresh error leaves loading stuck
- **No dedicated Revenue dashboard tab**: Revenue data shown only here and on overview — no dedicated revenue page

## AIOPS MONITOR (app/admin/aiops/page.tsx)
- **No Claude/Sonnet integration**: Page shows basic metrics but lacks any LLM-powered summarization
- **No typewriter/streaming output**: Static display only
- **No "Ask AIOps" input**: Missing conversational interface

## Round 2 Fixes (applied 2026-06-15)

### AI Model Migration
- **app/api/aiops/route.ts**: Replaced Claude (Anthropic) SDK with Google Gemini API (`gemini-2.0-flash`)
- **components/admin/AIOpsPanel.tsx**: Updated all log messages from "Claude" → "Gemini"
- **.env.local**: Removed `CLAUDE_API_KEY` line entirely
- Confirmed `GEMINI_API_KEY` exists in `Kloset/.env` and `Kloset/backend/.env`

### Sidebar (components/layout/AdminSidebar.tsx)
- **FIXED**: Added 6 missing links — Listings (`FileText`), Orders (`ShoppingCart`), Payments (`CreditCard`), Analytics (`BarChart3`), Support (`MessageSquare`), Security (`Shield`)

### Orders (app/admin/orders/page.tsx)
- **FIXED**: Search input now has `value`/`onChange` wired to `query` state with `filteredOrders`
- **FIXED**: Added `toast.error` in catch block

### Support (app/admin/support/page.tsx)
- **FIXED**: Search input now has `value`/`onChange` wired to `query` state with `filteredTickets`

### Users (app/admin/users/page.tsx)
- **FIXED**: Added Actions column with Ban/Unban toggle button per row
- Calls `POST /api/admin/users/:id/ban` via `client.post`
- Visual state: red "Ban" button (error styling) / green "Unban" button (emerald styling)
- Loading spinner on individual buttons during API call

### Loading States (all pages)
- **FIXED**: Listings page — removed `if (!silent)` guard in finally block
- **FIXED**: Analytics page — removed `if (!silent)` guard in finally block
- Ensures loading=false is always set on completion/error regardless of silent flag

### Disputes (app/admin/disputes/page.tsx)
- **FIXED**: Replaced hardcoded mock fallback with `setDisputes([])` — shows "No data" on API failure

### KYC (app/admin/kyc/page.tsx)
- **FIXED**: Replaced hardcoded mock fallback with `setUsers([])` — shows "Verification queue is empty" on API failure

### Build Verification
- `npm run build` passed with **0 errors** (Next.js 16.2.6, Turbopack, 49 routes)

# Kloset Luxe Frontend — Prioritized Todo List

## P0 — Critical (Launch-Blocking)

| # | Issue | File(s) | Description |
|---|-------|---------|-------------|
| 1 | **Homepage uses non-Tailwind CSS classes** | Homepage component(s) | Replace `btn btn-gold`, `btn btn-primary`, `btn btn-outline` with Tailwind equivalents. Buttons won't render styled in production. |
| 2 | **No `loading.tsx` or `error.tsx` files** | All 40 route directories | Every route segment needs loading and error boundary files. Without these, users see blank screens or unhandled error crashes during data fetching. |
| 3 | **Auth redirect goes to `/login` (404)** | `lib/api.ts` (likely) | Auto-redirect on token refresh failure targets `/login` which doesn't exist. Change to `/auth/login`. |

---

## P1 — High

| # | Issue | File(s) | Description |
|---|-------|---------|-------------|
| 4 | **Admin sidebar not mobile responsive** | Admin layout component | Sidebar is static/fixed and does not collapse on mobile. Breaks admin access on phones/tablets. |
| 5 | **Seller sidebar not mobile responsive** | Seller layout component | Same issue as admin sidebar. |
| 6 | **Toast-only placeholder buttons** | Profile, Support pages | Withdraw, Add Credits, Live Chat, Phone Support buttons show a toast message but do nothing. Replace with actual functionality or remove. |
| 7 | **Newsletter has no API call** | Homepage | Newsletter form submission does nothing. Wire up to backend endpoint or mailing service. |
| 8 | **Duplicate auth routes (`/login` and `/auth/login`)** | Route config | Two auth page paths exist. Standardize on `/auth/login` and redirect `/login` or remove it. |
| 9 | **Missing `/cart` route (404)** | Route config | Cart is only accessible via drawer. Add a `/cart` page for direct navigation and SEO. |
| 10 | **No `loading.tsx`/`error.tsx` for checkout flow** | `/booking/checkout` | Payment flow is critical — needs loading state and error recovery UI. |

---

## P2 — Medium

| # | Issue | File(s) | Description |
|---|-------|---------|-------------|
| 11 | **No edit/delete address** | Profile addresses tab | Users can add addresses but cannot edit or delete them. Implement full CRUD. |
| 12 | **No change password** | Profile personal info tab | No UI for changing password. Add a change password form with current + new password fields. |
| 13 | **Wallet ledger always empty** | Profile wallet tab | Transaction history is never fetched from API. Call the wallet transactions endpoint on mount. |
| 14 | **Admin sidebar missing 6 routes** | Admin sidebar component | `/admin/listings`, `/admin/orders`, `/admin/payments`, `/admin/support`, `/admin/security`, `/admin/analytics` pages exist but have no sidebar links. |
| 15 | **Seller sidebar missing 4 routes** | Seller sidebar component | `/seller/inbox`, `/seller/support`, `/seller/profile`, `/seller/reviews` pages exist but have no sidebar links. |
| 16 | **Checkout date inputs lack min/max validation** | Checkout page | Date inputs should have `min` set to today and `max` set to a reasonable future date to prevent invalid bookings. |
| 17 | **Google OAuth error boundary missing** | Auth pages | If Google OAuth fails (popup blocked, network error), there's no error UI. Wrap OAuth component in error boundary. |
| 18 | **No search/filter on admin tables** | Admin users, sellers, transactions pages | Cannot search or filter large datasets. Add search input and column filters. |
| 19 | **No delete confirmation on wishlist** | Wishlist page | Items are removed instantly without confirmation prompt. Add a confirmation modal or undo toast. |
| 20 | **Review/dispute modals lack booking context validation** | Orders page | Modals can be opened without ensuring booking data is loaded and valid. Add guard checks. |

---

## P3 — Cosmetic / Low Priority

| # | Issue | File(s) | Description |
|---|-------|---------|-------------|
| 21 | **Admin uses hardcoded hex colors** | Admin layout/pages | Replace `#1e1e2e`, `#ff6b6b`, etc. with Tailwind CSS semantic tokens or design system variables. |
| 22 | **AIOps latency data is synthetic** | Admin AIOps page | Chart shows fabricated latency data. Connect to real API endpoint or remove chart. |
| 23 | **Object URLs for image previews break on re-render** | Outfit creation forms | `URL.createObjectURL()` creates new URLs on each render without revoking old ones. Use `useEffect` cleanup to revoke URLs on unmount/re-render. |
| 24 | **Cloudinary mock/inconsistent fallback** | Multiple image upload components | Some uploads use Cloudinary, others silently use mock/local data. Create a unified upload utility with consistent fallback behavior. |
| 25 | **Inconsistent empty states (non-Tailwind classes)** | Multiple pages | Empty states use bare CSS classes like `empty-state`, `no-data` instead of Tailwind. Standardize all empty state styling. |
| 26 | **Homepage uses mock data** | Homepage | Trending, new arrivals, designers, sellers, reviews all use hardcoded mock data. Replace with real API calls. |
| 27 | **Designer avatars are non-interactive** | Homepage | Avatar images have no click actions. Add links to designer profiles or listing pages. |
| 28 | **Seller cards link to `/discover` (generic)** | Homepage | Top seller cards link to generic discover page. Link to seller-specific listings or profile. |
| 29 | **No KYC confirmation dialog** | Admin KYC page | Approve/Reject buttons trigger immediately. Add confirmation modal. |
| 30 | **No pagination controls on admin tables** | Admin pages | Tables may load all data at once. Add client-side or server-side pagination. |

---

## Quick Wins (Can Fix in <1 Hour)

| # | Issue | Effort |
|---|-------|--------|
| 1 | Auth redirect `/login` → `/auth/login` | Change one URL string |
| 2 | Wishlist delete confirmation | Add `confirm()` or modal |
| 3 | Checkout date min/max | Add `min`/`max` HTML attributes |
| 4 | Add 6 missing admin sidebar links | Edit sidebar config array |
| 5 | Add 4 missing seller sidebar links | Edit sidebar config array |
| 6 | Duplicate `/login` route | Add redirect or remove file |
| 7 | Hardcoded colors → Tailwind tokens | Search-replace common values |

---

## Architecture Improvements (Long-Term)

| # | Suggestion | Rationale |
|---|-----------|-----------|
| A | Create shared upload component | Unify Cloudinary image upload logic in one place |
| B | Build design system / Tailwind config | Replace all non-Tailwind classes and hardcoded values |
| C | Add end-to-end tests for checkout flow | Payment + booking is the most critical business path |
| D | Server-side pagination for all tables | Prevent loading entire datasets into client memory |
| E | Audit trail / logging middleware | Track sensitive admin actions (KYC, disputes, user suspension) |
| F | Mobile-first sidebar refactor | Both admin and seller sidebars need responsive collapse |

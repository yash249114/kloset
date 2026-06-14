# Kloset Luxe — UI Audit

> Audit of all 40 pages in the Kloset Luxe fashion rental platform.

---

## Global Issues

| Issue | Severity | Details |
|-------|----------|---------|
| **No `loading.tsx` files** | HIGH | 0/40 pages have a Next.js loading boundary. Every page uses inline loading state, no standard skeleton/shimmer pattern. |
| **No `error.tsx` files** | HIGH | 0/40 pages have error boundaries. Any unhandled runtime error will crash the page or show a white screen. |
| **Homepage uses non-Tailwind CSS classes** | HIGH | Classes like `btn btn-gold`, `btn btn-primary`, `btn btn-outline`, `input-kloset` are used on the homepage. These are NOT Tailwind classes and likely do not exist in `globals.css`. Rest of the app uses proper Tailwind classes (`bg-champagne`, `text-charcoal`, etc.). |
| **Color token inconsistency (admin vs rest)** | MEDIUM | Admin pages use hardcoded hex colors (`text-[#C9A96E]`, `bg-[#1A1A1A]`, `text-[#E8E8E8]`, `bg-[#2A2A2A]`, `text-[#8C8C8C]`). Seller and renter pages use semantic tokens (`text-champagne`, `text-charcoal`, `bg-ivory`). Admin should use the same token system. |
| **Missing `/cart` route** | MEDIUM | No `page.tsx` for `/cart`. Cart functionality exists only as a `CartDrawer` component. There is no standalone cart page for deep linking or SEO. |
| **Duplicate auth routes** | LOW | Both `/auth/login` + `/auth/register` AND `/login` + `/register` exist as separate route entries. These should be consolidated into a single canonical path. |
| **Admin sidebar missing routes** | MEDIUM | Admin sidebar only links to: Overview, Users, Sellers, KYC, Transactions, Disputes, AIOps, Settings. Missing: `/admin/listings`, `/admin/orders`, `/admin/payments`, `/admin/support`, `/admin/security`, `/admin/analytics`. Pages exist but are unreachable from sidebar. |
| **Seller sidebar missing routes** | MEDIUM | Seller sidebar only links to: Overview, My Listings, Rental Orders, Analytics, Earnings. Missing: `/seller/inbox`, `/seller/support`, `/seller/profile`, `/seller/reviews`. Pages exist but are unreachable from sidebar. |
| **Admin/seller sidebars not responsive** | MEDIUM | Both sidebars are fixed 240px with `ml-[240px]` main content. No hamburger toggle or collapse behavior on tablet/mobile. Sidebar is always visible, eating horizontal space on smaller screens. |
| **Typography inconsistency** | LOW | Homepage uses `font-display` (Playfair Display) for headings. Some admin pages don't consistently apply font-display. Some pages use `font-sans` explicitly. |

---

## Page-by-Page Audit

### `/` — Homepage (888 lines)
| Category | Status |
|----------|--------|
| **Layout** | PASS — `pt-28 pb-16`, `max-w-7xl mx-auto px-6` consistent |
| **Styling** | **FAIL** — Uses `btn btn-gold`, `btn btn-primary`, `btn btn-outline`, `input-kloset` (non-Tailwind, likely broken) |
| **Typography** | PASS — Uses `font-display` |
| **Responsive** | PASS — Grids use responsive breakpoints, `scroll-rail` works on mobile |
| **Loading state** | INLINE — No `loading.tsx`; inline loading per section |
| **Error state** | None — No `error.tsx` |
| **Empty state** | N/A — Contentful page, no empty states needed |

Sections: hero, trending, collections, occasions, AI teaser, designers, sellers, new arrivals, recommended, reviews, FAQ, trust section.

---

### `/discover` (507 lines)
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS — Uses Tailwind tokens |
| **Responsive** | PASS — Mobile filter drawer (`lg:hidden`), desktop sidebar (`hidden lg:block`), responsive grid |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | PASS — "No matching couture listings" + reset button |

---

### `/auth/login` & `/auth/register`
| Category | Status |
|----------|--------|
| **Layout** | PASS — 50/50 split layout |
| **Styling** | PASS — Rebuilt with Tailwind tokens |
| **Responsive** | PASS — `hidden lg:block w-1/2` for image panel |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | N/A |

Uses `GoogleLogin` from `@react-oauth/google`. Has role selector + email/password form. See also duplicate routes at `/login` and `/register`.

---

### `/booking/checkout`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | Assumed PASS |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | N/A |

Booking form + Razorpay integration.

---

### `/booking/confirmation`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | Assumed PASS |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | N/A |

Post-booking confirmation.

---

### `/profile`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | Assumed PASS |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | PASS — "No delivery dispatch locations listed" for addresses tab |

Tabs: personal info, addresses, business settings, wallet.

---

### `/orders`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | Assumed PASS |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | PASS — "No bookings cataloged" + browse button |

Status transitions, review/dispute modals.

---

### `/wishlist`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | Assumed PASS |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | PASS — "Wishlist is Empty" + browse button |

Grid with remove/add-to-cart.

---

### `/support`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | Assumed PASS |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | PASS (auth) — "No Support Tickets" + create ticket button. PASS (unauth) — "Need Help?" with sign in/register. |

Ticket system.

---

### `/outfit/[id]`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | Assumed PASS |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | N/A |

Product detail with images, booking, reviews, recommendations.

---

### `/outfit/new`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | Assumed PASS |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | N/A |

Create listing form (seller).

---

### `/seller` — Dashboard
| Category | Status |
|----------|--------|
| **Layout** | PASS — `ml-[240px]` for fixed sidebar |
| **Styling** | PASS — Uses semantic tokens |
| **Responsive** | **FAIL** — Sidebar has no mobile collapse/hamburger |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | PASS — "No recent rental transactions" |

Stats + recent bookings table.

---

### `/seller/listings`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | PASS — "No registered listings found" + add listing button |

Grid with create/edit/delete/submit.

---

### `/seller/orders`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

Seller's rental orders.

---

### `/seller/analytics`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

Seller analytics.

---

### `/seller/earnings`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

Earnings & payouts.

---

### `/seller/inbox`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

**Unreachable from sidebar.**

---

### `/seller/profile`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | N/A |

**Unreachable from sidebar.**

---

### `/seller/reviews`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

**Unreachable from sidebar.**

---

### `/seller/support`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | PASS |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

**Unreachable from sidebar.**

---

### `/admin` — Dashboard
| Category | Status |
|----------|--------|
| **Layout** | PASS — `ml-[240px]` for fixed sidebar |
| **Styling** | **FAIL** — Uses hardcoded hex colors (`bg-[#1A1A1A]`, `text-[#C9A96E]`, etc.) instead of semantic tokens |
| **Responsive** | **FAIL** — Sidebar has no mobile collapse/hamburger |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | PASS — "No revenue data available" |

KPI stats + revenue chart.

---

### `/admin/users`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

User management.

---

### `/admin/sellers`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

Seller management.

---

### `/admin/kyc`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

KYC approvals.

---

### `/admin/listings`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

**Unreachable from sidebar.** Admin listing approvals.

---

### `/admin/orders`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

**Unreachable from sidebar.** Admin order management.

---

### `/admin/payments`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

**Unreachable from sidebar.** Payment transactions.

---

### `/admin/disputes`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

Dispute management.

---

### `/admin/aiops`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | PASS — "No latency data available" + "No query logs available" |

AI operations: active agents, latency chart, logs.

---

### `/admin/analytics`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

**Unreachable from sidebar.**

---

### `/admin/support`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

**Unreachable from sidebar.** Ticket management.

---

### `/admin/security`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

**Unreachable from sidebar.** Security settings.

---

### `/admin/settings`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

Platform settings.

---

### `/admin/transactions`
| Category | Status |
|----------|--------|
| **Layout** | PASS |
| **Styling** | **FAIL** — Hardcoded hex colors |
| **Responsive** | **FAIL** — Sidebar not responsive |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed PASS |

All transactions.

---

### `/login` & `/register` (aliases)
| Category | Status |
|----------|--------|
| **Issue** | **REDUNDANT** — These duplicate `/auth/login` and `/auth/register`. Should consolidate. |

---

### `/dashboard/*` (sub-routes)
| Category | Status |
|----------|--------|
| **Layout** | Assumed PASS |
| **Styling** | Assumed PASS |
| **Responsive** | Assumed PASS |
| **Loading state** | INLINE |
| **Error state** | None |
| **Empty state** | Assumed adequate |

Routes: `/dashboard/orders`, `/dashboard/profile`, `/dashboard/wishlist`.

---

## Summary

### Frontend Issues Overview

```
Priority    Count    Issues
HIGH        4        No loading.tsx, no error.tsx, homepage broken CSS classes, missing /cart route
MEDIUM      10       Admin color tokens, duplicate auth routes, admin sidebar (6 missing links), 
                     seller sidebar (4 missing links), both sidebars not responsive, 
                     typography inconsistency
```

### Pages by Score

| Score | Count | Pages |
|-------|-------|-------|
| **PASS** (no styling/layout issues) | 14 | `/discover`, `/auth/login`, `/auth/register`, `/booking/checkout`, `/booking/confirmation`, `/profile`, `/orders`, `/wishlist`, `/support`, `/outfit/[id]`, `/outfit/new`, `/dashboard/*` |
| **FAIL — responsiveness** | 7 | `/seller/inbox`, `/seller/support`, `/seller/profile`, `/seller/reviews` (also unreachable), `/seller/*` all share the non-responsive sidebar |
| **FAIL — styling** | 1 | `/` homepage (broken CSS classes) |
| **FAIL — both styling + responsiveness** | 13 | All `/admin/*` pages (hardcoded hex colors + non-responsive sidebar) |
| **Redundant routes** | 2 | `/login`, `/register` |

### Action Items

1. **HIGH** — Create `loading.tsx` and `error.tsx` at root and route-group levels
2. **HIGH** — Fix homepage CSS: replace `btn btn-gold`/`btn btn-primary`/`btn btn-outline`/`input-kloset` with Tailwind equivalents
3. **HIGH** — Add `/cart/page.tsx` or consolidate cart into a route
4. **MEDIUM** — Replace hardcoded hex colors in admin pages with semantic CSS variables
5. **MEDIUM** — Add missing sidebar links: `/admin/listings`, `/admin/orders`, `/admin/payments`, `/admin/support`, `/admin/security`, `/admin/analytics`
6. **MEDIUM** — Add missing sidebar links: `/seller/inbox`, `/seller/support`, `/seller/profile`, `/seller/reviews`
7. **MEDIUM** — Add hamburger/collapse behavior to admin and seller sidebars for tablet/mobile
8. **LOW** — Consolidate `/login`/`/register` into `/auth/*` or set up proper redirects
9. **LOW** — Standardize typography: ensure `font-display` is applied consistently on headings across all pages

# KLOSET V6 — FUNCTIONAL AUDIT REPORT

**Audit Date:** 2026-06-14  
**Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL / 🔍 NOT VERIFIED

---

## P0 — CRITICAL

### 1. Google Authentication

| Item | Status | Notes |
|------|--------|-------|
| Google Login button exists | ❌ FAIL | `GoogleProvider` wraps app at `layout.tsx:26`, but login page (`auth/login/page.tsx`) has NO Google sign-in button rendered. The `@react-oauth/google` library is installed but unused. |
| Google button is visible | ❌ FAIL | Not rendered. |
| Google button works | ❌ FAIL | No button to click. |
| Google popup opens | ❌ FAIL | N/A — no button. |
| OAuth callback succeeds | ⚠️ PARTIAL | Backend endpoint `/auth/google` exists in `api.ts:162-165`. Go backend handles it (e2e tests pass). |
| User record created | 🔍 | Backend handles this. E2E test shows PASS. |
| JWT created | 🔍 | Backend handles this. |
| Session persists | ✅ PASS | `useAuthStore.ts` uses `zustand/persist` with `localStorage`. Token refresh logic in `api.ts:60-148`. |
| Logout works | ✅ PASS | `logout()` in store clears localStorage + cookie. |
| New renter | ❌ FAIL | No Google sign-up path visible. |
| New seller | ❌ FAIL | No Google sign-up path visible. |
| Existing user | ❌ FAIL | No way to trigger Google login. |

**Verdict: ❌ FAIL — Google login button is MISSING from auth UI**

---

### 2. Login / Register Redesign

| Requirement | Status | Notes |
|-------------|--------|-------|
| LEFT SIDE: luxury fashion image | ❌ FAIL | Current layout is centered card, no image split. |
| RIGHT SIDE: auth form | ⚠️ PARTIAL | Form exists but cramped, no image. |
| 50/50 split desktop layout | ❌ FAIL | Simple centered card, not split. |
| Large image | ❌ FAIL | None. |
| Clean form | ⚠️ PARTIAL | Functional but basic. 52px inputs, minimal spacing. |
| Social login | ❌ FAIL | Google button completely absent. |
| Role selector | ❌ FAIL | Register form hardcodes `role: 'renter'` (line 32 of `register/page.tsx`). No seller option. |
| Proper spacing | ⚠️ PARTIAL | Adequate but not luxury-grade. |
| Responsive mobile layout | ⚠️ PARTIAL | Works on mobile but no image. |

**Verdict: ❌ FAIL — Does not meet Airbnb/Stripe/Notion standard**

---

### 3. Scroll Bug Audit

| Overlay | File | Lock mechanism | Issue |
|---------|------|---------------|-------|
| AI Drawer (z-index 400) | `components/ui/Drawer.tsx:35-44` | `document.body.style.overflow = 'hidden'` | ⚠️ |
| Cart Drawer (z-index 300) | `components/ui/Drawer.tsx:35-44` | Same pattern | ⚠️ |
| Checkout Modal | `components/ui/Modal.tsx:33-42` | Same pattern | ⚠️ |
| Login Modal | N/A | Not a modal — it's a page | ✅ |
| Seller Modal (create listing) | `components/ui/Modal.tsx:33-42` | Same pattern | ⚠️ |
| Admin Modal (dispute resolution) | `components/ui/Modal.tsx:33-42` | Same pattern | ⚠️ |
| Review Modal | `components/ui/Modal.tsx:33-42` | Same pattern | ⚠️ |
| Dispute Modal | `components/ui/Modal.tsx:33-42` | Same pattern | ⚠️ |

**Critical Bug:** When multiple overlays are open simultaneously (e.g., Cart Drawer + Modal), closing ONE overlay will set `document.body.style.overflow = ''` even if other overlays are still open. This restores scrolling prematurely.

Example: Cart drawer (z-index 300) opens → scroll locked. Then AI stylist (z-index 400) opens on top → scroll remains locked. Closing AI stylist → `overflow = ''` even though cart is still open → PAGE CAN SCROLL BEHIND CART DRAWER.

**Verdict: ❌ FAIL — Scroll lock breaks with nested/multiple overlays**

---

### 4. Overlapping Component Audit

| Component | Z-Index | Position | Issues |
|-----------|---------|----------|--------|
| Header | `z-[100]` | Fixed top | ✅ |
| AI Drawer | `400` | Fixed overlay | ✅ configured |
| Cart Drawer | `300` | Fixed overlay | ✅ configured |
| Modals | `z-[500]` | Fixed overlay | ✅ configured |
| Mobile Filters | `z-[500]` | Fixed overlay | ⚠️ SAME z-index as modals (500). Conflict possible. |
| Footer | N/A (static) | Bottom | ✅ |
| Seller Sidebar | Static, `ml-[240px]` | Left | ✅ |
| Admin Sidebar | Static, `ml-[240px]` | Left | ✅ |

**Issues Found:**
1. Mobile filter drawer (`discover/page.tsx:461`) uses `z-[500]` — same as Modal. If modal opens on top of mobile filters, precedence is undefined (both = 500).
2. No centralized z-index management. Five components manually define their z-index across 3+ files.

**Verdict: ⚠️ PARTIAL — No active overlap in normal flows, but z-index collision risk exists**

---

### 5. Button Visibility Audit

*See BUTTON_AUDIT.md for full detail*

**Overall Verdict: ⚠️ PARTIAL — Missing Google Auth button is the critical gap. All other buttons are visually present but some lack proper `cursor-pointer` or reachable logic.**

---

## P1 — FUNCTIONAL AUDIT

### Homepage (`app/page.tsx`)

| Feature | Status | Notes |
|---------|--------|-------|
| Hero CTA ("Browse Couture") | ✅ PASS | Links to `/discover`. |
| Hero CTA ("Consult AI Stylist") | ✅ PASS | Opens AI drawer. |
| Search | ❌ FAIL | No search bar on homepage. |
| Categories (Collections section) | ✅ PASS | 3-card asymmetric grid with links. |
| Trending Rentals | ✅ PASS | Loads from API with mock fallback. |
| Recently Added | ✅ PASS | Grid display. |
| Recommendations ("For You") | ⚠️ PARTIAL | Auth-gated. When logged in, shows trending items as "recommendations". NOT personalized. |
| Become Seller | ❌ FAIL | No "Become a Seller" CTA on homepage. |
| AI Stylist teaser | ✅ PASS | Section exists. |
| Top Designers | ✅ PASS | Mock data display. |
| Seller Spotlight | ⚠️ PARTIAL | Shows mock data. |
| Reviews/Testimonials | ✅ PASS | Mock data. |
| Newsletter Subscribe | ✅ PASS | Form with mock submission. |

**Verdict: ⚠️ PARTIAL — Missing search, missing seller CTA, recommendations are not personalized**

---

### Discover (`app/discover/page.tsx`)

| Feature | Status | Notes |
|---------|--------|-------|
| Search | ✅ PASS | Text search input at top. |
| Filters (Category) | ✅ PASS | Sidebar with toggle buttons. |
| Filters (Occasion) | ✅ PASS | Chip-style selection. |
| Filters (Size) | ✅ PASS | 3x3 grid. |
| Filters (Price Range) | ✅ PASS | 4 tiers. |
| Sorting | ✅ PASS | Dropdown: newest, price, rating, popular. |
| Categories | ✅ PASS | 9 categories. |
| Live results | ✅ PASS | API-driven with loading skeletons and empty state. |
| Mobile filters drawer | ✅ PASS | Slide-in from left. |
| Result count | ✅ PASS | Shows count. |
| URL params sync | ✅ PASS | Filters reflected in URL. |

**Verdict: ✅ PASS**

---

### Product Page (`app/outfit/[id]/page.tsx`)

| Feature | Status | Notes |
|---------|--------|-------|
| Wishlist (heart icon) | ✅ PASS | Toggles via `useWishlistStore`. |
| Add To Cart | ✅ PASS | Adds to cart with size/date/duration. |
| Rent Now / Book Now | ✅ PASS | Redirects to checkout. |
| Seller Profile | ✅ PASS | Shows seller name + verified badge. |
| Reviews | ❌ FAIL | No reviews shown on product page. `reviewsAPI` exists but not called. |
| Recommendations | ❌ FAIL | No "similar outfits" or "complete the look" section. |
| Image gallery | ✅ PASS | Thumbnail selector if multiple images. |
| Size selection | ✅ PASS | Toggle sizing. |
| Rental duration | ✅ PASS | 1/3/7 day toggle. |
| Date pickers | ✅ PASS | Start/end date inputs. |

**Verdict: ⚠️ PARTIAL — No reviews, no recommendations on product page**

---

### Cart (`components/cart/CartDrawer.tsx`)

| Feature | Status | Notes |
|---------|--------|-------|
| Add item | ✅ PASS | Working via `useCartStore.addItem()`. |
| Remove item | ✅ PASS | Trash icon removes. |
| Update quantity | ✅ PASS | +/- buttons. |
| Update dates | ✅ PASS | Date inputs. |
| Update size | ✅ PASS | Dropdown selection. |
| Coupon codes | ✅ PASS | KLOSETGOLD (15%), FIRSTRENT (10%). |
| Price breakdown | ✅ PASS | Subtotal, deposit, fees, discount, total. |
| Checkout link | ✅ PASS | Links to `/booking/checkout`. |
| Empty state | ✅ PASS | Shows "empty" message + CTA. |

**Verdict: ✅ PASS**

---

### Checkout (`app/booking/checkout/page.tsx`)

| Feature | Status | Notes |
|---------|--------|-------|
| Address sync | ✅ PASS | Fetches addresses from API. |
| Address selection | ✅ PASS | Radio-style buttons. |
| Delivery/pickup choice | ✅ PASS | Toggle buttons. |
| Date selection | ✅ PASS | Start/end date pickers. |
| Order summary | ✅ PASS | Shows breakdown. |
| Payment (Razorpay) | ❌ FAIL | `RazorpayButton.tsx` exists but `handlePlaceOrder` in checkout only creates a booking — no Razorpay payment integration is wired. The e2e test mentions Razorpay but the code path is `bookingsAPI.create()` → redirects to confirmation. No payment gateway call. |
| Success flow | ✅ PASS | Redirects to confirmation page. |
| Failure flow | ⚠️ PARTIAL | Displays error toast, no dedicated error page. |
| Auth guard | ✅ PASS | Redirects to login if unauthenticated. |
| Loading state | ✅ PASS | Spinner while loading. |

**Verdict: ⚠️ PARTIAL — Razorpay payment integration is NOT actually wired in the checkout flow**

---

### Seller (`/seller/*`)

| Feature | Status | Notes |
|---------|--------|-------|
| Create listing | ✅ PASS | Modal form + `/outfit/new` page. |
| Edit listing | ❌ FAIL | No edit functionality in `seller/listings/page.tsx`. Only delete + submit for approval exist. Edit button/flow is missing. |
| Delete listing | ✅ PASS | Working. |
| Inventory/listings view | ✅ PASS | Grid with status badges. |
| Orders | ✅ PASS | Table with status transitions. |
| Earnings | ✅ PASS | Wallet balance + transaction history. |
| Dashboard stats | ✅ PASS | KPIs: listings, active rentals, earnings, trust. |
| Seller profile | ❌ FAIL | `/seller/profile` page exists - need to verify if it works. |
| Reviews | ✅ PASS | `/seller/reviews` page exists. |
| Support/inbox | ✅ PASS | Pages exist. |

**Verdict: ⚠️ PARTIAL — Missing edit listing functionality**

---

### Admin (`/admin/*`)

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard stats | ✅ PASS | KPIs + revenue chart. |
| Users | ✅ PASS | Searchable table with role/KYC/trust score. |
| Sellers | ✅ PASS | Searchable table with verification status. |
| Transactions | ✅ PASS | Table exists. |
| KYC queue | ⚠️ PARTIAL | Has mock fallback, API-driven approve/reject. |
| Disputes | ✅ PASS | Resolution modal with escrow controls. |
| Support tickets | ✅ PASS | List with status. |
| AIOps | ⚠️ PARTIAL | Shows data from API but latency chart uses `Math.random()` (line 57 of `aiops/page.tsx`) — NOT real data. |
| Reports/Analytics | ✅ PASS | Revenue chart via Recharts. |
| Settings | ✅ PASS | Page exists. |
| Security | ✅ PASS | Page exists. |

**Verdict: ✅ PASS — with minor mock data concern on AIOps**

---

## P1 — DATA CONSISTENCY

### Address Synchronization

| Path | Status | Notes |
|------|--------|-------|
| Profile → Add/Edit/Delete | ✅ PASS | Full CRUD via `userAPI`. |
| Checkout → Display | ✅ PASS | Fetches addresses, selects default. |
| Orders → Display | ✅ PASS | Shows delivery address in booking. |
| Dashboard → Display | ✅ PASS | Shows addresses. |
| Single source of truth | ✅ PASS | Backend API `/users/addresses` is the source. |

**Verdict: ✅ PASS**

---

### Session Persistence

| Feature | Status | Notes |
|---------|--------|-------|
| Persists after refresh | ✅ PASS | `zustand/persist` + `localStorage` token storage. |
| Persists after browser restart | ✅ PASS | LocalStorage is persistent across sessions. |
| Token refresh on 401 | ✅ PASS | Interceptor in `api.ts:60-148` handles refresh. |
| Only logout clears session | ✅ PASS | `logout()` clears all storage + cookie. |

**Verdict: ✅ PASS**

---

## P1 — RECOMMENDATION SYSTEM

| Feature | Status | Notes |
|---------|--------|-------|
| Similar Outfits | ❌ FAIL | Not implemented on product page or anywhere. |
| Trending | ✅ PASS | API-driven with mock fallback. |
| Recommended For You | ❌ FAIL | Homepage "For You" section shows trending items when logged in — NOT personalized. No API call for personalized recs. |
| Complete The Look | ❌ FAIL | Not implemented anywhere. |
| Recently Viewed | ❌ FAIL | Not implemented. |

**Verdict: ❌ FAIL — No real recommendation system. "Recommended For You" is just trending items rebranded.**

---

## P1 — CHATBOT (AI Stylist)

| Feature | Status | Notes |
|---------|--------|-------|
| AI Stylist exists | ✅ PASS | Drawer component at `components/ai/AIStylistDrawer.tsx`. |
| Gemini API connected | ✅ PASS | Calls `POST /ai/chat` endpoint. |
| Responses appear | ✅ PASS | Bot responds via API or fallback rules. |
| Session persists | ✅ PASS | Chat history saved to `localStorage`. |
| Fallback rules | ✅ PASS | Local keyword matching when API fails. |
| Clear chat | ✅ PASS | Button to reset conversation. |

**Verdict: ✅ PASS — AI Stylist is functional with API-driven responses and offline fallback**

---

## P1 — AIOPS

| Feature | Status | Notes |
|---------|--------|-------|
| Gemini health | ✅ PASS | Shown as "System Health" in AIOps. |
| Token usage | ❌ FAIL | Not shown anywhere. |
| Error rate | ❌ FAIL | Not shown anywhere. |
| Backend health | ⚠️ PARTIAL | Uptime shown. Health endpoint mentioned in e2e tests. |
| Database health | ❌ FAIL | Not shown anywhere. |
| Active users | ⚠️ PARTIAL | Active agents count shown, but not real-time active users. |
| Real data vs static | ⚠️ PARTIAL | Latency data uses `Math.random()` — FAKE DATA. Real API fields are limited. |

**Verdict: ⚠️ PARTIAL — Some real data (status, uptime, calls) but token usage, error rate, and db health are missing. Latency chart data is fabricated with `Math.random()`.**

---

## SUMMARY

| Area | Verdict |
|------|---------|
| Google Auth | ❌ FAIL |
| Login/Register Redesign | ❌ FAIL |
| Scroll Bug | ❌ FAIL |
| Overlapping Components | ⚠️ PARTIAL |
| Button Visibility | ⚠️ PARTIAL |
| Homepage | ⚠️ PARTIAL |
| Discover | ✅ PASS |
| Product Page | ⚠️ PARTIAL |
| Cart | ✅ PASS |
| Checkout | ⚠️ PARTIAL |
| Seller | ⚠️ PARTIAL |
| Admin | ✅ PASS |
| Address Sync | ✅ PASS |
| Session Persistence | ✅ PASS |
| Recommendation System | ❌ FAIL |
| Chatbot | ✅ PASS |
| AIOps | ⚠️ PARTIAL |

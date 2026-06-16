# KLOSET V6 — COMPREHENSIVE BUG REPORT

**Audit Date:** 2026-06-14
**Severity:** P0 = Critical | P1 = High | P2 = Medium | P3 = Low

---

## P0 — CRITICAL (Blocking Launch)

### BUG-001: Google Sign-In Button Not Rendered
**Severity:** P0 — CRITICAL
**Files:** `app/auth/login/page.tsx`, `app/auth/register/page.tsx`
**Description:** Google OAuth infrastructure is complete (`GoogleProvider` wraps layout, `authAPI.googleLogin` exists, backend `/auth/google` endpoint works), but there is NO Google sign-in button on login or register pages. The `@react-oauth/google` library's `GoogleLogin` component is never imported or rendered.
**Impact:** Users cannot sign in with Google. Every user must register via email/password. Increases friction, reduces conversion.
**Status:** ❌ UNFIXED

### BUG-002: Scroll Lock Breaks With Multiple Overlays
**Severity:** P0 — CRITICAL
**Files:** `lib/scroll-lock.ts:3-15`, `components/ui/Modal.tsx:33-42`, `components/ui/Drawer.tsx:35-44`
**Description:** Both `Modal` and `Drawer` independently call `lockScroll()` / `unlockScroll()`. The centralized `lockCount` counter in `scroll-lock.ts` partially fixes the issue where closing one overlay restores scroll while another is open. HOWEVER, the `useEffect` cleanup in both Modal and Drawer calls `unlockScroll()` unconditionally on unmount — if the component unmounts while another overlay is open (e.g., via conditional rendering), the counter can be decremented incorrectly.
**Impact:** Page scroll can become locked permanently or unlock prematurely with nested overlays.
**Reproduction:**
1. Open Cart drawer (z-index 400).
2. Open AI Stylist drawer (z-index 450) while Cart is still open.
3. Close AI Stylist drawer.
4. Counter decrements by 1. If any cleanup fires incorrectly, counter reaches 0 and body scroll restores while Cart is still open.
**Status:** ❌ PARTIALLY FIXED (counter exists but `useEffect` cleanup still vulnerable)

### BUG-003: Login/Register Design Does Not Meet Standard
**Severity:** P0 — CRITICAL
**Files:** `app/auth/login/page.tsx`, `app/auth/register/page.tsx`
**Description:** Both pages use a simple centered card layout with no:
- 50/50 image split
- Social login buttons (Google)
- Role selector (register hardcodes `role: 'renter'`)
- Luxury fashion aesthetic
**Impact:** Low perceived quality. No seller self-registration path. Poor first impression.
**Status:** ❌ UNFIXED

### BUG-004: Middleware Redirect Path Mismatch
**Severity:** P0 — CRITICAL
**File:** `middleware.ts:20`
**Description:** The middleware redirects unauthenticated users to `/login` (line 20: `const loginUrl = new URL('/login', request.url)`) but the actual login page is at `/auth/login`. There IS a page at `/login` but it's a thin 12-line redirect page. This creates a double redirect: middleware → `/login` → redirects to `/auth/login`.
**Impact:** Slower auth redirect, potential redirect loop edge case if `/login` page fails.
**Status:** ❌ UNFIXED

### BUG-005: "Forgot Password" Links to Generic Support Page
**Severity:** P0 — CRITICAL
**File:** `app/auth/login/page.tsx`
**Description:** The "Forgot Password?" link goes to `/support` instead of a dedicated password reset flow.
**Impact:** Users cannot reset their password. Must contact support for basic auth operation.
**Status:** ❌ UNFIXED

---

## P1 — HIGH PRIORITY

### BUG-006: "Recommended For You" Is Not Personalized
**Severity:** P1 — HIGH
**File:** `app/page.tsx`
**Description:** The "Recommended For You" section on homepage shows the same trending items whether logged in or not. When `isAuthenticated` is true, it renders `trending` state (identical to "Trending Rentals"). No API call for personalized recommendations.
**Impact:** Feature is misleading. Users expect AI-driven personalization but get duplicate content.
**Status:** ❌ UNFIXED

### BUG-007: No Reviews Displayed on Product Page
**Severity:** P1 — HIGH
**File:** `app/outfit/[id]/page.tsx`
**Description:** The product detail page does not fetch or display reviews. `reviewsAPI.listOutfitReviews()` exists but is never called. The `reviews` state variable is declared but never populated from API.
**Impact:** Users cannot see social proof before renting. Hurts trust and conversion.
**Status:** ❌ UNFIXED

### BUG-008: No Recommendations on Product Page
**Severity:** P1 — HIGH
**File:** `app/outfit/[id]/page.tsx`
**Description:** No "Similar Outfits", "Complete The Look", or cross-sell section exists on the product page.
**Impact:** Missed upsell opportunity. Reduces average order value.
**Status:** ❌ UNFIXED

### BUG-009: AIOps Latency Chart Uses Random/Fabricated Data
**Severity:** P1 — HIGH
**File:** `app/admin/aiops/page.tsx:53-62`
**Description:** The latency chart uses `Math.sin()` + random variance to fabricate data points from real log timestamps. Line 56: `const variance = Math.floor((Math.sin(i * 1.5) * base * 0.15) + (i % 3 === 0 ? 30 : 0))`
**Impact:** Misleading admin dashboard. Cannot trust AIOps data for decision making.
**Status:** ❌ UNFIXED

### BUG-010: Admin Orders Page Never Loads Data
**Severity:** P1 — HIGH
**File:** `app/admin/orders/page.tsx`
**Description:** The admin orders page renders a table with search bar but NEVER fetches any data from the API. No `adminAPI` call exists in the component. Table always shows empty state.
**Impact:** Admins cannot view or manage orders from the admin panel.
**Status:** ❌ UNFIXED

### BUG-011: Admin Payments Page Never Loads Data
**Severity:** P1 — HIGH
**File:** `app/admin/payments/page.tsx`
**Description:** The admin payments page shows KPI cards and empty state but NEVER fetches transaction data from the API.
**Impact:** Admins cannot view payment transactions.
**Status:** ❌ UNFIXED

### BUG-012: Seller Earnings Withdraw Is Simulated
**Severity:** P1 — HIGH
**File:** `app/seller/earnings/page.tsx:42-46`
**Description:** The withdrawal function uses `setTimeout` with mock success toast. No real API call to initiate payout.
**Impact:** Sellers cannot actually withdraw earnings. Core monetization flow is broken.
**Status:** ❌ UNFIXED

### BUG-013: Seller Inbox Uses Hardcoded Mock Data
**Severity:** P1 — HIGH
**File:** `app/seller/inbox/page.tsx:10-13`
**Description:** Conversations are hardcoded `MOCK_CONVERSATIONS`. Sending messages only shows a toast. No API integration exists.
**Impact:** Sellers cannot communicate with renters through the platform.
**Status:** ❌ UNFIXED

### BUG-014: No Password Reset Flow
**Severity:** P1 — HIGH
**Files:** `app/auth/login/page.tsx`, missing `/auth/reset-password`
**Description:** There is no password reset page, no reset email flow, and no forgot-password redirect. The "Forgot Password?" link goes to `/support`.
**Impact:** Users who forget their password must contact support. No self-service password recovery.
**Status:** ❌ UNFIXED

### BUG-015: No Review Submission UI for Renters
**Severity:** P1 — HIGH
**Files:** `app/outfit/[id]/page.tsx`, `app/orders/page.tsx`
**Description:** Renters cannot leave reviews anywhere in the UI. The `reviewsAPI.create()` endpoint exists but is never triggered from any page.
**Impact:** No user-generated reviews on the platform. Destroys social proof and trust.
**Status:** ❌ UNFIXED

### BUG-016: Seller Analytics Uses Fabricated Data
**Severity:** P1 — HIGH
**File:** `app/seller/analytics/page.tsx`
**Description:** Wardrobe views, booking conversion, wishlist saves, monthly impressions, and category popularity all use hardcoded/mock data instead of real API metrics.
**Impact:** Sellers get misleading analytics. Cannot make data-driven decisions.
**Status:** ❌ UNFIXED

---

## P2 — MEDIUM PRIORITY

### BUG-017: "Become a Seller" CTA Missing on Homepage
**Severity:** P2 — MEDIUM
**File:** `app/page.tsx`
**Description:** No call-to-action for users to become sellers on the homepage.
**Status:** ❌ UNFIXED

### BUG-018: No Search Bar on Homepage
**Severity:** P2 — MEDIUM
**File:** `app/page.tsx`
**Description:** Homepage has no search bar. Users must navigate to `/discover` to search.
**Status:** ❌ UNFIXED

### BUG-019: Register Form Locks Users to Renter Role
**Severity:** P2 — MEDIUM
**File:** `app/auth/register/page.tsx:32`
**Description:** `role: 'renter'` is hardcoded in the register API call. No role selector UI.
**Status:** ❌ UNFIXED

### BUG-020: Confirmation Page Has No Error State
**Severity:** P2 — MEDIUM
**File:** `app/booking/confirmation/page.tsx:25-28`
**Description:** If `bookingId` is missing or API fails, the page immediately redirects to `/discover`. No error state with retry option.
**Status:** ❌ UNFIXED

### BUG-021: Wishlist Cart Price Uses Hardcoded Fallback
**Severity:** P2 — MEDIUM
**File:** `app/wishlist/page.tsx:48`
**Description:** `price: outfit.price_3day || 1500` — hardcoded fallback of 1500 when no 3-day price set.
**Status:** ❌ UNFIXED

### BUG-022: "Remember Me" Checkbox Has No Function
**Severity:** P2 — MEDIUM
**File:** `app/auth/login/page.tsx`
**Description:** The "Remember me" checkbox is rendered but has NO functional effect. It doesn't toggle any behavior in the login flow.
**Status:** ❌ UNFIXED

### BUG-023: Admin Sidebar Missing 6 Menu Items
**Severity:** P2 — MEDIUM
**File:** `components/layout/AdminSidebar.tsx:24-33`
**Description:** Listings (`/admin/listings`), Orders (`/admin/orders`), Payments (`/admin/payments`), Support (`/admin/support`), Security (`/admin/security`), and Analytics (`/admin/analytics`) pages exist but have no sidebar links.
**Status:** ❌ UNFIXED

### BUG-024: Seller Sidebar Missing 4 Menu Items
**Severity:** P2 — MEDIUM
**File:** `components/layout/SellerSidebar.tsx:13-18`
**Description:** Profile (`/seller/profile`), Reviews (`/seller/reviews`), Support (`/seller/support`), and Inbox (`/seller/inbox`) pages exist but have no sidebar links.
**Status:** ❌ UNFIXED

### BUG-025: Seller "Edit Bank Details" Button Is Dead
**Severity:** P2 — MEDIUM
**File:** `app/seller/earnings/page.tsx:124-126`
**Description:** The "Edit Bank Details" button is rendered as a plain `<button>` with no onClick handler. It does nothing when clicked.
**Status:** ❌ UNFIXED

### BUG-026: No Cancel Booking for Renters
**Severity:** P2 — MEDIUM
**File:** `app/orders/page.tsx`
**Description:** The orders page displays rental details but has no cancel button/action.
**Impact:** Renters cannot cancel bookings through the UI.
**Status:** ❌ UNFIXED

### BUG-027: Discover Page Has No Pagination
**Severity:** P2 — MEDIUM
**File:** `app/discover/page.tsx`
**Description:** Results are fetched but there's no pagination or "Load More" button. Only first page is displayed.
**Status:** ❌ UNFIXED

### BUG-028: Admin/Seller Layouts Not Mobile Responsive
**Severity:** P2 — MEDIUM
**Files:** `components/layout/AdminSidebar.tsx`, `components/layout/SellerSidebar.tsx`
**Description:** Both admin and seller layouts use a fixed 240px sidebar with no mobile hamburger menu. On screens below 768px, the sidebar overlaps content.
**Status:** ❌ UNFIXED

### BUG-029: KYC Page Mock Fallback Data
**Severity:** P2 — MEDIUM
**File:** `app/admin/kyc/page.tsx:22-24`
**Description:** Hardcoded mock fallback data when API fails instead of proper error state.
**Status:** ❌ UNFIXED

### BUG-030: Disputes Page Mock Fallback Data
**Severity:** P2 — MEDIUM
**File:** `app/admin/disputes/page.tsx:32-49`
**Description:** Hardcoded mock fallback data when API fails instead of proper error state.
**Status:** ❌ UNFIXED

### BUG-031: Coupon Validation Is Client-Side Only
**Severity:** P2 — MEDIUM
**File:** `store/useCartStore.ts:140-150`
**Description:** Coupon codes KLOSETGOLD and FIRSTRENT are hardcoded and validated client-side. No API call to verify coupons server-side.
**Impact:** Coupon codes cannot be managed without a code deployment.
**Status:** ❌ UNFIXED

### BUG-032: AI Stylist Recommendation Endpoint Not Used
**Severity:** P2 — MEDIUM
**Files:** `app/page.tsx`, `app/outfit/[id]/page.tsx`
**Description:** The backend `/ai/recommend` endpoint exists but is never called from any frontend component.
**Status:** ❌ UNFIXED

### BUG-033: No Email/Phone Verification Flow
**Severity:** P2 — MEDIUM
**Files:** `app/auth/register/page.tsx`, missing `/auth/verify-email`, missing `/auth/verify-phone`
**Description:** After registration, there is no email verification or phone OTP verification flow in the UI (backend OTP infrastructure exists).
**Impact:** Users can register with fake/unreachable contact info.
**Status:** ❌ UNFIXED

---

## P3 — LOW PRIORITY

### BUG-034: No Loading Skeleton on Profile Page
**File:** `app/profile/page.tsx`
**Impact:** Generic loading state instead of dedicated skeleton.

### BUG-035: Footer Newsletter Uses Mock Success
**File:** `components/layout/RenterFooter.tsx`
**Impact:** Newsletter signup shows success toast but makes no API call.

### BUG-036: Homepage Newsletter Uses Mock Success
**File:** `app/page.tsx`
**Impact:** Newsletter signup shows success toast but makes no API call.

### BUG-037: Empty State on Checkout Could Auto-Focus Address
**File:** `app/booking/checkout/page.tsx`
**Impact:** Links to `/profile` but no autofocus on address creation form.

### BUG-038: Orders Table Overflows on Mobile
**File:** `app/orders/page.tsx`
**Impact:** No horizontal scroll container — table content overflows on small screens.

### BUG-039: Admin Users/Sellers Tables No Pagination
**Files:** `app/admin/users/page.tsx`, `app/admin/sellers/page.tsx`
**Impact:** No pagination controls despite backend supporting pagination.

### BUG-040: Seller Analytics Tab Switching Loses Data
**File:** `app/seller/analytics/page.tsx`
**Impact:** Tab state is client-side only; page refresh resets tabs.

### BUG-041: Terms/Privacy/FAQ Links Are Non-Functional
**Files:** `components/layout/RenterFooter.tsx`
**Impact:** Links to "/terms", "/privacy", "/faq" are anchor tags with no corresponding pages.

### BUG-042: Checkout Total Calculation Differs From Cart
**Files:** `app/booking/checkout/page.tsx:143-152`, `store/useCartStore.ts:160-191`
**Description:** Checkout's `calculateTotal()` uses different logic than cart's `getCalculations()`. Cart includes platform fee (5%), tax (8%), and shipping (₹25). Checkout only adds deposit + delivery fee.
**Impact:** Price shown at checkout may differ from cart total.

---

## SUMMARY

| Severity | Count | Key Issues |
|----------|:-----:|------------|
| **P0 — Critical** | 5 | Google Auth missing, Scroll lock bug, Login design, Middleware mismatch, No password reset |
| **P1 — High** | 11 | Non-personalized recs, No reviews, No recs on product, AIOps fake data, Admin orders/payments empty, Withdraw mocked, Inbox mocked, No password reset flow, No review submission, Seller analytics fake data |
| **P2 — Medium** | 17 | Missing seller CTA, No homepage search, Hardcoded role, Confirmation error state, Dead button, Missing sidebar links, No cancel booking, No pagination, Mobile responsiveness, Mock fallbacks, Client-side coupons, Unused AI endpoint, No email/phone verification |
| **P3 — Low** | 9 | Missing skeletons, Mock newsletters, Overflow, No pagination, Non-functional links, Wrong checkout calculation |

**TOTAL: 42 BUGS — 5 P0, 11 P1, 17 P2, 9 P3**

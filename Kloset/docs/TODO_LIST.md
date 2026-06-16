# KLOSET V6 — LAUNCH-IMPACT PRIORITIZED TODO LIST

**Legend:** 🚨 P0 Critical | 🔥 P1 High | ⚡ P2 Medium | 📋 P3 Cosmetic

---

## 🚨 P0 — FIX IMMEDIATELY (Blocking Launch)

### [ ] 1. Add Google Sign-In Button to Login/Register
- **Files:** `app/auth/login/page.tsx`, `app/auth/register/page.tsx`
- **Fix:** Import `GoogleLogin` from `@react-oauth/google`, add to both pages below email forms, wire `onSuccess` → `authAPI.googleLogin()` → `useAuthStore.setAuth()`
- **Impact:** Unlocks social login. Reduces registration friction. Standard UX expectation.
- **BUG-001**

### [ ] 2. Fix Scroll Lock UseEffect Cleanup Vulnerability
- **Files:** `components/ui/Modal.tsx:33-42`, `components/ui/Drawer.tsx:35-44`, `lib/scroll-lock.ts`
- **Fix:** The centralized counter exists but `useEffect` cleanup in both components calls `unlockScroll()` unconditionally on unmount. Refactor to check if component is still the active overlay before decrementing. Or use a ref-based approach.
- **Impact:** Prevents scroll lock from breaking when overlays are nested or rapidly opened/closed.
- **BUG-002**

### [ ] 3. Redesign Login Page — 50/50 Split Layout
- **File:** `app/auth/login/page.tsx`
- **Fix:** Implement left image / right form split layout. Add luxury fashion hero image. Move form to right panel. Add Google sign-in. Make "Remember me" functional. Fix "Forgot Password" link.
- **Impact:** Modern UX standard. Increases conversion. Builds brand trust.
- **BUG-003**

### [ ] 4. Redesign Register Page — Add Role Selector
- **File:** `app/auth/register/page.tsx`
- **Fix:** Split layout. Add role selector toggle (Renter / Seller). Add Google sign-up. Ensure `role` payload is dynamic.
- **Impact:** Enables seller self-registration. Modern auth UX.
- **BUG-003, BUG-019**

### [ ] 5. Fix Middleware Redirect Path
- **File:** `middleware.ts:20`
- **Fix:** Change `new URL('/login', request.url)` to `new URL('/auth/login', request.url)`
- **Impact:** Eliminates double redirect, prevents potential redirect loop.
- **BUG-004**

### [ ] 6. Create Password Reset Flow
- **File:** `app/auth/login/page.tsx`, NEW: `app/auth/reset-password/page.tsx`
- **Fix:** Create dedicated password reset page at `/auth/reset-password`. Update "Forgot Password?" link from `/support` to `/auth/reset-password`. Wire to backend `auth/forgot-password` and `auth/reset-password` endpoints.
- **Impact:** Critical auth flow. Users cannot self-service password recovery.
- **BUG-005, BUG-014**

---

## 🔥 P1 — HIGH PRIORITY (Fix Before Launch)

### [ ] 7. Add Personalized Recommendations to Homepage
- **File:** `app/page.tsx`
- **Fix:** Create backend `/recommendations` endpoint (backend has `/ai/recommend` but it's not wired). Frontend: call personalized recs API for authenticated users instead of showing trending duplicates.
- **Impact:** Real personalization vs. duplicate content.
- **BUG-006**

### [ ] 8. Add Reviews Section to Product Page
- **File:** `app/outfit/[id]/page.tsx`
- **Fix:** Fetch via `reviewsAPI.listOutfitReviews()`. Display star ratings, comments, reviewer names. Add review submission form.
- **Impact:** Social proof drives conversion. Currently zero reviews visible.
- **BUG-007, BUG-015**

### [ ] 9. Add Recommendations Section to Product Page
- **File:** `app/outfit/[id]/page.tsx`
- **Fix:** Fetch similar outfits by category/city. Display 4-card horizontal rail ("You May Also Like").
- **Impact:** Cross-sell / upsell. Increases AOV.
- **BUG-008**

### [ ] 10. Fix AIOps Latency Chart — Use Real Data
- **File:** `app/admin/aiops/page.tsx:53-62`
- **Fix:** Replace `Math.sin()` + random variance with actual latency data from backend AIOps endpoint. If not available, show "No data" state instead of fabricated numbers.
- **Impact:** Admin trust in monitoring dashboards.
- **BUG-009**

### [ ] 11. Wire Admin Orders Page to API
- **File:** `app/admin/orders/page.tsx`
- **Fix:** Fetch orders via `adminAPI` (or `bookingsAPI`) and populate the table.
- **Impact:** Admins can currently see zero orders. Page is completely broken.
- **BUG-010**

### [ ] 12. Wire Admin Payments Page to API
- **File:** `app/admin/payments/page.tsx`
- **Fix:** Fetch transactions via `adminAPI.getTransactions()` and populate the table.
- **Impact:** Admins can currently see zero payments. Page is completely broken.
- **BUG-011**

### [ ] 13. Implement Real Withdrawal Flow for Sellers
- **File:** `app/seller/earnings/page.tsx:42-46`
- **Fix:** Replace `setTimeout` mock with real API call to backend withdrawal/payout endpoint.
- **Impact:** Sellers cannot actually withdraw money. Core monetization is broken.
- **BUG-012**

### [ ] 14. Build Real Seller Inbox
- **File:** `app/seller/inbox/page.tsx`
- **Fix:** Replace `MOCK_CONVERSATIONS` with real API integration. Create backend messaging endpoints or connect to existing notification system.
- **Impact:** Sellers cannot communicate with renters. Feature is fake.
- **BUG-013**

### [ ] 15. Replace Seller Analytics Mock Data
- **File:** `app/seller/analytics/page.tsx`
- **Fix:** Replace hardcoded impressions, views, and conversion data with real API metrics.
- **Impact:** Sellers get misleading analytics. Cannot make data-driven decisions.
- **BUG-016**

### [ ] 16. Add "Become a Seller" CTA to Homepage
- **File:** `app/page.tsx`
- **Fix:** Add section with "List Your Couture" button linking to register with seller preselected.
- **Impact:** Drives seller acquisition.
- **BUG-017**

### [ ] 17. Add Search Bar to Homepage
- **File:** `app/page.tsx`
- **Fix:** Search input in hero section or below nav → navigate to `/discover?q=<search>`.
- **Impact:** Primary navigation pattern missing from landing page.
- **BUG-018**

---

## ⚡ P2 — MEDIUM PRIORITY (Ship Soon After Launch)

### [ ] 18. Add Cancel Booking to Renter Orders Page
- **File:** `app/orders/page.tsx`
- **Impact:** Renters cannot cancel bookings through UI.
- **BUG-026**

### [ ] 19. Add Pagination to Discover Page
- **File:** `app/discover/page.tsx`
- **Impact:** Only first page of results shown.
- **BUG-027**

### [ ] 20. Make Admin/Seller Layouts Mobile Responsive
- **Files:** `components/layout/AdminSidebar.tsx`, `components/layout/SellerSidebar.tsx`
- **Impact:** Admin and seller dashboards unusable on mobile.
- **BUG-028**

### [ ] 21. Add All Missing Sidebar Links
- **Files:** `components/layout/AdminSidebar.tsx` (missing: Listings, Orders, Payments, Support, Security, Analytics), `components/layout/SellerSidebar.tsx` (missing: Profile, Reviews, Support, Inbox)
- **Impact:** Discoverability of existing pages.
- **BUG-023, BUG-024**

### [ ] 22. Implement Server-Side Coupon Validation
- **File:** `store/useCartStore.ts` + backend endpoint
- **Impact:** Coupons cannot be managed without code deployment. Security risk.
- **BUG-031**

### [ ] 23. Wire AI Recommendation Endpoint to Frontend
- **Files:** `app/page.tsx`, `app/outfit/[id]/page.tsx`
- **Impact:** Backend `/ai/recommend` endpoint exists but unused.
- **BUG-032**

### [ ] 24. Add Error State to Booking Confirmation
- **File:** `app/booking/confirmation/page.tsx`
- **Impact:** Silent redirect on error instead of showing retry UI.
- **BUG-020**

### [ ] 25. Fix "Edit Bank Details" Dead Button
- **File:** `app/seller/earnings/page.tsx:124-126`
- **Impact:** Button renders but does nothing.
- **BUG-025**

### [ ] 26. Add Email/Phone Verification Flow
- **Files:** Missing `/auth/verify-email`, `/auth/verify-phone`
- **Impact:** Users can register with fake contact info. Backend OTP infra exists but unused.
- **BUG-033**

### [ ] 27. Remove Mock Fallbacks on Admin KYC/Disputes
- **Files:** `app/admin/kyc/page.tsx`, `app/admin/disputes/page.tsx`
- **Impact:** Show proper error state instead of fake data when API fails.
- **BUG-029, BUG-030**

### [ ] 28. Fix "Remember Me" Checkbox to Be Functional
- **File:** `app/auth/login/page.tsx`
- **Impact:** Currently decorative only.
- **BUG-022**

### [ ] 29. Fix Wishlist Price Fallback
- **File:** `app/wishlist/page.tsx`
- **Impact:** Uses hardcoded 1500 fallback instead of best available price.
- **BUG-021**

### [ ] 30. Align Checkout Total With Cart Calculation
- **Files:** `app/booking/checkout/page.tsx`, `store/useCartStore.ts`
- **Impact:** Different pricing logic between cart and checkout.
- **BUG-042**

---

## 📋 P3 — COSMETIC / LOW PRIORITY (Post-Launch Polish)

### [ ] 31. Add Loading Skeleton to Profile Page
- **File:** `app/profile/page.tsx`

### [ ] 32. Fix Newsletter Mock Submissions
- **Files:** `components/layout/RenterFooter.tsx`, `app/page.tsx`

### [ ] 33. Add Horizontal Scroll to Orders Table on Mobile
- **File:** `app/orders/page.tsx`

### [ ] 34. Add Pagination to Admin Users/Sellers Tables
- **Files:** `app/admin/users/page.tsx`, `app/admin/sellers/page.tsx`

### [ ] 35. Add Address Auto-Focus From Checkout
- **File:** `app/booking/checkout/page.tsx`

### [ ] 36. Create Terms/Privacy/FAQ Pages
- **File:** `components/layout/RenterFooter.tsx`

### [ ] 37. Add "Recently Viewed" Feature
- **Storage:** localStorage
- **Display:** Homepage or discover page

### [ ] 38. Add "Complete The Look" Section
- **Display:** Product page sidebar

### [ ] 39. Add "More From Seller" Section
- **Display:** Product page below details

### [ ] 40. Improve Image Gallery UX
- **File:** `app/outfit/[id]/page.tsx`
- **Fix:** Add pinch-zoom, fullscreen mode, swipe gestures

---

## SUMMARY BY IMPACT

| Rank | Issue | Impact | Effort |
|:----:|-------|--------|:------:|
| 1 | Google Sign-In | Unlocks social login, major conversion driver | Low |
| 2 | Scroll Lock Fix | Prevents broken UX with overlays | Low |
| 3 | Login/Register Redesign | Modern UX, enables seller signup | Medium |
| 4 | Middleware Redirect Fix | Prevents potential redirect loop | Trivial |
| 5 | Password Reset Flow | Critical auth flow | Medium |
| 6 | Personalized Recommendations | Real personalization vs fake | Medium |
| 7 | Reviews on Product Page | Social proof, trust, conversion | Medium |
| 8 | Recommendations on Product | Cross-sell, higher AOV | Medium |
| 9 | Admin Orders/Payments Data | Pages are completely broken | Low |
| 10 | Seller Withdrawal Flow | Core monetization broken | Medium |
| 11 | Seller Inbox | Fake feature, needs real API | High |
| 12 | Seller Analytics | Misleading data | Medium |
| 13 | Homepage Search + Seller CTA | Primary UX patterns missing | Low |

---

## LEGEND

| Priority | Count | Description |
|:---------:|:-----:|-------------|
| 🚨 P0 | 6 | Blocking launch — fix NOW |
| 🔥 P1 | 11 | Must fix before go-live |
| ⚡ P2 | 13 | Ship soon after launch |
| 📋 P3 | 10 | Post-launch polish |
| **TOTAL** | **40** | |

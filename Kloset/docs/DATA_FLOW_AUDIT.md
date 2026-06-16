# KLOSET V6 — DATA FLOW & CONSISTENCY AUDIT

**Audit Date:** 2026-06-14
**Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## 1. ADDRESS DATA FLOW

### Source of Truth

| Source | Location | Mechanism | Status |
|--------|----------|-----------|--------|
| Backend API | `PUT /users/addresses` + `GET /users/addresses` | PostgreSQL `user_addresses` table | ✅ |
| Frontend API | `userAPI.addAddress()`, `userAPI.getAddresses()` | Axios client → Backend | ✅ |
| Profile Page | `app/profile/page.tsx` | Fetches via `userAPI.getAddresses()` | ✅ |
| Checkout | `app/booking/checkout/page.tsx` | Fetches via `userAPI.getAddresses()` | ✅ |
| Orders | `app/orders/page.tsx` | Address in booking object via `bookingsAPI` | ✅ |

### Consistency Check

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| Profile Add → Checkout sees it | Address appears in checkout | ✅ Same API endpoint | ✅ PASS |
| Checkout uses correct address | Booking stores delivery_address_id | ✅ Sent in booking payload | ✅ PASS |
| Orders display the address | Address visible in order details | ✅ Shown in booking details | ✅ PASS |
| Profile Delete → Checkout removes it | Address disappears | ✅ Same source of truth | ✅ PASS |
| Default address in checkout | Pre-selected default | ✅ `is_default` flag checked | ✅ PASS |

**Verdict: ✅ PASS — Address data is consistent end-to-end**

---

## 2. AUTH DATA FLOW

### Token Flow

| Step | Data | Storage | Verified |
|------|------|---------|----------|
| Login/Register | JWT access + refresh tokens | `localStorage` + cookies | ✅ |
| `client.interceptors.request` | Attach `Bearer` token to every request | Read from `localStorage` | ✅ |
| 401 Response | Attempt token refresh | `POST /auth/refresh` | ✅ |
| Refresh success | New tokens stored | localStorage updated | ✅ |
| Refresh fails | Clear all, redirect to login | localStorage + cookie cleared | ✅ |
| `middleware.ts` | Check cookie for protected routes | `kloset-auth` cookie | ✅ |
| `initializeAuth()` | Verify token on app mount | `GET /auth/me` | ✅ |

### Consistency Check

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| `middleware.ts` redirect path | Redirect to `/auth/login` | Redirects to `/login` | ❌ FAIL — redirect path mismatch |
| Protected route after refresh | Stay on page if valid token | ✅ Cookie + localStorage both checked | ✅ PASS |
| Logout from admin clears all | No session leakage | ✅ All storage cleared | ✅ PASS |
| Logout from seller clears all | No session leakage | ✅ All storage cleared | ✅ PASS |
| Logout from renter clears all | No session leakage | ✅ All storage cleared | ✅ PASS |

**Verdict: ⚠️ PARTIAL — Middleware redirects to `/login` but login page exists at both `/login` (redirect) and `/auth/login` (full page)**

---

## 3. CART DATA FLOW

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| Add to cart → persists on refresh | Items remain | ✅ `zustand/persist` with `kloset-cart-storage` | ✅ PASS |
| Cart → Checkout items | Items accessible in checkout | ✅ `useCartStore` available | ✅ PASS |
| Checkout creates booking | Booking references outfit_id | ✅ Passes outfit data | ✅ PASS |
| Clear cart after order | Cart emptied | ✅ `clearCart()` called after payment | ✅ PASS |
| `isOpen` state persists incorrectly | Should not persist | ✅ `partialize` excludes `isOpen` | ✅ PASS |

**Verdict: ✅ PASS**

---

## 4. WISHLIST DATA FLOW

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| Toggle wishlist → API sync | Backend and frontend in sync | ✅ API call + store update | ✅ PASS |
| Wishlist page → Re-fetches | Fresh data from API | ✅ `getWishlist()` API call | ✅ PASS |
| Product page → Shows wishlisted state | Heart filled if wishlisted | ✅ `isWishlisted()` check | ✅ PASS |
| Wishlist persists across sessions | Server-side storage | ✅ Backend `wishlists` table | ✅ PASS |

**Verdict: ✅ PASS**

---

## 5. BOOKING / PAYMENT DATA FLOW

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| `POST /bookings` creates booking | Booking in DB with status=`pending` | ✅ Backend creates + returns razorpay_order_id | ✅ PASS |
| Razorpay order created | razorpay_order_id returned | ✅ Backend creates via Razorpay API | ✅ PASS |
| Payment verified | booking status → `confirmed` | ✅ `paymentsAPI.verify()` called | ✅ PASS |
| Payment failed | booking stays `pending` | ✅ Error toast shown | ✅ PASS |
| Payment cancelled | booking stays `pending` + redirect with `?pending=true` | ✅ Redirects correctly | ✅ PASS |
| Confirmation page loads booking | Booking details shown | ✅ `bookingsAPI.getById()` called | ✅ PASS |

**Verdict: ✅ PASS — Full payment data flow is wired end-to-end**

---

## 6. SELLER DATA FLOW

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| Create listing → visible in seller list | Listing appears | ✅ `getSellerOutfits()` fetches | ✅ PASS |
| Create listing → visible in browse | Listing appears in `/discover` | ✅ Backend handles status filter | ⚠️ Only if status='active' |
| Edit listing → changes reflect | Updated data fetched | ✅ `update()` + re-fetch | ✅ PASS |
| Delete listing → removed from list | Soft delete | ✅ `delete()` removes | ✅ PASS |
| Submit approval → admin queue | Status = pending_approval | ✅ `submitForApproval()` | ✅ PASS |
| Admin approves → listing active | Status = active | ✅ Backend handles | ✅ PASS |

**Verdict: ✅ PASS**

---

## 7. SELLER EARNINGS DATA FLOW

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| Wallet balance | From `user.wallet_balance` | ✅ Displayed from user object | ✅ PASS |
| Earnings history | From `bookingsAPI.listSellerBookings()` | ✅ Filtered completed/returned | ✅ PASS |
| Withdrawal | Real API call | ❌ `setTimeout` mock — no real withdrawal | ❌ FAIL |
| Bank details | From user profile | ❌ Hardcoded mock bank details displayed | ❌ FAIL |

**Verdict: ❌ FAIL — Earnings withdrawal and bank details are entirely mocked**

---

## 8. ADMIN DATA FLOW

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| Dashboard stats | From `adminAPI.getStats()` | ✅ Real API data | ✅ PASS |
| User list | From `adminAPI.getUsers()` | ✅ Real API data | ✅ PASS |
| Seller list | From `adminAPI.getSellers()` | ✅ Real API data | ✅ PASS |
| Transactions | From `adminAPI.getTransactions()` | ✅ Real API data | ✅ PASS |
| KYC queue | From `adminAPI.getKYCQueue()` | ✅ Real API data (fallback mock) | ⚠️ PARTIAL |
| Disputes | From `adminAPI.getDisputes()` | ✅ Real API data (fallback mock) | ⚠️ PARTIAL |
| Orders | **NEVER FETCHED** | ❌ No API call in admin orders page | ❌ FAIL |
| Payments | **NEVER FETCHED** | ❌ No API call in admin payments page | ❌ FAIL |
| Settings | From `adminAPI.getSettings()` | ✅ Real API data | ✅ PASS |
| AIOps | From `adminAPI.getAIOps()` | ✅ Real API data (latency chart is fabricated) | ⚠️ PARTIAL |
| Analytics | From `adminAPI.getRevenueData()` | ✅ Real API data | ✅ PASS |

**Verdict: ⚠️ PARTIAL — Admin orders and payments pages never fetch data. KYC/Disputes have mock fallbacks.**

---

## 9. AI / GEMINI DATA FLOW

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| AI Chat sends message | Sends `POST /ai/chat` with history | ✅ Real API request | ✅ PASS |
| AI Chat receives response | Parses `data.reply` | ✅ Processes response | ✅ PASS |
| AI Chat fallback | When API fails, keyword rules | ✅ Local fallback triggers | ✅ PASS |
| AI Recommendations | `POST /ai/recommend` | Not called from frontend anywhere | ❌ FAIL |
| AI Description | `POST /ai/describe` | Not called from seller listing UI | ❌ FAIL |

**Verdict: ⚠️ PARTIAL — AI chat works, but recommendation and description endpoints are not used in the UI**

---

## 10. COUPON DATA FLOW

| Check | Expected | Actual | Verdict |
|-------|----------|--------|---------|
| Apply coupon KLOSETGOLD | 15% discount | ✅ Local validation (hardcoded codes) | ⚠️ No server-side validation |
| Apply coupon FIRSTRENT | 10% discount | ✅ Local validation | ⚠️ No server-side validation |
| Apply unknown coupon | Error displayed | ✅ "Invalid coupon" shown | ✅ PASS |
| Remove coupon | Discount cleared | ✅ Cleared from store | ✅ PASS |

**Verdict: ⚠️ PARTIAL — Coupon validation is client-side only; no API endpoint exists**

---

## DATA FLOW SUMMARY

| Area | Verdict |
|------|---------|
| Address Data Flow | ✅ PASS |
| Auth Data Flow | ⚠️ PARTIAL |
| Cart Data Flow | ✅ PASS |
| Wishlist Data Flow | ✅ PASS |
| Booking/Payment Data Flow | ✅ PASS |
| Seller Data Flow | ✅ PASS |
| Seller Earnings Data Flow | ❌ FAIL |
| Admin Data Flow | ⚠️ PARTIAL |
| AI/Gemini Data Flow | ⚠️ PARTIAL |
| Coupon Data Flow | ⚠️ PARTIAL |

**GLOBAL DATA FLOW VERDICT: ⚠️ PARTIAL — 6 PASS, 1 FAIL, 3 PARTIAL**

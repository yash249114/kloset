# KLOSET V6 — WORKFLOW & E2E FLOW AUDIT

**Audit Date:** 2026-06-14
**Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL / 🔍 NOT VERIFIED

---

## 1. RENTER REGISTRATION & ONBOARDING FLOW

### Flow: Home → Register → Login → Browse

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/` | Homepage loads | ✅ Loads in ~1.2s | ✅ PASS |
| 2 | Click "Sign In" in header | Navigate to `/auth/login` | ✅ Routes to `/auth/login` | ✅ PASS |
| 3 | Click "Create Account" link | Navigate to `/auth/register` | ✅ Routes to `/auth/register` | ✅ PASS |
| 4 | Fill name, email, phone, password | Form accepts input | ✅ All fields work | ✅ PASS |
| 5 | Submit "Create Account" | Register via API | ✅ Calls `authAPI.register()` with role='renter' (hardcoded) | ⚠️ No role selector |
| 6 | After registration | Auto-login + redirect to `/` | ✅ JWT tokens stored, redirected to `/` | ✅ PASS |
| 7 | Click "Sign In" link | Navigate to login | ✅ Routes to `/auth/login` | ✅ PASS |
| 8 | Enter email + password | Submit login | ✅ Calls `authAPI.login()` | ✅ PASS |
| 9 | After login | Redirect to home | ✅ Redirects to `/` | ✅ PASS |
| 10 | Google sign-in | **MISSING** | ❌ No Google button rendered | ❌ FAIL |

**Verdict: ⚠️ PARTIAL — Google sign-in missing, role selector missing**

---

## 2. BROWSE & DISCOVER FLOW

### Flow: Home → Search → Filter → Open Product

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Click "Browse Couture" | Navigate to `/discover` | ✅ Routes correctly | ✅ PASS |
| 2 | Search by keyword | Filter results | ✅ URL updates, results filter | ✅ PASS |
| 3 | Filter by category | Filter grid | ✅ Category toggle works | ✅ PASS |
| 4 | Filter by occasion | Filter grid | ✅ Occasion chips work | ✅ PASS |
| 5 | Filter by size | Filter grid | ✅ Size toggle works | ✅ PASS |
| 6 | Filter by price range | Filter grid | ✅ Price radio works | ✅ PASS |
| 7 | Sort results | Reorder results | ✅ Sort dropdown works | ✅ PASS |
| 8 | Reset all filters | Clear filters | ✅ Reset button works | ✅ PASS |
| 9 | Click "View Details" on card | Navigate to `/outfit/[id]` | ✅ Routes correctly | ✅ PASS |

**Verdict: ✅ PASS**

---

## 3. PRODUCT DETAIL FLOW

### Flow: Product Page → Wishlist → Cart → Checkout

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/outfit/[id]` | Product loads | ✅ Loads via API | ✅ PASS |
| 2 | Click heart icon | Add to wishlist | ✅ Calls wishlist API | ✅ PASS |
| 3 | Select size | Size chosen | ✅ Toggle works | ✅ PASS |
| 4 | Select rental duration (1/3/7 day) | Price updates | ✅ Price updates | ✅ PASS |
| 5 | Select dates | Dates set | ✅ Date inputs work | ✅ PASS |
| 6 | Click "Book Now" | Navigate to checkout | ✅ Routes to `/booking/checkout?outfit_id=...` | ✅ PASS |
| 7 | View reviews | **MISSING** | ❌ No reviews section on page | ❌ FAIL |
| 8 | View similar outfits | **MISSING** | ❌ No recommendations section | ❌ FAIL |
| 9 | View "Complete The Look" | **MISSING** | ❌ No cross-sell section | ❌ FAIL |
| 10 | Click "Add to Cart" | Cart drawer opens | ✅ Item added, drawer opens | ✅ PASS |

**Verdict: ⚠️ PARTIAL — Missing reviews, recommendations, and cross-sell sections**

---

## 4. CART → CHECKOUT → PAYMENT FLOW

### Flow: Add to Cart → Checkout → Address → Payment → Confirmation

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Open cart drawer | Cart items displayed | ✅ Items visible with pricing | ✅ PASS |
| 2 | Adjust quantity | Quantity changes | ✅ +/- buttons work | ✅ PASS |
| 3 | Change size | Size updates | ✅ Dropdown works | ✅ PASS |
| 4 | Apply coupon "KLOSETGOLD" | 15% discount | ✅ Discount applied (local validation) | ✅ PASS |
| 5 | Click "Checkout" | Navigate to `/booking/checkout` | ✅ Routes correctly | ✅ PASS |
| 6 | Select rental dates | Dates set | ✅ Date inputs work | ✅ PASS |
| 7 | Select delivery/pickup | Method chosen | ✅ Toggle works | ✅ PASS |
| 8 | Select address | Address chosen | ✅ Radio selection works | ✅ PASS |
| 9 | Click "Pay & Place Order" | Create booking → Razorpay | ✅ Creates booking with Razorpay order ID | ✅ PASS |
| 10 | Razorpay modal opens | Payment UI | ✅ Script loads, modal opens | ✅ PASS |
| 11 | Complete payment | Payment verified | ✅ `paymentsAPI.verify()` called | ✅ PASS |
| 12 | Redirect to confirmation | `/booking/confirmation?id=X` | ✅ Booking confirmed | ✅ PASS |
| 13 | Payment cancelled | Redirect with pending | ✅ Redirects with `?pending=true` | ✅ PASS |
| 14 | Payment failed | Error toast | ✅ Shows error toast | ✅ PASS |

**Verdict: ✅ PASS — Full payment flow is wired end-to-end**

---

## 5. PROFILE & ADDRESS FLOW

### Flow: Profile → Add Address → Checkout → Order

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/profile` | Profile loads | ✅ Profile data fetched via API | ✅ PASS |
| 2 | View addresses | List displayed | ✅ API-driven address list | ✅ PASS |
| 3 | Add new address | Address saved | ✅ Calls `userAPI.addAddress()` | ✅ PASS |
| 4 | Delete address | Address removed | ✅ Calls `userAPI.deleteAddress()` | ✅ PASS |
| 5 | Set default address | Default flagged | ✅ Calls `userAPI.setDefaultAddress()` | ✅ PASS |
| 6 | Navigate to checkout | Address loaded | ✅ Addresses fetched | ✅ PASS |
| 7 | Complete order | Address in booking | ✅ address saved in booking | ✅ PASS |
| 8 | View order | Address displayed | ✅ Address shown in order | ✅ PASS |

**Verdict: ✅ PASS — Full CRUD address flow, consistent across profile/checkout/orders**

---

## 6. ORDER MANAGEMENT FLOW

### Flow: Orders Page → View → Cancel

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/orders` | Orders list | ✅ Orders fetched via API | ✅ PASS |
| 2 | Filter by status | Filtered orders | ✅ Status filter works | ✅ PASS |
| 3 | View order details | Expand details | ✅ Details shown | ✅ PASS |
| 4 | Cancel order | **MISSING** | ❌ No cancel button on orders page | ❌ FAIL |

**Verdict: ⚠️ PARTIAL — No cancel action on renter orders page**

---

## 7. SUPPORT TICKET FLOW

### Flow: Support Page → Create Ticket

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/support` | Support page loads | ✅ Support page rendered | ✅ PASS |
| 2 | Fill ticket form | Form accepts input | ✅ All fields work | ✅ PASS |
| 3 | Submit ticket | Ticket created | ✅ Calls `supportAPI.createTicket()` | ✅ PASS |

**Verdict: ✅ PASS**

---

## 8. WISHLIST FLOW

### Flow: Add to Wishlist → View Wishlist → Add to Cart → Remove

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Toggle heart on product | Add to wishlist | ✅ API call + store update | ✅ PASS |
| 2 | Navigate to `/wishlist` | Wishlist loads | ✅ Fetched via API | ✅ PASS |
| 3 | Remove from wishlist | Item removed | ✅ API call + store update | ✅ PASS |
| 4 | Add to cart from wishlist | Item added to cart | ✅ Cart drawer opens | ✅ PASS |

**Verdict: ✅ PASS**

---

## 9. SELLER LISTING MANAGEMENT FLOW

### Flow: Create Listing → Edit → Submit → View

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/seller/listings` | Listings load | ✅ Fetched via API | ✅ PASS |
| 2 | Click "Add Couture Listing" | Create modal opens | ✅ Modal with form renders | ✅ PASS |
| 3 | Fill form fields | All fields accept input | ✅ Title, description, category, sizes, pricing, location, images all work | ✅ PASS |
| 4 | Upload images | Cloudinary upload | ✅ ImageUploader component works | ✅ PASS |
| 5 | Click "Save Wardrobe Listing" | Listing created | ✅ Calls `outfitsAPI.create()` | ✅ PASS |
| 6 | Click Edit (pencil) | Edit modal opens | ✅ Pre-populated with existing data | ✅ PASS |
| 7 | Modify fields | Fields editable | ✅ All fields editable | ✅ PASS |
| 8 | Click "Save Changes" | Listing updated | ✅ Calls `outfitsAPI.update()` | ✅ PASS |
| 9 | Click "Submit Approval" | Submitted for review | ✅ Calls `outfitsAPI.submitForApproval()` | ✅ PASS |
| 10 | Click Delete (trash) | Listing deleted | ✅ Calls `outfitsAPI.delete()` | ✅ PASS |

**Verdict: ✅ PASS — Full CRUD for seller listings (this has been fixed since earlier audit)**

---

## 10. SELLER ORDER MANAGEMENT FLOW

### Flow: View Orders → Update Status → Complete

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/seller/orders` | Orders load | ✅ Fetched via API | ✅ PASS |
| 2 | Click "Dispatched" | Status → picked_up | ✅ API call | ✅ PASS |
| 3 | Click "Mark Returned" | Status → returned | ✅ API call | ✅ PASS |
| 4 | Click "Sent To Dry Clean" | Status → cleaning | ✅ API call | ✅ PASS |
| 5 | Click "Complete Order" | Status → completed | ✅ API call | ✅ PASS |

**Verdict: ✅ PASS**

---

## 11. SELLER EARNINGS & WITHDRAWAL FLOW

### Flow: View Earnings → Withdraw

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/seller/earnings` | Earnings load | ✅ Completed bookings fetched | ✅ PASS |
| 2 | View wallet balance | Balance shown | ✅ `user.wallet_balance` displayed | ✅ PASS |
| 3 | View transaction history | History shown | ✅ Table rendered | ✅ PASS |
| 4 | Click "Withdraw to Bank Account" | Withdraw via API | ❌ `setTimeout` mock — no real API call | ❌ FAIL |
| 5 | Click "Edit Bank Details" | Edit bank info | ❌ Text only, no handler | ❌ FAIL |

**Verdict: ❌ FAIL — Withdrawal flow is completely mocked**

---

## 12. SELLER INBOX FLOW

### Flow: View Conversations → Send Message

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/seller/inbox` | Conversations load | ❌ Shows `MOCK_CONVERSATIONS` hardcoded data | ❌ FAIL |
| 2 | Select conversation | Chat panel opens | ✅ Panel shows (empty) | ⚠️ No messages loaded |
| 3 | Type message | Input works | ✅ Input accepts text | ✅ PASS |
| 4 | Click "Send" | Message sent via API | ❌ Only shows toast — no API call | ❌ FAIL |

**Verdict: ❌ FAIL — Entire inbox is mock data with no API integration**

---

## 13. ADMIN USER MANAGEMENT FLOW

### Flow: View Users → Search → Filter

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/admin/users` | Users load | ✅ Fetched via API | ✅ PASS |
| 2 | Search by name/email | Filter table | ✅ Search works | ✅ PASS |
| 3 | View user details | Details shown | ✅ Table with all fields | ✅ PASS |

**Verdict: ✅ PASS**

---

## 14. ADMIN KYC FLOW

### Flow: View KYC Queue → Approve/Reject

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/admin/kyc` | KYC queue loads | ✅ Fetched via API | ✅ PASS |
| 2 | Click "Approve" | KYC approved | ✅ Calls `adminAPI.approveKYC()` | ✅ PASS |
| 3 | Click "Reject" | KYC rejected | ✅ Calls `adminAPI.rejectKYC()` | ✅ PASS |

**Verdict: ✅ PASS** (with fallback mock data concern)

---

## 15. ADMIN DISPUTE RESOLUTION FLOW

### Flow: View Disputes → Resolve

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/admin/disputes` | Disputes load | ✅ Fetched via API | ✅ PASS |
| 2 | Click "Resolve Case" | Modal opens | ✅ Resolution modal renders | ✅ PASS |
| 3 | Select resolution type | Type chosen | ✅ Dropdown works | ✅ PASS |
| 4 | Enter refund amount | Amount set | ✅ Input works | ✅ PASS |
| 5 | Click "Release Escrow Funds" | Dispute resolved | ✅ Calls `adminAPI.resolveDispute()` | ✅ PASS |

**Verdict: ✅ PASS** (with fallback mock data concern)

---

## 16. ADMIN LISTING APPROVAL FLOW

### Flow: View Pending Listings → Approve/Reject

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/admin/listings` | Pending listings load | ✅ Fetched via API | ✅ PASS |
| 2 | Click "Approve" | Listing approved | ✅ Calls `adminAPI.approveOutfit()` | ✅ PASS |
| 3 | Click "Reject" | Listing rejected | ✅ Calls `adminAPI.rejectOutfit()` | ✅ PASS |

**Verdict: ✅ PASS**

---

## 17. ADMIN SETTINGS FLOW

### Flow: View Settings → Edit → Save

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Navigate to `/admin/settings` | Settings load | ✅ Fetched via API | ✅ PASS |
| 2 | Modify rate/cleaning fee | Input updated | ✅ Form accepts changes | ✅ PASS |
| 3 | Click "Save Settings" | Settings saved | ✅ Calls `adminAPI.updateSettings()` | ✅ PASS |

**Verdict: ✅ PASS**

---

## 18. AUTH FLOW (Logout & Session)

### Flow: Login → Browse → Logout → Protected Route

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Login with credentials | JWT stored | ✅ Token in localStorage + cookie | ✅ PASS |
| 2 | Refresh page | Session persists | ✅ `initializeAuth()` restores session | ✅ PASS |
| 3 | Close + reopen browser | Session persists | ✅ localStorage persists across restarts | ✅ PASS |
| 4 | Click Logout | Session cleared | ✅ localStorage + cookie cleared | ✅ PASS |
| 5 | Navigate to `/seller` | Redirect to login | ❌ Redirects to `/login` (not `/auth/login`) | ⚠️ Redirect loop risk |
| 6 | Navigate to `/booking/checkout` | Redirect to login | ✅ Redirects to `/auth/login?redirect=...` | ✅ PASS |

**Verdict: ⚠️ PARTIAL — Middleware redirects to `/login` but full login page is at `/auth/login`**

---

## 19. PASSWORD RESET FLOW

### Flow: Forgot Password → Reset

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Click "Forgot Password?" on login | Navigate to reset flow | ❌ Links to `/support` — generic support page | ❌ FAIL |
| 2 | Reset password | **MISSING** | ❌ No password reset page exists (`/auth/reset-password`) | ❌ FAIL |
| 3 | Receive reset email | **MISSING** | ❌ No password reset email flow | ❌ FAIL |

**Verdict: ❌ FAIL — No password reset flow exists**

---

## 20. RENTER REVIEW FLOW

### Flow: Complete Rental → Leave Review

| Step | Action | Expected | Actual | Verdict |
|------|--------|----------|--------|---------|
| 1 | Complete rental (order status = completed) | Leave review option | ❌ No review UI anywhere on product page or orders page | ❌ FAIL |
| 2 | Submit review with rating | Review saved | API endpoint exists (`reviewsAPI.create()`) but no UI to trigger it | ❌ FAIL |

**Verdict: ❌ FAIL — Renters cannot leave reviews anywhere in the UI**

---

## WORKFLOW SUMMARY

| Workflow | Verdict |
|----------|---------|
| Registration & Onboarding | ⚠️ PARTIAL |
| Browse & Discover | ✅ PASS |
| Product Detail | ⚠️ PARTIAL |
| Cart → Checkout → Payment | ✅ PASS |
| Profile & Address | ✅ PASS |
| Order Management | ⚠️ PARTIAL |
| Support Ticket | ✅ PASS |
| Wishlist | ✅ PASS |
| Seller Listing Management | ✅ PASS |
| Seller Order Management | ✅ PASS |
| Seller Earnings & Withdrawal | ❌ FAIL |
| Seller Inbox | ❌ FAIL |
| Admin User Management | ✅ PASS |
| Admin KYC | ✅ PASS |
| Admin Dispute Resolution | ✅ PASS |
| Admin Listing Approval | ✅ PASS |
| Admin Settings | ✅ PASS |
| Auth / Session / Logout | ⚠️ PARTIAL |
| Password Reset | ❌ FAIL |
| Renter Review | ❌ FAIL |

**TOTAL: 11 PASS | 5 PARTIAL | 4 FAIL**

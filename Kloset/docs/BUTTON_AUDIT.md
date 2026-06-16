# KLOSET V6 — BUTTON VISIBILITY & FUNCTIONALITY AUDIT

**Status:** ✅ VISIBLE & CLICKABLE | ❌ MISSING | ⚠️ VISIBLE BUT ISSUE

---

## 1. HOMEPAGE (`app/page.tsx`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| "Browse Couture" | Hero section | Visible, clickable | Navigate to `/discover` | ✅ Routes to `/discover` | ✅ PASS |
| "Consult AI Stylist" | Hero section | Visible, clickable | Open AI drawer | ✅ Opens AI Stylist drawer | ✅ PASS |
| "Quick View" | Trending card hover | Hidden until hover | Navigate to `/outfit/[id]` | ✅ Routes correctly | ✅ PASS |
| "See All" | Trending header | Visible, clickable | Navigate to `/discover?sort=popular` | ✅ Routes correctly | ✅ PASS |
| "Explore Collection" | Wedding Atelier | Visible, clickable | Navigate to `/discover?occasion=wedding` | ✅ Routes correctly | ✅ PASS |
| "View Outfits" | Sherwani card | Visible, clickable | Navigate to `/discover?category=sherwani` | ✅ Routes correctly | ✅ PASS |
| "View Outfits" | Saree card | Visible, clickable | Navigate to `/discover?category=saree` | ✅ Routes correctly | ✅ PASS |
| "Book Outfit" | Occasion card hover | Hidden until hover | Navigate to checkout | ✅ Routes correctly | ✅ PASS |
| "Inspect" | Recently Added hover | Hidden until hover | Navigate to `/outfit/[id]` | ✅ Routes correctly | ✅ PASS |
| "Open AI Stylist" | AI teaser section | Visible, clickable | Open AI drawer | ✅ Opens AI drawer | ✅ PASS |
| "Login & Unlock" | Recommendations gate | Visible, clickable | Navigate to `/auth/login?redirect=/` | ✅ Routes correctly | ✅ PASS |
| "Join the Circle" | Newsletter form | Visible, clickable | Show success toast | ✅ Shows toast (mock) | ⚠️ Mock only |
| "Become a Seller" CTA | **MISSING** | ❌ | Navigate to register flow | No button anywhere on homepage | ❌ FAIL |

---

## 2. DISCOVER (`app/discover/page.tsx`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| Category filters (9) | Sidebar | Visible | Filter results | ✅ Filters update URL + results | ✅ PASS |
| Occasion filters (6) | Sidebar | Visible | Filter results | ✅ Filters update URL + results | ✅ PASS |
| Size filters (6) | Sidebar | Visible | Filter by size | ✅ Toggle buttons work | ✅ PASS |
| Price range (4) | Sidebar | Visible | Filter by price | ✅ Radio toggle works | ✅ PASS |
| "Reset Filters" | Sidebar | Visible | Clear all filters | ✅ Clears filters | ✅ PASS |
| "Filter Options" | Mobile trigger | Visible on mobile | Open mobile drawer | ✅ Opens filter drawer | ✅ PASS |
| "View Details" | Card hover | Hidden until hover | Navigate to `/outfit/[id]` | ✅ Routes correctly | ✅ PASS |
| "Reset Search Filters" | Empty state | Visible when empty | Reset to show all | ✅ Resets filters | ✅ PASS |
| Sort dropdown | Top of results | Visible | Sort results | ✅ Changes sort order | ✅ PASS |

---

## 3. PRODUCT PAGE (`app/outfit/[id]/page.tsx`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| "Back to Catalog" | Top | Visible | Navigate to `/discover` | ✅ Routes correctly | ✅ PASS |
| Heart/Wishlist | Image overlay | Visible | Toggle wishlist | ✅ Adds/removes from wishlist | ✅ PASS |
| Review button | **MISSING** | ❌ | Show review form/modal | No review UI exists anywhere on page | ❌ FAIL |
| Similar Items section | **MISSING** | ❌ | Show recommendations | No recommendations section | ❌ FAIL |
| "Complete The Look" | **MISSING** | ❌ | Show cross-sell items | Not implemented | ❌ FAIL |
| 1/3/7 Day toggle | Rental section | Visible | Select duration | ✅ Updates price display | ✅ PASS |
| Size selector | Size section | Visible | Select size | ✅ Toggle buttons work | ✅ PASS |
| "Book Now" | CTA section | Visible | Navigate to checkout | ✅ Routes to `/booking/checkout?outfit_id=...` | ✅ PASS |
| "Add to Cart" | CTA section | Visible | Add to cart | ✅ Opens cart drawer | ✅ PASS |
| Image thumbnails | Image gallery | Visible | Change main image | ✅ Click changes main image | ✅ PASS |
| Seller Profile | Seller section | Visible | View seller info | ✅ Shows seller details | ✅ PASS |

---

## 4. CART DRAWER (`components/cart/CartDrawer.tsx`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| Close (X) | Header | Visible | Close drawer | ✅ Closes cart drawer | ✅ PASS |
| Remove item (trash) | Per item | Visible | Remove from cart | ✅ Removes item | ✅ PASS |
| Size dropdown | Per item | Visible | Change size | ✅ Updates size | ✅ PASS |
| Quantity -/+ | Per item | Visible | Adjust quantity | ✅ Updates quantity | ✅ PASS |
| Date inputs | Per item | Visible | Change dates | ✅ Updates dates | ✅ PASS |
| Apply Coupon | Footer | Visible | Validate coupon | ✅ Validates KLOSETGOLD/FIRSTRENT (local only) | ⚠️ No API coupon validation |
| Remove Coupon | Footer | Visible (when applied) | Clear coupon | ✅ Clears coupon | ✅ PASS |
| "Explore Catalog" | Empty state | Visible | Close drawer | ✅ Closes drawer | ✅ PASS |
| "Checkout" link | Footer | Visible | Navigate to checkout | ✅ Routes to `/booking/checkout` | ✅ PASS |

---

## 5. CHECKOUT (`app/booking/checkout/page.tsx`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| "Back to Catalog" | Top | Visible | Navigate to `/discover` | ✅ Routes correctly | ✅ PASS |
| Delivery/Pickup toggle | Delivery section | Visible | Select method | ✅ Toggles address visibility | ✅ PASS |
| Address selection | Delivery section | Visible (when delivery) | Select address | ✅ Radio-style selection works | ✅ PASS |
| "Add one in profile" | Empty address | Visible | Navigate to `/profile` | ✅ Routes to `/profile` | ✅ PASS |
| "Pay & Place Order" | Summary | Visible | Process payment | ✅ Creates booking → Razorpay → verification | ✅ PASS |
| Loading state | During submit | Visible | Show spinner | ✅ Button shows loading state | ✅ PASS |
| Date inputs | Timeline section | Visible | Select dates | ✅ Both date inputs work | ✅ PASS |

---

## 6. SELLER DASHBOARD (`/seller`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| "Add New Couture" | Dashboard | Visible | Navigate to `/seller/listings` | ✅ Routes correctly | ✅ PASS |
| "Sync Lists" | Dashboard | Visible | Refresh data | ✅ Reloads recent rentals | ✅ PASS |

---

## 7. SELLER LISTINGS (`/seller/listings`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| "Add Couture Listing" | Header | Visible | Open create modal | ✅ Opens modal with form | ✅ PASS |
| "Submit Approval" | Per-item (draft) | Visible | Submit for approval | ✅ Calls API | ✅ PASS |
| Edit (pencil icon) | Per-item | Visible | Open edit modal | ✅ Pre-populates form with existing data | ✅ PASS |
| Delete (trash) | Per-item | Visible | Delete listing | ✅ Calls delete API | ✅ PASS |
| "Cancel" | Create/Edit modal | Visible | Close modal | ✅ Closes modal | ✅ PASS |
| "Save Wardrobe Listing" | Create modal | Visible | Create listing | ✅ Validates + creates | ✅ PASS |
| "Save Changes" | Edit modal | Visible | Update listing | ✅ Validates + updates | ✅ PASS |
| "Sync Lists" | Header | Visible | Refresh | ✅ Reloads data | ✅ PASS |

---

## 8. SELLER ORDERS (`/seller/orders`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| "Sync Lists" | Header | Visible | Refresh | ✅ Reloads data | ✅ PASS |
| "Dispatched" | Per-order | Visible | Status → picked_up | ✅ Calls API | ✅ PASS |
| "Mark Returned" | Per-order | Visible | Status → returned | ✅ Calls API | ✅ PASS |
| "Sent To Dry Clean" | Per-order | Visible | Status → cleaning | ✅ Calls API | ✅ PASS |
| "Complete Order" | Per-order | Visible | Status → completed | ✅ Calls API | ✅ PASS |

---

## 9. SELLER EARNINGS (`/seller/earnings`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| "Withdraw to Bank Account" | Wallet card | Visible | Withdraw funds | ⚠️ Simulated: `setTimeout` → toast only. No API call. | ❌ FAIL |
| "Edit Bank Details" | Bank card | Visible | Edit bank info | ⚠️ Text button with no actual handler — just text. | ❌ FAIL |

---

## 10. SELLER INBOX (`/seller/inbox`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| Conversation items | Sidebar | Visible | Select conversation | ✅ Shows chat panel (mock only) | ⚠️ Mock data |
| Search input | Sidebar | Visible | Filter convos | ✅ Visual filter works | ✅ PASS |
| Message input | Chat panel | Visible | Type message | ✅ Input works | ✅ PASS |
| "Send" button | Chat panel | Visible | Send message | ⚠️ Only shows toast — no API call | ❌ FAIL |

---

## 11. SELLER ANALYTICS (`/seller/analytics`)

| Button | Location | Status | Expected Result | Actual Result | Verdict |
|--------|----------|--------|----------------|---------------|---------|
| Tab switches | Charts | Visible | Switch views | ✅ Tabs work | ✅ PASS |

---

## 12. ADMIN PAGES

| Page | Button | Location | Status | Expected | Actual | Verdict |
|------|--------|----------|--------|----------|--------|---------|
| Dashboard | "Sync Analytics" | Header | ✅ | Refresh data | ✅ Reloads | ✅ PASS |
| Users | "Sync Registry" | Header | ✅ | Refresh users | ✅ Reloads | ✅ PASS |
| Users | Search input | Header | ✅ | Filter table | ✅ Works | ✅ PASS |
| Sellers | "Sync Registry" | Header | ✅ | Refresh sellers | ✅ Reloads | ✅ PASS |
| Sellers | Search input | Header | ✅ | Filter table | ✅ Works | ✅ PASS |
| KYC | "Approve" | Per-user | ✅ | Approve KYC | ✅ Calls API | ✅ PASS |
| KYC | "Reject" | Per-user | ✅ | Reject KYC | ✅ Calls API | ✅ PASS |
| Disputes | "Resolve Case" | Per-dispute | ✅ | Open resolution modal | ✅ Opens modal | ✅ PASS |
| Disputes | "Release Escrow Funds" | Modal | ✅ | Resolve dispute | ✅ Calls API | ✅ PASS |
| Disputes | "Cancel" | Modal | ✅ | Close modal | ✅ Closes | ✅ PASS |
| Listings | "Approve" | Per-listing | ✅ | Approve outfit | ✅ Calls API | ✅ PASS |
| Listings | "Reject" | Per-listing | ✅ | Reject outfit | ✅ Calls API | ✅ PASS |
| AIOps | "Sync Monitor" | Header | ✅ | Refresh data | ✅ Reloads | ✅ PASS |
| Support | "Refresh" | Header | ✅ | Refresh tickets | ✅ Reloads | ✅ PASS |
| Support | Search | Header | ✅ | Filter tickets | ✅ Works | ✅ PASS |
| Settings | "Save Settings" | Form | ✅ | Save settings | ✅ Calls API | ✅ PASS |
| Orders | Search | Header | ✅ | Filter | ✅ Visual only — no data to filter | ⚠️ No data ever loads |
| Transactions | Filter buttons | Header | ✅ | Filter transactions | ✅ Filter works | ✅ PASS |

---

## 13. AUTH PAGES

### Login (`/auth/login`)

| Button | Status | Expected | Actual | Verdict |
|--------|--------|----------|--------|---------|
| Google Sign-In | ❌ **MISSING** | Render Google OAuth button | Not rendered anywhere on page | ❌ FAIL |
| "Sign In" (email/pw) | ✅ | Submit credentials | ✅ Calls authAPI.login() | ✅ PASS |
| "Remember me" checkbox | ✅ | Persist session | ⚠️ Rendered but has NO functional effect | ❌ FAIL |
| "Forgot Password?" | ✅ | Navigate to reset flow | ⚠️ Links to `/support` — NOT a password reset page | ❌ FAIL |
| "Create Account" link | ✅ | Navigate to register | ✅ Routes to `/auth/register` | ✅ PASS |

### Register (`/auth/register`)

| Button | Status | Expected | Actual | Verdict |
|--------|--------|----------|--------|---------|
| Google Sign-Up | ❌ **MISSING** | Render Google OAuth button | Not rendered anywhere on page | ❌ FAIL |
| "Create Account" | ✅ | Submit registration | ✅ Calls authAPI.register() with hardcoded role='renter' | ⚠️ No role selector |
| Role selector | ❌ **MISSING** | Renter/Seller toggle | Not rendered. Register hardcodes `role: 'renter'` | ❌ FAIL |
| "Sign In" link | ✅ | Navigate to login | ✅ Routes to `/auth/login` | ✅ PASS |

---

## 14. ADMIN SIDEBAR (`components/layout/AdminSidebar.tsx`)

| Menu Item | Path | Visible | Expected | Actual | Verdict |
|-----------|------|---------|----------|--------|---------|
| Overview | `/admin` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| Users | `/admin/users` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| Sellers | `/admin/sellers` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| KYC Approval | `/admin/kyc` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| Transactions | `/admin/transactions` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| Disputes | `/admin/disputes` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| AIOps Monitor | `/admin/aiops` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| Settings | `/admin/settings` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| **Listings** | `/admin/listings` | ❌ **MISSING** | Navigate | No sidebar link to listings management | ❌ FAIL |
| **Orders** | `/admin/orders` | ❌ **MISSING** | Navigate | No sidebar link to orders management | ❌ FAIL |
| **Payments** | `/admin/payments` | ❌ **MISSING** | Navigate | No sidebar link to payments | ❌ FAIL |
| **Support** | `/admin/support` | ❌ **MISSING** | Navigate | No sidebar link to support tickets | ❌ FAIL |
| **Security** | `/admin/security` | ❌ **MISSING** | Navigate | No sidebar link to security | ❌ FAIL |
| **Analytics** | `/admin/analytics` | ❌ **MISSING** | Navigate | No sidebar link to analytics | ❌ FAIL |

---

## 15. SELLER SIDEBAR (`components/layout/SellerSidebar.tsx`)

| Menu Item | Path | Visible | Expected | Actual | Verdict |
|-----------|------|---------|----------|--------|---------|
| Overview | `/seller` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| My Listings | `/seller/listings` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| Rental Orders | `/seller/orders` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| Analytics | `/seller/analytics` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| Earnings & Payouts | `/seller/earnings` | ✅ | Navigate | ✅ Routes | ✅ PASS |
| **Profile** | `/seller/profile` | ❌ **MISSING** | Navigate | No sidebar link to seller profile | ❌ FAIL |
| **Reviews** | `/seller/reviews` | ❌ **MISSING** | Navigate | No sidebar link to reviews | ❌ FAIL |
| **Support** | `/seller/support` | ❌ **MISSING** | Navigate | No sidebar link to seller support | ❌ FAIL |
| **Inbox** | `/seller/inbox` | ❌ **MISSING** | Navigate | No sidebar link to inbox | ❌ FAIL |

---

## SUMMARY TABLE

| Page/Component | Total Buttons | Missing | Dead/Fake | Issues |
|---------------|:------------:|:-------:|:---------:|:------:|
| Homepage | 12 | 1 | 0 | 1 (mock newsletter) |
| Discover | 20 | 0 | 0 | 0 |
| Product Page | 10 | 3 | 0 | 0 |
| Cart Drawer | 8 | 0 | 0 | 1 (local-only coupon) |
| Checkout | 7 | 0 | 0 | 0 |
| Seller Dashboard | 2 | 0 | 0 | 0 |
| Seller Listings | 8 | 0 | 0 | 0 |
| Seller Orders | 5 | 0 | 0 | 0 |
| Seller Earnings | 2 | 0 | 2 | Withdraw + Edit Bank are dead |
| Seller Inbox | 2 | 0 | 1 | Send is mock-only |
| Seller Analytics | 2 | 0 | 0 | Mock data |
| Admin Dashboard | 1 | 0 | 0 | 0 |
| Admin Users | 2 | 0 | 0 | 0 |
| Admin Sellers | 2 | 0 | 0 | 0 |
| Admin KYC | 2 | 0 | 0 | 0 |
| Admin Disputes | 3 | 0 | 0 | 0 |
| Admin AIOps | 1 | 0 | 0 | Fake chart data |
| Admin Support | 2 | 0 | 0 | 0 |
| Login Page | 5 | 1 | 2 | Google missing, Remember me dead, Forgot PW wrong |
| Register Page | 4 | 2 | 0 | Google missing, Role selector missing |
| Admin Sidebar | 8 | 6 | 0 | 6 admin links missing |
| Seller Sidebar | 5 | 4 | 0 | 4 seller links missing |

**TOTAL MISSING BUTTONS: 17**
**TOTAL DEAD/FAKE BUTTONS: 5**
**TOTAL ISSUES: 24**

**Verdict: ❌ FAIL — 17 missing buttons, 5 dead buttons, 24 total issues across the platform.**

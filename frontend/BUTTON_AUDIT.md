# Kloset Luxe — Button Audit

> **Legend:** ✓ Pass | ⚠️ Warning | ❌ Fail | ➖ Not Applicable

---

## 1. Navbar (`RenterNavbar.tsx`)

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | "AI Stylist" | ✓ | ✓ | Opens AI drawer (`setAIStylistOpen(true)`) | ✓ |
| 2 | Cart icon | ✓ | ✓ | Opens cart drawer (`setCartOpen(true)`) | ✓ |
| 3 | Profile icon | ✓ | ✓ | Link to `/profile` | ✓ |
| 4 | Seller Studio icon | ✓ | ✓ | Link to `/seller` (role=seller only) | ✓ |
| 5 | Admin Dashboard icon | ✓ | ✓ | Link to `/admin` (role=admin only) | ✓ |
| 6 | Logout | ✓ | ✓ | Calls `logout()` | ✓ |
| 7 | "Sign In" | ✓ | ✓ | Link to `/auth/login` (unauthenticated) | ✓ |
| 8 | Catalog nav link | ✓ | ✓ | Link to `/discover` | ✓ |
| 9 | Lehengas nav link | ✓ | ✓ | `/discover?category=lehenga` | ✓ |
| 10 | Sarees nav link | ✓ | ✓ | `/discover?category=saree` | ✓ |
| 11 | Sherwanis nav link | ✓ | ✓ | `/discover?category=sherwani` | ✓ |

---

## 2. Homepage

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | "Browse Couture" | ✓ | ✓ | Link to `/discover` | ✓ |
| 2 | "Consult AI Stylist" | ✓ | ✓ | Opens AI drawer | ✓ |
| 3 | "Quick View" (trending cards) | ✓ | ✓ | Link to `/outfit/[id]` | ✓ |
| 4 | "See All" (trending) | ✓ | ✓ | `/discover?sort=popular` | ✓ |
| 5 | "Explore Collection" (Wedding Atelier) | ✓ | ✓ | `/discover?occasion=wedding` | ✓ |
| 6 | "View Outfits" (Modern Sherwanis) | ✓ | ✓ | `/discover?category=sherwani` | ✓ |
| 7 | "View Outfits" (Cocktail Sarees) | ✓ | ✓ | `/discover?category=saree` | ✓ |
| 8 | Occasion filter pills (4) | ✓ | ✓ | `setActiveOccasion(...)` | ✓ |
| 9 | "Book Outfit" (occasion cards) | ✓ | ✓ | Link to `/outfit/[id]` | ✓ |
| 10 | "Open AI Stylist Assistant" | ✓ | ✓ | Opens AI drawer | ✓ |
| 11 | Designer avatars | ✓ | ✓ | **No action** — decorative only | ❌ |
| 12 | Seller cards ChevronRight | ✓ | ✓ | Link to `/discover` (generic — should go to seller store) | ❌ |
| 13 | "Browse New" | ✓ | ✓ | `/discover?sort=newest` | ✓ |
| 14 | "Inspect" (new arrivals) | ✓ | ✓ | `/outfit/[id]` | ✓ |
| 15 | "Login & Unlock" | ✓ | ✓ | `/auth/login?redirect=/` | ✓ |
| 16 | FAQ accordion toggles | ✓ | ✓ | `toggleFaq(index)` | ✓ |
| 17 | Newsletter form submit | ✓ | ✓ | Shows success toast only — **no API call** | ❌ |
| 18 | "Join the Circle" | ✓ | ✓ | Form submit | ✓ |

### CSS Class Issue (Homepage)
All homepage buttons use non-Tailwind classes: `btn btn-gold`, `btn btn-primary`, `btn btn-outline`, `btn btn-ghost`, `input-kloset`, `badge badge-sage`. These must be defined in `globals.css`. If they are **not** defined, every homepage button renders as **unstyled HTML** ❌

---

## 3. Discover Page

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | Search input | ✓ | ✓ | Filters results | ✓ |
| 2 | City filter input | ✓ | ✓ | Filters results | ✓ |
| 3 | Sort dropdown | ✓ | ✓ | Sorts results (5 options) | ✓ |
| 4 | Category filter buttons (9) | ✓ | ✓ | Filters results | ✓ |
| 5 | Occasion filter buttons (6) | ✓ | ✓ | Filters results | ✓ |
| 6 | Size filter buttons (6) | ✓ | ✓ | Filters results | ✓ |
| 7 | Price range filter buttons (4) | ✓ | ✓ | Filters results | ✓ |
| 8 | Reset Filters | ✓ | ✓ | Clears all filters | ✓ |
| 9 | "Filter Options" (mobile) | ✓ | ✓ | Opens filter drawer | ✓ |
| 10 | Mobile drawer close X | ✓ | ✓ | Closes drawer | ✓ |
| 11 | "View Details" (cards) | ✓ | ✓ | Link to `/outfit/[id]` | ✓ |
| 12 | "Reset Search Filters" (empty state) | ✓ | ✓ | Clears filters | ✓ |

---

## 4. Auth — Login Page

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | Google Sign-In | ✓ | ✓ | `authAPI.googleLogin()` | ✓ |
| 2 | Role selector (Renter/Seller) | ✓ | ✓ | `setRole(...)` | ✓ |
| 3 | Email input | ✓ | ✓ | — | ✓ |
| 4 | Password input | ✓ | ✓ | — | ✓ |
| 5 | Show/hide password toggle | ✓ | ✓ | Toggles password visibility | ✓ |
| 6 | "Remember me" checkbox | ✓ | ✓ | — | ✓ |
| 7 | "Forgot Password?" link | ✓ | ✓ | Link to `/support` | ✓ |
| 8 | "Sign In" submit | ✓ | ✓ | Form submit | ✓ |
| 9 | "Create Account" link | ✓ | ✓ | Link to `/auth/register` | ✓ |

---

## 5. Auth — Register Page

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | Google Sign-Up | ✓ | ✓ | `authAPI.googleLogin()` | ✓ |
| 2 | Role selector (Renter/Seller) | ✓ | ✓ | `setRole(...)` | ✓ |
| 3 | Full Name input | ✓ | ✓ | — | ✓ |
| 4 | Email input | ✓ | ✓ | — | ✓ |
| 5 | Phone input | ✓ | ✓ | — | ✓ |
| 6 | Password input | ✓ | ✓ | — | ✓ |
| 7 | Show/hide password toggle | ✓ | ✓ | Toggles visibility | ✓ |
| 8 | "Create Account" submit | ✓ | ✓ | Form submit | ✓ |
| 9 | "Sign In" link | ✓ | ✓ | Link to `/auth/login` | ✓ |

---

## 6. Checkout Page

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | "Back to Catalog" | ✓ | ✓ | `/discover` | ✓ |
| 2 | Pickup Date input | ✓ | ✓ | Date picker | ✓ |
| 3 | Return Date input | ✓ | ✓ | Date picker | ✓ |
| 4 | Delivery method toggle | ✓ | ✓ | Home Delivery / Self Pickup | ✓ |
| 5 | Address selection buttons | ✓ | ✓ | Select address | ✓ |
| 6 | "Place Order" | ✓ | ✓ | Creates booking → Razorpay → verifies | ✓ |

---

## 7. Outfit Detail Page

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | Wishlist toggle (heart) | ✓ | ✓ | Toggle wishlist | ✓ |
| 2 | Image gallery thumbnails | ✓ | ✓ | Switches image | ✓ |
| 3 | Rental duration selector | ✓ | ✓ | 1/3/7 days | ✓ |
| 4 | Start / End date inputs | ✓ | ✓ | Date pickers | ✓ |
| 5 | Size selection buttons | ✓ | ✓ | Select size | ✓ |
| 6 | "Book Now" | ✓ | ✓ | `/booking/checkout?outfit_id=...` | ✓ |
| 7 | "Add to Cart" | ✓ | ✓ | `addItem()` + toast | ✓ |
| 8 | "Back to Catalog" | ✓ | ✓ | `/discover` | ✓ |

---

## 8. Profile Page

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | Tab navigation (4 tabs) | ✓ | ✓ | Switches tab view | ✓ |
| 2 | "Save Account Profile" | ✓ | ✓ | Saves profile | ✓ |
| 3 | Gender dropdown | ✓ | ✓ | — | ✓ |
| 4 | Date of Birth input | ✓ | ✓ | — | ✓ |
| 5 | "Add Address" | ✓ | ✓ | Opens address form | ✓ |
| 6 | "Save Location" | ✓ | ✓ | Saves address | ✓ |
| 7 | "Cancel" (add address) | ✓ | ✓ | Closes form | ✓ |
| 8 | "Set Default" address | ✓ | ✓ | Sets default address | ✓ |
| 9 | "Delete" address | ✓ | ✓ | Deletes address | ✓ |
| 10 | "Save Atelier Settings" | ✓ | ✓ | Saves settings | ✓ |
| 11 | **"Withdraw Payout"** | ✓ | ✓ | **Toast only** — no actual payout | ❌ |
| 12 | **"Add Wallet Credits"** | ✓ | ✓ | **Toast only** — no actual credits | ❌ |

### Missing on Profile Page
| Missing Button | Issue |
|----------------|-------|
| **No "Delete Account"** | Users cannot delete their account | ❌ |
| **No "Change Password"** | Users cannot change their password | ❌ |
| **No "Edit Address"** | Only Delete and Set Default exist | ❌ |

---

## 9. Wishlist Page

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | "Browse Collections" (empty state) | ✓ | ✓ | Link to `/discover` | ✓ |
| 2 | "View Garment Detail" (eye icon) | ✓ | ✓ | Link to `/outfit/[id]` | ✓ |
| 3 | "Remove from wishlist" (trash icon) | ✓ | ✓ | `removeFromWishlist()` | ✓ |
| 4 | "Rent" | ✓ | ✓ | `addItem()` + toast | ✓ |

---

## 10. Orders Page

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | Tab filters (All / In Progress / Completed) | ✓ | ✓ | Filters orders | ✓ |
| 2 | "Garment Received" | ✓ | ✓ | `updateStatus('picked_up')` | ✓ |
| 3 | "Wear Couture (Activate)" | ✓ | ✓ | `updateStatus('in_use')` | ✓ |
| 4 | "Handover to Courier" | ✓ | ✓ | `updateStatus('return_initiated')` | ✓ |
| 5 | "Post Garment Review" | ✓ | ✓ | Opens review modal | ✓ |
| 6 | "Dispute Escrow Funds" | ✓ | ✓ | Opens dispute modal | ✓ |
| 7 | Review: star selector | ✓ | ✓ | Select rating | ✓ |
| 8 | Review: textarea | ✓ | ✓ | Enter text | ✓ |
| 9 | Review: "Post Review" | ✓ | ✓ | Submits review | ✓ |
| 10 | Dispute: reason input | ✓ | ✓ | Select reason | ✓ |
| 11 | Dispute: description textarea | ✓ | ✓ | Enter text | ✓ |
| 12 | Dispute: "Lock Escrow Funds" | ✓ | ✓ | Submits dispute | ✓ |
| 13 | "Browse Collections" (empty state) | ✓ | ✓ | `/discover` | ✓ |

### Missing on Orders Page
| Missing Button | Issue |
|----------------|-------|
| **No "Track Order"** | Users cannot track order — only status transitions | ❌ |
| **No "Edit Review"** | Already-posted reviews cannot be edited | ❌ |
| **No "Delete Review"** | Already-posted reviews cannot be deleted | ❌ |

---

## 11. Support Page

| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | **"Live Chat"** | ✓ | ✓ | **Toast only** ("coming soon") — placeholder | ❌ |
| 2 | "Email Us" | ✓ | ✓ | `mailto:` link | ✓ |
| 3 | **"Phone Support"** | ✓ | ✓ | **Toast only** (hours info) — no phone integration | ❌ |
| 4 | "New Ticket" | ✓ | ✓ | Opens ticket form | ✓ |
| 5 | "Submit" ticket | ✓ | ✓ | Submits ticket | ✓ |
| 6 | "Sign In" (unauthenticated) | ✓ | ✓ | `/auth/login` | ✓ |
| 7 | "Register" (unauthenticated) | ✓ | ✓ | `/auth/register` | ✓ |

---

## 12. Seller Pages

### Seller Sidebar
| # | Link | Visible | Route | Status |
|---|------|---------|-------|--------|
| 1 | Overview | ✓ | `/seller` | ✓ |
| 2 | My Listings | ✓ | `/seller/listings` | ✓ |
| 3 | Rental Orders | ✓ | `/seller/orders` | ✓ |
| 4 | Analytics | ✓ | `/seller/analytics` | ✓ |
| 5 | Earnings | ✓ | `/seller/earnings` | ✓ |
| 6 | Exit Studio | ✓ | — | ✓ |
| 7 | Logout | ✓ | — | ✓ |

### Missing from Seller Sidebar
| Missing Link | Route | Issue |
|--------------|-------|-------|
| **Inbox** | `/seller/inbox` | Exists as route but **not linked** in sidebar | ❌ |
| **Support** | `/seller/support` | Exists as route but **not linked** in sidebar | ❌ |
| **Reviews** | `/seller/reviews` | Exists as route but **not linked** in sidebar | ❌ |
| **Profile** | `/seller/profile` | Exists as route but **not linked** in sidebar | ❌ |

### Seller Dashboard & Listings
| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | "Add New Couture" | ✓ | ✓ | `/seller/listings` | ✓ |
| 2 | "Add Couture Listing" | ✓ | ✓ | Opens add modal | ✓ |
| 3 | Edit button | ✓ | ✓ | Opens edit modal | ✓ |
| 4 | Submit Approval | ✓ | ✓ | Submits for approval | ✓ |
| 5 | Delete button | ✓ | ✓ | Deletes listing | ✓ |
| 6 | Cancel / Save (modals) | ✓ | ✓ | Close / Save | ✓ |

### Mobile Sidebar Issue
**Seller and Admin sidebars do not collapse on mobile** — no hamburger menu exists. ❌

---

## 13. Admin Pages

### Admin Sidebar
| # | Link | Visible | Route | Status |
|---|------|---------|-------|--------|
| 1 | Overview | ✓ | `/admin` | ✓ |
| 2 | Users | ✓ | `/admin/users` | ✓ |
| 3 | Sellers | ✓ | `/admin/sellers` | ✓ |
| 4 | KYC Approval | ✓ | `/admin/kyc` | ✓ |
| 5 | Transactions | ✓ | `/admin/transactions` | ✓ |
| 6 | Disputes | ✓ | `/admin/disputes` | ✓ |
| 7 | AIOps | ✓ | `/admin/aiops` | ✓ |
| 8 | Settings | ✓ | `/admin/settings` | ✓ |
| 9 | Exit Hub | ✓ | — | ✓ |
| 10 | Logout | ✓ | — | ✓ |

### Missing from Admin Sidebar
| Missing Link | Route | Issue |
|--------------|-------|-------|
| **Orders** | `/admin/orders` | Exists as route but **not linked** in sidebar | ❌ |
| **Payments** | `/admin/payments` | Exists as route but **not linked** in sidebar | ❌ |

### Admin Missing Action Buttons
| Missing Button | Issue |
|----------------|-------|
| **No "Approve / Reject" for KYC** | KYC Approval sidebar entry exists, but no visible approve/reject action buttons | ❌ |
| **No "Approve / Reject" for listings** | Pending listing approvals have no visible action | ❌ |

### Admin Dashboard
| # | Button | Visible | Clickable | Route / Action | Status |
|---|--------|---------|-----------|----------------|--------|
| 1 | "Sync Analytics" | ✓ | ✓ | Triggers sync | ✓ |

---

## 14. Cart Page

| Issue | Detail |
|-------|--------|
| **No `/cart` page exists** | Cart is only accessible as a **drawer** from the navbar cart icon. There is no standalone cart page. | ❌ |

---

## Summary of Failures

### Dead Buttons (Toast-only / Placeholder / No-op)
| Button | Page | Problem |
|--------|------|---------|
| "Withdraw Payout" | Profile (Wallet tab) | Toast only — no actual withdraw |
| "Add Wallet Credits" | Profile (Wallet tab) | Toast only — no actual add credits |
| "Live Chat" | Support | Toast ("coming soon") — placeholder |
| "Phone Support" | Support | Toast (hours info) — no integration |
| Newsletter form submit | Homepage | Success toast — no API call |
| Designer avatars | Homepage | Decorative — no click action |
| Seller cards ChevronRight | Homepage | All link to `/discover` — should link to seller store |

### Missing Buttons
| Missing Button | Page |
|----------------|------|
| Cart page (`/cart`) | — No cart page exists at all |
| Delete Account | Profile |
| Change Password | Profile |
| Edit Address | Profile (only Delete + Set Default) |
| Track Order | Orders |
| Edit Review | Orders / Reviews |
| Delete Review | Orders / Reviews |
| Approve / Reject KYC | Admin |
| Approve / Reject Listings | Admin |
| Mobile hamburger menu | Seller & Admin sidebars |

### Sidebar Missing Links
| Sidebar | Missing | Route Exists? |
|---------|---------|---------------|
| Seller | Inbox | `/seller/inbox` ✓ |
| Seller | Support | `/seller/support` ✓ |
| Seller | Reviews | `/seller/reviews` ✓ |
| Seller | Profile | `/seller/profile` ✓ |
| Admin | Orders | `/admin/orders` ✓ |
| Admin | Payments | `/admin/payments` ✓ |

### CSS Class Mismatch
**All homepage buttons** use `btn btn-gold`, `btn btn-primary`, `btn btn-outline`, `btn btn-ghost`, `input-kloset`, `badge badge-sage` — custom classes that are **not** Tailwind utilities. If these are not defined in `globals.css`, every homepage button renders as **unstyled HTML**. ❌

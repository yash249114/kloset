# KLOSET V6 — RENTER DASHBOARD OWNERSHIP AUDIT

**Audit Date:** 2026-06-16
**Scope:** Full renter journey — Profile, Addresses, Wishlist, Cart, Bookings, Returns, Reviews, Support Tickets, AI Stylist History
**Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL

---

## 1. PROFILE (`/profile`)

| Feature | Status | File:Line | Notes |
|---------|--------|-----------|-------|
| Profile info display | ✅ | `app/profile/page.tsx:207-250` | Name, email, phone, verification badge |
| Personal info edit | ✅ | `app/profile/page.tsx:294-366` | Name, phone, gender, DOB — form submit via `userAPI.updateProfile` |
| Email field disabled | ✅ | `app/profile/page.tsx:319-326` | Read-only with helper text |
| Wallet balance card | ✅ | `app/profile/page.tsx:230-238` | Shown in header banner |
| Trust score card | ✅ | `app/profile/page.tsx:240-248` | Shown in header banner |
| Tab navigation | ✅ | `app/profile/page.tsx:256-280` | 4 tabs: Personal, Addresses, Business, Wallet |
| Loading skeleton | ❌ | `app/profile/page.tsx:198-205` | Uses spinner only — no shimmer skeleton |
| Mobile responsiveness | ⚠️ | `app/profile/page.tsx:208,252` | `pt-28` correct; grid `grid-cols-1 md:grid-cols-4` OK; tabs stack vertically on mobile |
| Auth guard | ✅ | `app/profile/page.tsx:70-75` | Redirects to login if unauthenticated |
| Error handling | ✅ | `app/profile/page.tsx:105-108` | Toast on API failure |

**Verdict: ⚠️ PARTIAL — Missing loading skeleton, business tab shown to all roles**

---

## 2. ADDRESSES (Profile tab)

| Feature | Status | File:Line | Notes |
|---------|--------|-----------|-------|
| Address list display | ✅ | `app/profile/page.tsx:481-534` | Cards with label, full address, city/state/pincode |
| Add address form | ✅ | `app/profile/page.tsx:391-472` | Collapsible animated form with all fields |
| Delete address | ✅ | `app/profile/page.tsx:520-529` | Trash icon button, calls `userAPI.deleteAddress` |
| Set default address | ✅ | `app/profile/page.tsx:509-519` | "Set Default" button, calls `userAPI.setDefaultAddress` |
| Default badge | ✅ | `app/profile/page.tsx:496-499` | "Default Destination" badge on default address |
| Empty state | ✅ | `app/profile/page.tsx:476-479` | "No delivery dispatch locations" message with dashed border |
| Validation | ✅ | `app/profile/page.tsx:150-153` | All required fields checked before submit |
| Mobile responsive | ✅ | `app/profile/page.tsx:399,424` | Grid cols 1/2 for form fields |
| API integration | ✅ | `lib/api.ts:340-357` | `getAddresses`, `addAddress`, `deleteAddress`, `setDefaultAddress` |

**Verdict: ✅ PASS — Full CRUD with proper empty states**

---

## 3. WISHLIST (`/wishlist`)

| Feature | Status | File:Line | Notes |
|---------|--------|-----------|-------|
| Wishlist grid | ✅ | `app/wishlist/page.tsx:106-201` | Cards with image, seller, title, price |
| Add to cart | ✅ | `app/wishlist/page.tsx:184-191` | "Rent" button per item, calls `useCartStore.addItem` |
| Remove from wishlist | ✅ | `app/wishlist/page.tsx:153-159` | Trash icon in hover overlay, calls `removeFromWishlist` |
| View outfit detail | ✅ | `app/wishlist/page.tsx:144-150` | Eye icon in hover overlay, links to `/outfit/[id]` |
| Empty state | ✅ | `app/wishlist/page.tsx:94-104` | "Wishlist is Empty" with CTA to browse |
| Loading state | ⚠️ | `app/wishlist/page.tsx:60-67` | Spinner only — no skeleton shimmer grid |
| Price display | ⚠️ | `app/wishlist/page.tsx:48,179-181` | `price_3day \|\| 1500` hardcoded fallback |
| Category badge | ✅ | `app/wishlist/page.tsx:136-139` | Gold badge on image |
| Auth guard | ✅ | `app/wishlist/page.tsx:22-28` | Redirects to login |
| Mobile responsive | ✅ | `app/wishlist/page.tsx:106` | Grid `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4` |
| Breadcrumb nav | ✅ | `app/wishlist/page.tsx:74-78` | Account Studio > Wishlist Registry |

**Verdict: ⚠️ PARTIAL — Missing skeleton loader, hardcoded price fallback**

---

## 4. CART

### 4a. Cart Page (`/cart`)

| Feature | Status | File:Line | Notes |
|---------|--------|-----------|-------|
| Item list | ✅ | `app/cart/page.tsx:54-91` | Image, title, size, dates, price per item |
| Remove item | ✅ | `app/cart/page.tsx:81-85` | Trash icon button |
| Order summary | ✅ | `app/cart/page.tsx:94-131` | Subtotal, deposit, platform fee, tax, discount, total |
| Checkout CTA | ✅ | `app/cart/page.tsx:126-130` | Links to `/booking/checkout` |
| Empty state | ✅ | `app/cart/page.tsx:16-35` | "Your cart is empty" with icon + CTA |
| Mobile responsive | ⚠️ | `app/cart/page.tsx:38,57` | `max-w-4xl` OK; item cards stack; summary panel full width |
| Loading skeleton | ❌ | — | No skeleton (not needed — cart is client-side) |

### 4b. Cart Drawer (`CartDrawer.tsx`)

| Feature | Status | File:Line | Notes |
|---------|--------|-----------|-------|
| Item list | ✅ | `components/cart/CartDrawer.tsx:100-217` | Full item details with image, seller, size, dates |
| Remove item | ✅ | `components/cart/CartDrawer.tsx:120-126` | Trash icon per item |
| Update quantity | ✅ | `components/cart/CartDrawer.tsx:153-169` | +/- buttons |
| Update size | ✅ | `components/cart/CartDrawer.tsx:139-149` | Dropdown select |
| Update dates | ✅ | `components/cart/CartDrawer.tsx:174-203` | Start/end date inputs |
| Coupon apply | ✅ | `components/cart/CartDrawer.tsx:226-256` | Input + Apply/Remove buttons |
| Coupon validation | ✅ | `components/cart/CartDrawer.tsx:46-58` | KLOSETGOLD (15%), FIRSTRENT (10%) |
| Price breakdown | ✅ | `components/cart/CartDrawer.tsx:265-294` | Subtotal, discount, deposit, platform fee, tax, shipping |
| Total display | ✅ | `components/cart/CartDrawer.tsx:297-302` | "Total Payout" with grand total |
| Empty state | ✅ | `components/cart/CartDrawer.tsx:83-98` | "Your cart is empty" with icon + CTA |
| Checkout link | ✅ | `components/cart/CartDrawer.tsx:305-311` | Links to `/booking/checkout` |
| Mobile responsive | ✅ | `components/cart/CartDrawer.tsx:77` | Drawer max-width 480px, full mobile width |

**Verdict: ✅ PASS — Full cart functionality in both page and drawer**

---

## 5. BOOKINGS / ORDERS (`/orders`)

| Feature | Status | File:Line | Notes |
|---------|--------|-----------|-------|
| Status filter tabs | ✅ | `app/orders/page.tsx:205-226` | All Orders, In Progress, Completed |
| Order cards | ✅ | `app/orders/page.tsx:244-390` | Image, title, ref ID, dates, status badge, amount |
| Status badges | ✅ | `app/orders/page.tsx:30-55` | 10 status variants with color coding |
| Booking timeline grid | ✅ | `app/orders/page.tsx:300-325` | Pickup date, return date, size, delivery type |
| Mark as received | ✅ | `app/orders/page.tsx:331-339` | Button for `confirmed` → `picked_up` |
| Activate (start use) | ✅ | `app/orders/page.tsx:342-349` | Button for `picked_up` → `in_use` |
| Initiate return | ✅ | `app/orders/page.tsx:352-360` | Button for `in_use` → `return_initiated` |
| Post review | ✅ | `app/orders/page.tsx:364-372` | Button for `returned`/`completed` → opens review modal |
| Dispute escrow | ✅ | `app/orders/page.tsx:375-383` | Button opens dispute modal (not for completed/cancelled/disputed) |
| Review modal | ✅ | `app/orders/page.tsx:394-468` | Star rating + comment textarea |
| Dispute modal | ✅ | `app/orders/page.tsx:470-528` | Warning banner + reason + description fields |
| Cancel booking | ❌ | — | `bookingsAPI.cancel` exists in `lib/api.ts:259-261` but **not wired** in UI |
| Loading state | ⚠️ | `app/orders/page.tsx:171-178` | Spinner only — no skeleton cards |
| Empty state | ✅ | `app/orders/page.tsx:229-241` | "No bookings cataloged" with icon + CTA |
| Auth guard | ✅ | `app/orders/page.tsx:91-96` | Redirects to login |
| Mobile responsive | ✅ | `app/orders/page.tsx:258` | Cards use `flex-col md:flex-row`; timeline grid `grid-cols-2 sm:grid-cols-4` |
| Breadcrumb nav | ✅ | `app/orders/page.tsx:185-189` | Account Studio > Booking Registry |
| Pagination | ⚠️ | `app/orders/page.tsx:82` | Loads page 1, 20 items — no load-more or pagination UI |

**Verdict: ⚠️ PARTIAL — Cancel booking not wired, no pagination, no skeleton loader**

---

## 6. RETURNS

| Feature | Status | File:Line | Notes |
|---------|--------|-----------|-------|
| Return initiation | ✅ | `app/orders/page.tsx:352-360` | "Handover to Courier" button transitions `in_use` → `return_initiated` |
| Return status tracking | ⚠️ | `app/orders/page.tsx:41-43` | `return_initiated` and `returned` have status badges |
| Dedicated returns page | ❌ | — | No `/returns` route exists |
| Return pickup scheduling | ❌ | — | No date/time picker for return pickup |
| Return shipping label | ❌ | — | No downloadable label or tracking |
| Return confirmation | ❌ | — | No explicit "return completed" confirmation flow |
| Return policy display | ❌ | — | No return policy page (AI stylist has fallback text only) |
| Return history | ❌ | — | No separate returns history view |
| Backend API | ⚠️ | `lib/api.ts:254-257` | `updateStatus` can set `return_initiated` and `returned` but no dedicated returns endpoint |

**Verdict: ❌ FAIL — Returns are status transitions only; no dedicated returns flow, tracking, or policy page**

---

## 7. REVIEWS

| Feature | Status | File:Line | Notes |
|---------|--------|-----------|-------|
| Create review | ✅ | `app/orders/page.tsx:111-132` | Modal with star rating + comment, calls `reviewsAPI.create` |
| Star rating selection | ✅ | `app/orders/page.tsx:412-433` | 5-star interactive selector |
| Review text input | ✅ | `app/orders/page.tsx:435-446` | Textarea with placeholder guidance |
| List outfit reviews | ✅ | `app/outfit/[id]/page.tsx:54-55,419-454` | Reviews section on outfit detail page |
| Review cards | ✅ | `app/outfit/[id]/page.tsx:426-447` | Avatar initial, name, stars, comment, date |
| Review empty state | ✅ | `app/outfit/[id]/page.tsx:450-453` | "No reviews yet" message |
| Review loading state | ✅ | `app/outfit/[id]/page.tsx:419-424` | Shimmer skeleton cards |
| My reviews listing | ❌ | — | No dedicated "My Reviews" page in profile |
| Review edit/delete | ❌ | — | No edit or delete review functionality |
| Photo upload in review | ❌ | `lib/api.ts:627` | `photos` field in payload exists but not exposed in UI |
| Mobile responsive | ✅ | `app/outfit/[id]/page.tsx:426` | Grid `grid-cols-1 md:grid-cols-2` |

**Verdict: ⚠️ PARTIAL — Create + list works; no my-reviews page, no edit/delete, no photo upload**

---

## 8. SUPPORT TICKETS (`/support`)

| Feature | Status | File:Line | Notes |
|---------|--------|-----------|-------|
| Contact channels | ✅ | `app/support/page.tsx:104-127` | Live Chat, Email, Phone cards |
| Ticket list | ✅ | `app/support/page.tsx:200-224` | Cards with subject, description, status badge, date |
| Create ticket | ✅ | `app/support/page.tsx:142-183` | Collapsible form: subject, description, submit |
| Status badges | ✅ | `app/support/page.tsx:17-22` | Open (gold), In Progress (sage), Resolved (sage), Closed (outline) |
| Empty state | ✅ | `app/support/page.tsx:192-198` | "No Support Tickets" with icon |
| Loading state | ⚠️ | `app/support/page.tsx:185-189` | 3 skeleton cards but uses `animate-pulse` divs, not `Skeleton` component |
| Unauthenticated state | ✅ | `app/support/page.tsx:228-242` | Sign In / Register CTA |
| Auth guard | ⚠️ | `app/support/page.tsx:49-57` | Loads public FAQ if not auth'd; tickets only if auth'd |
| Ticket detail view | ❌ | — | No click-to-expand or detail modal for tickets |
| Mobile responsive | ✅ | `app/support/page.tsx:88,104` | `max-w-4xl`; contact grid `grid-cols-1 md:grid-cols-3` |
| API integration | ✅ | `lib/api.ts:671-692` | `createTicket`, `getMyTickets` |

**Verdict: ✅ PASS — Core ticket flow works; minor: no ticket detail view**

---

## 9. AI STYLIST HISTORY

| Feature | Status | File:Line | Notes |
|---------|--------|-----------|-------|
| Chat interface | ✅ | `components/ai/AIStylistDrawer.tsx:121-208` | Drawer with message bubbles |
| Send message | ✅ | `components/ai/AIStylistDrawer.tsx:64-118` | POST to `/ai/chat` with history |
| Message history persistence | ✅ | `components/ai/AIStylistDrawer.tsx:39-57` | Saved to `localStorage` as `kloset_ai_messages` |
| Load history on mount | ✅ | `components/ai/AIStylistDrawer.tsx:39-51` | Reads from localStorage on open |
| Clear chat | ✅ | `components/ai/AIStylistDrawer.tsx:60-62` | Resets to initial bot message |
| Offline fallback | ✅ | `components/ai/AIStylistDrawer.tsx:96-115` | Policy-based keyword responses when API fails |
| Typing indicator | ✅ | `components/ai/AIStylistDrawer.tsx:165-176` | Animated dots while loading |
| User/bot avatars | ✅ | `components/ai/AIStylistDrawer.tsx:144-148` | User (charcoal) and Bot (champagne) circles |
| Timestamps | ✅ | `components/ai/AIStylistDrawer.tsx:157-159` | Each message shows time |
| Auto-scroll | ✅ | `components/ai/AIStylistDrawer.tsx:32-36` | Scrolls to bottom on new messages |
| Mobile responsive | ✅ | `components/ai/AIStylistDrawer.tsx:127` | Drawer `maxWidth="480px"`, full mobile width |
| Chat history page | ❌ | — | No dedicated `/ai-stylist/history` page — history only visible in drawer |
| Export/share chat | ❌ | — | No export or share functionality |
| Session management | ⚠️ | `components/ai/AIStylistDrawer.tsx:53-57` | Single localStorage key — no multi-session support |

**Verdict: ⚠️ PARTIAL — Drawer chat works well; no standalone history page, no multi-session**

---

## 10. MOBILE RESPONSIVENESS (Cross-cutting)

| Area | Status | Notes |
|------|--------|-------|
| RenterNavbar | ⚠️ | Nav links hidden on mobile (`hidden md:flex`); **no hamburger menu** — only Catalog link accessible via `/discover` link elsewhere |
| Homepage | ✅ | Responsive hero, grid layouts, collection cards |
| Discover page | ✅ | Mobile filter drawer, responsive grid, search bar full width |
| Outfit detail | ✅ | Stacked layout on mobile, sticky booking card |
| Cart page | ✅ | Single column, full-width items and summary |
| Cart drawer | ✅ | 480px max, works on all sizes |
| Checkout | ✅ | Single column on mobile, stacked sections |
| Confirmation | ✅ | Centered content, responsive buttons |
| Orders | ✅ | Cards stack vertically, timeline grid responsive |
| Wishlist | ✅ | 1/2/3/4 column responsive grid |
| Profile | ⚠️ | Tabs stack vertically (OK), but business tab visible to all |
| Support | ✅ | Contact cards stack, ticket list full width |
| Footer | ✅ | Links stack on mobile |

**Verdict: ⚠️ PARTIAL — Most pages responsive; missing hamburger menu in navbar**

---

## 11. EMPTY STATES (Cross-cutting)

| Page | Status | Component | Notes |
|------|--------|-----------|-------|
| Cart (page) | ✅ | `app/cart/page.tsx:16-35` | ShoppingBag icon + "Your cart is empty" + CTA |
| Cart (drawer) | ✅ | `components/cart/CartDrawer.tsx:83-98` | Bag icon + "Your cart is empty" + CTA |
| Wishlist | ✅ | `app/wishlist/page.tsx:94-104` | Heart icon + "Wishlist is Empty" + CTA |
| Orders | ✅ | `app/orders/page.tsx:229-241` | Inbox icon + "No bookings cataloged" + CTA |
| Support tickets | ✅ | `app/support/page.tsx:192-198` | MessageSquare icon + "No Support Tickets" |
| Discover (no results) | ✅ | `app/discover/page.tsx:366-378` | "No matching couture listings" + Reset button |
| Profile (addresses) | ✅ | `app/profile/page.tsx:476-479` | "No delivery dispatch locations" message |
| Wallet transactions | ✅ | `app/profile/page.tsx:674-676` | "No transactions recorded" |
| AI Stylist | ✅ | Always shows welcome message | No empty state needed |
| Reviews (outfit) | ✅ | `app/outfit/[id]/page.tsx:450-453` | "No reviews yet" message |

**Verdict: ✅ PASS — All pages have meaningful empty states**

---

## 12. SKELETON LOADERS (Cross-cutting)

| Page | Status | Type | Notes |
|------|--------|------|-------|
| Discover | ✅ | Shimmer cards (`app/discover/page.tsx:357-365`) | 6-card grid with shimmer animation |
| Outfit detail | ✅ | Spinner (`app/outfit/[id]/page.tsx:131-137`) | Text spinner only |
| Checkout | ✅ | Spinner (`app/booking/checkout/page.tsx:155-161`) | Text spinner only |
| Confirmation | ✅ | Spinner (`app/booking/confirmation/page.tsx:44-51`) | Text spinner only |
| Orders | ⚠️ | Spinner (`app/orders/page.tsx:171-178`) | Text spinner — **no skeleton cards** |
| Wishlist | ⚠️ | Spinner (`app/wishlist/page.tsx:60-67`) | Text spinner — **no skeleton grid** |
| Profile | ❌ | Spinner (`app/profile/page.tsx:198-205`) | Text spinner — **no skeleton at all** |
| Support | ⚠️ | Pulse divs (`app/support/page.tsx:185-189`) | 3 `animate-pulse` divs — **not using Skeleton component** |
| Cart page | — | Not needed | Client-side state, instant render |
| AI Stylist | — | Not needed | Drawer content, instant render |
| Reviews (outfit) | ✅ | Shimmer (`app/outfit/[id]/page.tsx:420-424`) | 2 shimmer cards |

**Available Skeleton component:** `components/ui/Skeleton.tsx:9-13` — Generic `shimmer rounded animate-pulse bg-ivory-dark` div.

**Verdict: ⚠️ PARTIAL — Only discover and outfit reviews use proper skeletons; 4 pages use spinners only**

---

## RENTER JOURNEY SUMMARY

| # | Area | Verdict | Key Issue |
|---|------|---------|-----------|
| 1 | Profile | ⚠️ PARTIAL | No loading skeleton; business tab visible to renters |
| 2 | Addresses | ✅ PASS | Full CRUD, empty states, mobile responsive |
| 3 | Wishlist | ⚠️ PARTIAL | No skeleton loader; hardcoded price fallback |
| 4 | Cart | ✅ PASS | Complete page + drawer; all features working |
| 5 | Bookings | ⚠️ PARTIAL | Cancel not wired; no pagination; spinner only |
| 6 | Returns | ❌ FAIL | No dedicated returns flow; status transitions only |
| 7 | Reviews | ⚠️ PARTIAL | Create + list works; no my-reviews page |
| 8 | Support Tickets | ✅ PASS | Full ticket lifecycle |
| 9 | AI Stylist History | ⚠️ PARTIAL | Drawer works; no standalone history page |
| 10 | Mobile | ⚠️ PARTIAL | Most responsive; missing hamburger menu |
| 11 | Empty States | ✅ PASS | All pages covered |
| 12 | Skeleton Loaders | ⚠️ PARTIAL | Only 2 of 8 loading pages use proper skeletons |

---

## CRITICAL GAPS (Must Fix)

### 1. Returns Flow (FAIL)
- **No `/returns` page** — returns are handled as status transitions in orders
- **No return tracking** — no way to see return shipping status
- **No return policy page** — only mentioned in AI stylist fallback text
- **No return pickup scheduling** — no date/time selection for courier pickup
- **Backend gap:** No dedicated returns API endpoint

### 2. Cancel Booking (Not Wired)
- `bookingsAPI.cancel(id, reason)` exists at `lib/api.ts:259-261`
- **No cancel button** in `app/orders/page.tsx` — should appear for `pending` and `confirmed` statuses
- Need confirmation modal with reason input

### 3. Missing Skeleton Loaders
Replace spinners with skeleton components in:
- `app/profile/page.tsx:198-205` → Profile skeleton (banner + tabs + content)
- `app/orders/page.tsx:171-178` → Order card skeletons
- `app/wishlist/page.tsx:60-67` → Wishlist grid skeletons
- `app/support/page.tsx:185-189` → Use `Skeleton` component instead of raw divs

### 4. Mobile Hamburger Menu
- `components/layout/RenterNavbar.tsx:38` — nav links hidden with `hidden md:flex`
- **No mobile menu toggle** — need hamburger icon + slide-out nav for mobile
- Currently only way to access catalog on mobile is via `/discover` link or AI stylist

---

## RECOMMENDED IMPROVEMENTS (Should Fix)

| Priority | Area | Improvement |
|----------|------|-------------|
| High | Returns | Create `/returns` page with return status tracking and pickup scheduling |
| High | Orders | Wire cancel booking button with confirmation modal |
| High | Navbar | Add hamburger menu for mobile navigation |
| Medium | Profile | Add skeleton loader matching layout structure |
| Medium | Orders | Add skeleton card loader instead of spinner |
| Medium | Wishlist | Add skeleton grid loader |
| Medium | Profile | Hide business tab for non-seller users |
| Medium | Reviews | Add "My Reviews" section in profile |
| Low | AI Stylist | Add standalone `/ai-stylist/history` page |
| Low | Support | Add ticket detail expand/modal view |
| Low | Orders | Add pagination or load-more for large order lists |
| Low | Reviews | Add photo upload in review creation |

---

## FILE REFERENCE MAP

| Feature | Primary File | API Functions Used |
|---------|-------------|-------------------|
| Profile | `app/profile/page.tsx` | `userAPI.getProfile`, `userAPI.updateProfile` |
| Addresses | `app/profile/page.tsx` (addresses tab) | `userAPI.getAddresses`, `addAddress`, `deleteAddress`, `setDefaultAddress` |
| Wishlist | `app/wishlist/page.tsx` | `useWishlistStore` → `outfitsAPI.getWishlist`, `removeFromWishlist` |
| Cart | `app/cart/page.tsx` + `components/cart/CartDrawer.tsx` | `useCartStore` (client-side) |
| Bookings | `app/orders/page.tsx` | `bookingsAPI.listMyBookings`, `updateStatus` |
| Cancel | `lib/api.ts:259-261` | `bookingsAPI.cancel` (exists, not wired) |
| Reviews | `app/orders/page.tsx` (modal) + `app/outfit/[id]/page.tsx` | `reviewsAPI.create`, `reviewsAPI.listOutfitReviews` |
| Support | `app/support/page.tsx` | `supportAPI.createTicket`, `supportAPI.getMyTickets` |
| AI Stylist | `components/ai/AIStylistDrawer.tsx` | `client.post('/ai/chat')` |
| Discover | `app/discover/page.tsx` | `outfitsAPI.browse` |
| Checkout | `app/booking/checkout/page.tsx` | `bookingsAPI.create`, `paymentsAPI.verify` |

---

*This audit covers the complete renter journey as of 2026-06-16. No seller files were examined or modified.*

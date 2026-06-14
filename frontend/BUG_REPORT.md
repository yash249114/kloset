# Kloset Luxe — Frontend Bug Report

**Generated:** 2026-06-14  
**Codebase:** Next.js 16.2.6 (Turbopack) / React 19.2.4 / Tailwind CSS

---

## Severity Definitions

| Severity | Meaning |
|----------|---------|
| **P0**   | Critical — renders core functionality unusable; users cannot complete a primary flow |
| **P1**   | High — significant feature broken or missing; impacts a large portion of users |
| **P2**   | Medium — feature partially broken or has a poor UX workaround |
| **P3**   | Low — cosmetic, edge-case, or non-functional in dev only |

---

## P0 — Critical

### BUG-001: Non-standard CSS classes on homepage (`btn`, `badge`, `input-kloset`)

**Location:** `app/page.tsx` — Lines 236, 244, 866 (and numerous others)

**Description:** The homepage uses CSS class names that are **not** Tailwind utility classes:
- `btn btn-gold`, `btn btn-primary`, `btn btn-outline`, `btn btn-ghost` (button elements)
- `input-kloset` (input fields)
- `badge badge-sage` (badge elements)

The rest of the application uses a `Button` component with a `variant` prop (`primary`/`outline`/`ghost`/`gold`). The homepage bypasses this component entirely and writes raw `btn-*` classes. If `globals.css` does not define these classes, **every homepage button, input, and badge renders as an unstyled HTML element**, making the hero section and all CTAs invisible/interactive.

**Impact:** All first-visit users see a broken landing page with no visible buttons or inputs.

---

## P1 — High

### BUG-002: Zero `loading.tsx` or `error.tsx` boundaries

**Location:** All 40 route directories under `app/`

**Description:** Next.js supports `loading.tsx` (automatic Suspense boundary) and `error.tsx` (error recovery boundary) per route segment. None of the 40 pages define either file. Some pages implement manual inline loading spinners, but there is no error boundary anywhere. If any API call or component throws during server-side rendering or static generation, the entire app shows a white screen with no recovery path.

**Impact:** Any uncaught runtime error results in a completely blank page. Users on slow connections see a flash of unstyled content before client-side loading states mount.

---

### BUG-003: Admin/Seller sidebars not mobile responsive

**Location:**
- `components/layout/AdminSidebar.tsx`
- `components/layout/SellerSidebar.tsx`

**Description:** Both sidebars are fixed at 240 px wide. The main content area uses `ml-[240px]`. There is no hamburger toggle, no collapse mechanism, and no media query to hide the sidebar on small viewports. On tablets and phones the sidebar occupies 240 px of horizontal space, pushing content off-screen or causing horizontal overflow.

**Impact:** The admin and seller dashboards are unusable on mobile devices.

---

### BUG-004: Standalone `/cart` page does not exist

**Location:** `app/cart/` directory is missing

**Description:** There is no route page at `app/cart/page.tsx`. The cart is only accessible via the `CartDrawer` slide-in panel. Navigating directly to `/cart` returns a 404. Users cannot bookmark, share, or SEO-index a cart page.

**Impact:** Direct navigation to `/cart` breaks. No standalone cart page exists for linking or search engines.

---

### BUG-005: Duplicate auth routes (`/login` + `/auth/login`)

**Location:**
- `app/login/page.tsx`
- `app/auth/login/page.tsx`
- `app/register/page.tsx`
- `app/auth/register/page.tsx`

**Description:** Both `/login` and `/auth/login` exist as separate route directories. Same for `/register` and `/auth/register`. These may render identical or diverging pages. Search engines see duplicate content. Auth redirects may target the wrong route depending on the context.

**Impact:** Inconsistent auth entry points, duplicate SEO content, and potential redirect confusion.

---

### BUG-006: Toast-only placeholder buttons (no real functionality)

**Location:**
- `app/profile/wallet/page.tsx` — "Withdraw Payout" / "Add Wallet Credits"
- `app/support/page.tsx` — "Live Chat" / "Phone Support"

**Description:** Multiple buttons in the profile/wallet and support pages do nothing except display a toast notification:
- "Withdraw Payout" → toast `"Payout settlement automated"`
- "Add Wallet Credits" → toast `"Credits can be loaded at checkouts"`
- "Live Chat" → toast `"Live chat coming soon"`
- "Phone Support" → toast with business hours

These features appear functional but are completely non-functional. Users may believe an action was performed when nothing happened.

**Impact:** Misleading UI — users think they are performing real actions.

---

### BUG-007: Newsletter form submits without API call

**Location:** `app/page.tsx` — Newsletter section ("Join the Circle")

**Description:** The homepage newsletter email form shows a success toast on submission but never calls an API endpoint. No email address is captured or stored anywhere. Users believe they have subscribed but nothing occurs.

**Impact:** Zero email capture — all newsletter sign-ups are silently lost.

---

### BUG-008: Designer avatar circles have no click action

**Location:** `app/page.tsx` — Designer showcase section

**Description:** Designer avatars (Sabyasachi, Manish Malhotra, etc.) are styled with `cursor-pointer` and hover effects but have no `onClick` handler or `<Link>` wrapper. Clicking a designer card does nothing.

**Impact:** Interactive-looking elements with no action — users are led to believe they can browse a designer's collection but nothing happens.

---

## P2 — Medium

### BUG-009: Seller Spotlight cards all link to `/discover`

**Location:** `app/page.tsx` — "Seller Spotlight" section

**Description:** Every seller card's arrow button links to `/discover` (the generic catalog) instead of a seller-specific store or filtered listing page. No seller store or collection route exists in the application.

**Impact:** Users cannot browse a specific seller's offerings. Seller branding on the homepage leads to a generic page.

---

### BUG-010: Address management lacks edit functionality

**Location:** `app/profile/addresses/page.tsx`

**Description:** Users can add, delete, or set a default address, but **cannot edit** an existing address. Any typo or address change requires deleting and re-entering the entire address.

**Impact:** Poor UX for a common operation — address changes force data re-entry.

---

### BUG-011: No password change functionality

**Location:** `app/profile/` — no security/password section exists

**Description:** The profile page includes personal info, business settings, addresses, and wallet tabs. There is no password/security section anywhere. The "Forgot Password?" link on the login page points to `/support` (a generic contact page) rather than a password-reset flow.

**Impact:** Users cannot change their password. Password reset is unavailable — the only fallback is contacting support.

---

### BUG-012: Wallet ledger permanently shows empty state

**Location:** `app/profile/wallet/page.tsx`

**Description:** The escrow wallet tab always displays `"No transactions recorded"`. Even when the user has bookings or transactions, no API call is made to fetch transaction history. The wallet balance is read from the user profile object, but the transaction log remains permanently empty.

**Impact:** Users cannot see their transaction history. The wallet feature appears broken.

---

### BUG-013: Admin sidebar missing over half of known routes

**Location:** `components/layout/AdminSidebar.tsx`

**Description:** The following admin routes exist but are **not linked** in the AdminSidebar navigation:
- `/admin/listings`
- `/admin/orders`
- `/admin/payments`
- `/admin/support`
- `/admin/security`
- `/admin/analytics`

Only Overview, Users, Sellers, KYC, Transactions, Disputes, AIOps, and Settings appear in the sidebar. Admins must manually type URLs to access the missing pages.

**Impact:** Admin features are effectively hidden from navigation.

---

### BUG-014: Seller sidebar missing known routes

**Location:** `components/layout/SellerSidebar.tsx`

**Description:** The following seller routes exist but are **not linked** in the SellerSidebar:
- `/seller/inbox`
- `/seller/support`
- `/seller/profile`
- `/seller/reviews`

Sellers must manually navigate to these pages.

**Impact:** Seller features are hidden from navigation.

---

### BUG-015: Google OAuth button lacks error boundary

**Location:**
- `app/login/page.tsx`
- `app/register/page.tsx`

**Description:** The `GoogleLogin` component from `@react-oauth/google` is rendered without a React error boundary. If the Google OAuth SDK fails to load (ad blocker, network failure, script blocked), the `GoogleLogin` component may throw, crashing the entire login/register page.

**Impact:** Any OAuth SDK loading failure breaks the entire login page with no fallback or error message.

---

### BUG-016: Checkout date inputs lack min/max validation

**Location:** `app/checkout/page.tsx`

**Description:** The checkout form's date-range inputs for pickup/return dates have no `min` attribute set to today's date. Users can select a date in the past. No `max` date is enforced either, allowing dates years in the future.

**Impact:** Invalid booking dates can be submitted and only caught (if at all) by the backend.

---

## P3 — Low

### BUG-017: Admin pages use hardcoded hex colors instead of semantic tokens

**Location:** Files under `app/admin/` — widespread

**Description:** Admin pages use raw hex color values throughout:
- `text-[#C9A96E]`, `bg-[#1A1A1A]`, `text-[#E8E8E8]`, `text-[#8C8C8C]`

The renter/seller pages use semantic Tailwind color names like `text-champagne`, `bg-ivory`, `text-ink`. Admin theming is not aligned with the rest of the app, making future rebranding or dark-mode support difficult.

**Impact:** Theming inconsistency. Admin pages must be manually updated for any color change.

---

### BUG-018: Image previews use `URL.createObjectURL` — break on re-render

**Location:** `app/outfit/new/page.tsx`

**Description:** The create listing page uses `URL.createObjectURL(file)` for image previews. These object URLs are valid only for the current page session. If form submission fails validation and triggers a re-render, previews may break (display broken-image icons). The seller's create/edit modal uses the `ImageUploader` component which at least attempts Cloudinary upload.

**Impact:** Image previews may disappear on form validation errors.

---

### BUG-019: Cloudinary upload silently falls back to mock mode

**Location:** `lib/cloudinary.ts`

**Description:** The upload function checks `if (CLOUD_NAME === 'demo' || CLOUD_NAME === 'your_cloud_name')` and returns local object URLs instead of uploading to Cloudinary. If environment variables are not configured (likely in development), images are never persisted to cloud storage — they exist only as ephemeral browser URLs that vanish on refresh.

**Impact:** Image upload appears to succeed but images are lost on page reload in non-configured environments. No warning is shown to the developer or user.

---

### BUG-020: AIOps latency chart data is synthetic

**Location:** `app/admin/aiops/page.tsx`

**Description:** After the "hotfix" that replaced `Math.random()`, the latency chart still generates synthetic data points centered on the real `latency_avg_ms` value. It is not per-request time-series data from the backend. The chart displays realistic-looking but ultimately artificial data.

**Impact:** AIOps metrics are misleading — operators cannot trust the latency visualization.

---

### BUG-021: Empty auction states use inconsistent styling

**Location:**
- `app/discover/page.tsx` — `btn btn-gold`
- `app/wishlist/page.tsx` — `btn btn-primary`
- `app/orders/page.tsx` — `<Link>` with `btn btn-primary`
- `app/support/page.tsx` — `<Link>` with `btn btn-primary`

**Description:** Empty-state CTAs across the app use different approaches — some use raw `btn-*` classes, some use `<Link>` with `btn btn-primary`. Depending on whether `globals.css` defines these classes, empty states may render differently or break entirely.

**Impact:** Inconsistent empty-state appearance. Some empty states may be completely broken if CSS classes are undefined.

---

### BUG-022: No delete confirmation for wishlist removal

**Location:** `app/wishlist/page.tsx`

**Description:** The wishlist remove button (trash icon) deletes the item immediately without a confirmation dialog. On mobile, the hover-based overlay controls may be accidentally triggered, resulting in unintended removals.

**Impact:** Accidental wishlist deletions have no undo or confirmation.

---

### BUG-023: Auth redirect on 401 goes to `/login` instead of `/auth/login`

**Location:** `lib/api.ts` — Lines 98, 134

**Description:** The Axios response interceptor redirects unauthenticated users to `/login` when token refresh fails. Given the duplicate auth routes (BUG-005), this may send users to a different login page than the one at `/auth/login` that other parts of the app reference.

**Impact:** Inconsistent auth redirect destination compounds the duplicate-routes problem (BUG-005).

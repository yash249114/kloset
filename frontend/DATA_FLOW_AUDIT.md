# Data Flow Audit — Kloset Luxe Frontend

## API Client Layer

All API calls route through `lib/api.ts` (Axios instance) with:
- Automatic token refresh on 401 responses
- Redirect to `/login` on refresh failure
- Base URL: `localhost:8080/api/v1`

**Issue**: Auth redirect goes to `/login` (404) instead of `/auth/login`.

---

## Data Consistency by Domain

### 1. Addresses

| Source | API Endpoint | Used In | Status |
|--------|-------------|---------|--------|
| `userAPI.getAddresses()` | GET `/users/addresses` | Profile, Checkout, Orders | ✅ Consistent |

- Same API call across all surfaces
- Addresses can be added but **not edited or deleted** — partial CRUD

### 2. Bookings / Orders

| Source | API Endpoint | Used In | Status |
|--------|-------------|---------|--------|
| `bookingsAPI` | Various `/bookings/*` | Orders, Checkout, Seller orders | ✅ Consistent |

- Status transitions managed through dedicated endpoints
- Review and dispute modals work but **can be opened without proper booking context**

### 3. Authentication State

| Storage | Mechanism | Status |
|---------|-----------|--------|
| Zustand persist | localStorage / cookie | ✅ Consistent |

- Token, user object, and role persisted
- Hydrated on app load
- Consistent across all protected routes

### 4. Cart

| Storage | Mechanism | Status |
|---------|-----------|--------|
| Zustand persist middleware | localStorage | ✅ Consistent |

- Persisted across sessions
- Only accessible via drawer — no `/cart` page
- No stale data cleanup (e.g., items that are no longer available)

### 5. Wishlist

| Behavior | Status |
|----------|--------|
| Fetched on mount via `fetchWishlist()` | ✅ Consistent |
| Add/Remove via API | ✅ Works |
| Delete confirmation | ❌ Missing — items removed immediately without prompt |

### 6. Image Uploads

| Component | Method | Status |
|-----------|--------|--------|
| Outfit listing images | Cloudinary upload + object URL fallback | ❌ INCONSISTENT |
| Profile avatar | Different upload flow | ❌ INCONSISTENT |

**Issues:**
- Object URLs (`URL.createObjectURL()`) are not revoked on component unmount
- Re-render causes broken image previews as object URLs are regenerated
- Some upload flows use Cloudinary, others fall back silently to mock/local data
- No uniform upload utility/component

### 7. Homepage Data

| Section | Data Source | Status |
|---------|-------------|--------|
| Trending outfits | Mock data | ❌ INCONSISTENT |
| New arrivals | Mock data | ❌ INCONSISTENT |
| Designer highlights | Mock data | ❌ INCONSISTENT |
| Top sellers | Mock data | ❌ INCONSISTENT |
| Reviews | Mock data | ❌ INCONSISTENT |

- All other pages use real API data
- Homepage uses hardcoded mock objects
- Designer avatars are non-interactive (no profile link)

### 8. Wallet / Earnings

| Data Point | Source | Status |
|-----------|--------|--------|
| Wallet balance | From user object on auth | ✅ Available |
| Transaction history | Never fetched from API | ❌ INCOMPLETE |

- Wallet tab in profile shows balance but ledger is always empty
- API endpoint may exist but is never called
- Withdraw button is a toast-only placeholder

### 9. Notifications / Newsletters

| Feature | Behavior | Status |
|---------|----------|--------|
| Newsletter signup | Form UI exists, no API call on submit | ❌ INCOMPLETE |
| Live chat button | Toast-only placeholder | ❌ Missing |
| Phone support button | Toast-only placeholder | ❌ Missing |

---

## Data Flow Diagram (Text)

```
User Action → Zustand Store / Local State → Axios API Call → Backend (Go) → PostgreSQL
                    ↓
            Response Handler
                    ↓
            Update Store State ↔ Re-render UI
                    ↓
            Error Handler → Toast / Redirect
```

**Breakage Points:**
1. Mock data on homepage bypasses this entire flow
2. Newsletter form has no API call — data goes nowhere
3. Wallet ledger never initiates the API call
4. Image uploads have inconsistent paths (Cloudinary vs local)
5. Razorpay falls back to a key that may not work in production

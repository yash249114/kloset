# Renter Experience Audit — Kloset Luxe Frontend

## Route Overview

| Route | Page | Status |
|-------|------|--------|
| `/` | Homepage | ⚠️ Mock data, non-Tailwind CSS classes |
| `/discover` | Browse & Search | ✅ Real API data |
| `/outfit/[id]` | Product Detail | ✅ Real API data |
| `/booking/checkout` | Checkout | ⚠️ Date validation missing |
| `/orders` | Orders | ✅ Real API data |
| `/profile` | Profile (4 tabs) | ⚠️ Missing features |
| `/wishlist` | Wishlist | ✅ Real API data |
| `/support` | Support / Tickets | ✅ Real API data |
| `/auth/login` | Login | ✅ Functional |
| `/auth/register` | Register | ✅ Functional |
| `/login` | Duplicate auth | ❌ 404 — does not exist |
| `/cart` | Cart page | ❌ 404 — does not exist |
| `/outfit/new` | Create Listing | ✅ Functional (seller flow) |

---

## Detailed Findings

### 1. Homepage (`/`)
| Section | Issue |
|---------|-------|
| Trending outfits | Uses mock data, not real API |
| New arrivals | Uses mock data, not real API |
| Designer highlights | Uses mock data, avatars non-interactive |
| Top sellers | Uses mock data, cards link to `/discover` (generic) |
| Reviews | Uses mock data |
| All CTA buttons | Use `btn btn-gold`, `btn btn-primary`, `btn btn-outline` — non-Tailwind classes |
| Newsletter | UI form exists but no API call on submit |
| "Live Chat" button | Toast-only placeholder |
| "Phone Support" button | Toast-only placeholder |

**Severity**: ❌ High — homepage is the first impression and contains fake data and broken CSS

### 2. Discover / Browse (`/discover`)
| Feature | Status |
|---------|--------|
| Search bar | ✅ Works via API |
| Category filter | ✅ Works |
| Price range filter | ✅ Works |
| Size filter | ✅ Works |
| Color filter | ✅ Works |
| Occasion filter | ✅ Works |
| Rating filter | ✅ Works |
| Sort (price, rating, new) | ✅ Works |
| Mobile filter drawer | ✅ Responsive |
| Outfit grid with pagination | ✅ Works |

**Rating**: ✅ Fully functional

### 3. Product Detail (`/outfit/[id]`)
| Feature | Status |
|---------|--------|
| Image gallery | ✅ Works |
| Size selector | ✅ Works |
| Date picker | ✅ Works (no min/max validation) |
| Price display | ✅ Works |
| Book now button | ✅ Works |
| Reviews section | ✅ Works |
| Recommendations | ✅ Works |
| Wishlist toggle | ✅ Works |

**Rating**: ✅ Good, minor date validation gap

### 4. Cart
| Feature | Status |
|---------|--------|
| Cart drawer | ✅ Works (add/remove/update quantities) |
| `/cart` page | ❌ 404 — not implemented |
| Checkout link from cart | ✅ Works |

**Rating**: ⚠️ Missing dedicated page but drawer functional

### 5. Checkout (`/booking/checkout`)
| Feature | Status |
|---------|--------|
| Date range picker | ✅ Renders, no min/max validation |
| Address selector | ✅ Fetches from `userAPI.getAddresses()` |
| Add new address | ✅ Works |
| Booking summary | ✅ Shows item details and total |
| Razorpay integration | ✅ Triggers payment |
| Fallback Razorpay key | ⚠️ Uses fallback when env var missing |
| Post-payment redirect | ✅ Goes to orders page |

**Rating**: ⚠️ Missing date constraints, fragile payment config

### 6. Orders (`/orders`)
| Feature | Status |
|--------|--------|
| Booking list | ✅ Real data from API |
| Status badges | ✅ pending → confirmed → active → completed |
| Cancel action | ✅ Works |
| Review modal | ⚠️ Can open without proper context |
| Dispute modal | ⚠️ Can open without proper context |

**Rating**: ✅ Core functional, modals need context validation

### 7. Profile (`/profile`)
| Tab | Features | Status |
|-----|----------|--------|
| Personal Info | Name, email, phone, avatar | ✅ Works |
| Addresses | List, add address | ⚠️ No edit, no delete |
| Business | Seller business details | ✅ Works |
| Wallet | Balance display | ⚠️ Transaction log always empty, Withdraw is placeholder |

**Missing features**:
- ❌ Change password
- ❌ Edit address
- ❌ Delete address
- ❌ View transaction history
- ❌ Withdraw to bank (toast-only)
- ❌ Account deletion

**Rating**: ⚠️ Partial — reads work, writes are limited

### 8. Wishlist (`/wishlist`)
| Feature | Status |
|---------|--------|
| Grid display | ✅ Works |
| Add to wishlist | ✅ Works |
| Remove from wishlist | ✅ Works |
| Delete confirmation | ❌ Removed immediately without prompt |

**Rating**: ⚠️ Minor UX — missing confirmation

### 9. Support (`/support`)
| Feature | Status |
|---------|--------|
| Contact cards | ✅ Works |
| Ticket system | ✅ Create/view/reply |
| "Live Chat" button | ❌ Toast-only placeholder |
| "Phone Support" button | ❌ Toast-only placeholder |

**Rating**: ⚠️ Ticket system works, chat/phone are placeholders

### 10. Auth
| Feature | Status |
|---------|--------|
| Login page (`/auth/login`) | ✅ Works |
| Register page (`/auth/register`) | ✅ Works |
| Google OAuth | ✅ Integrated |
| Role selector | ✅ Works |
| Auth redirect | ❌ Goes to `/login` (404) instead of `/auth/login` |
| `/login` route | ❌ 404 |
| OAuth error handling | ❌ No error boundary for Google OAuth failures |

**Rating**: ⚠️ Duplicate routes, broken redirect, missing OAuth error boundary

---

## Summary of Missing Features

| Feature | Impact |
|---------|--------|
| Password change | Account security |
| Password reset | Account recovery |
| Account deletion | Data privacy compliance |
| Order tracking | Customer experience |
| Order cancellation | Customer experience |
| Guest checkout | Conversion optimization |
| Saved address management (edit/delete) | User experience |
| Transaction history | Financial transparency |

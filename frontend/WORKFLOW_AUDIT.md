# Workflow Audit — Kloset Luxe Frontend

## 1. Renter Flow

### Expected Flow
```
Registration → Login → Browse/Discover → Filter → Product View → Cart → Checkout → Payment → Order → Profile → Logout
```

### Actual Flow & Issues

| Step | Status | Issues |
|------|--------|--------|
| Registration | ✅ Works | Google OAuth + email/password + role selector all functional |
| Login | ⚠️ Broken redirect | Auth redirect goes to `/login` which is a 404; should go to `/auth/login` |
| Browse/Discover | ✅ Works | Search, filter, sort, grid all functional via real API |
| Filter | ✅ Works | Price range, category, size, color, occasion, rating filters all hit API |
| Product View | ✅ Works | Images, size selector, date picker, booking button, reviews, recommendations all render |
| Cart | ❌ Broken | No `/cart` route exists (404). Cart is only accessible via a drawer component — no dedicated page |
| Checkout | ⚠️ Partial | Date selection lacks `min`/`max` validation on date inputs. Address selection works. Booking form submits. No "back to cart" or "continue shopping" path |
| Payment | ⚠️ Fragile | Razorpay integration uses a fallback key when `NEXT_PUBLIC_RAZORPAY_KEY_ID` env var is missing. Will silently degrade in production if env misconfigured |
| Order | ✅ Works | Redirect to orders page after successful payment with correct booking data |
| Profile | ❌ Missing features | No edit address, no change password, wallet ledger always shows empty |
| Logout | ✅ Works | Clears Zustand state and redirects to home |

### Missing Steps
- No email verification step after registration
- No guest checkout / browse-without-account path
- No saved addresses management (add works, edit/delete missing)
- No order cancellation flow
- No order tracking / delivery status
- No password reset flow

---

## 2. Seller Flow

### Expected Flow
```
Registration → Create Listing → Upload Images → Edit Listing → Submit for Approval → View Orders → Analytics → Earnings → Logout
```

### Actual Flow & Issues

| Step | Status | Issues |
|------|--------|--------|
| Registration | ✅ Works | Role selection includes "seller" option |
| Create Listing | ✅ Works | `/outfit/new` form with all fields (title, description, size, price, category, images) |
| Upload Images | ⚠️ Fragile | Uses Cloudinary upload with object URL fallback. Object URLs break on re-render (memory leak risk). Some upload flows work, some silently fall back to mock |
| Edit Listing | ✅ Works | Edit modal on seller listings page pre-fills form and submits updates |
| Submit for Approval | ✅ Works | Status change from draft → pending via API call |
| View Orders | ✅ Works | Orders page shows booking data from API with status transitions |
| Analytics | ⚠️ Needs verification | Route exists, data source not confirmed real vs mock |
| Earnings | ⚠️ Needs verification | Route exists, wallet balance from user object but transaction log never fetched |
| Logout | ✅ Works | Same as renter |

### Missing Steps
- No bulk image upload or reordering
- No inventory management (stock count per size)
- No listing analytics (views, impressions)
- No approval status notifications (seller doesn't know when listing is approved)
- No communication with admin (dispute/inquiry on rejected listings)

### Incorrect Steps
- Seller cards on homepage link to `/discover` (generic) instead of seller's specific listings or profile page

---

## 3. Admin Flow

### Expected Flow
```
Login → Dashboard Overview → User Management → KYC → Listings → Disputes → AIOps → Settings
```

### Actual Flow & Issues

| Step | Status | Issues |
|------|--------|--------|
| Login | ✅ Works | Standard auth flow |
| Dashboard | ✅ Works | KPI stats from `adminAPI.getStats()`, revenue chart from `adminAPI.getRevenueData()` — real data |
| User Management | ⚠️ Partial | No search or filter on users table. Cannot sort columns |
| KYC | ⚠️ Partial | Approval/reject API exists, but no confirmation dialog before action (risk of accidental clicks) |
| Listings | ❌ Hidden | Page exists at `/admin/listings` but no link in sidebar — must navigate by URL |
| Orders | ❌ Hidden | Page exists at `/admin/orders` but no sidebar link |
| Payments | ❌ Hidden | Page exists at `/admin/payments` but no sidebar link |
| Disputes | ⚠️ Partial | Page accessible but modals can be opened without proper booking context |
| AIOps | ❌ Synthetic | Latency data is fabricated/synthetic — not real API data despite endpoint existing |
| Settings | ✅ Works | Page exists and is linked |
| Support | ❌ Hidden | Page exists at `/admin/support` but no sidebar link |
| Security | ❌ Hidden | Page exists at `/admin/security` but no sidebar link |
| Analytics | ❌ Hidden | Page exists at `/admin/analytics` but no sidebar link |

### Missing Steps
- No bulk user actions (suspend, delete, role change)
- No activity/audit log
- No notification system for disputes or KYC submissions
- No export functionality for tables (users, orders, payments)

### Incorrect Steps
- Sidebar is missing 6 route links that have corresponding pages
- Admin sidebar is not mobile responsive

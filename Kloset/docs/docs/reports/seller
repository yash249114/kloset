# Seller Panel Audit — Kloset Luxe Frontend

## Route Overview

| Route | Page Exists | Sidebar Link | Data Source | Status |
|-------|------------|--------------|-------------|--------|
| `/seller` | ✅ | ✅ Dashboard | `sellerAPI.getDashboardStats()` — real API | ✅ Working |
| `/seller/listings` | ✅ | ✅ Listings | `sellerAPI.getSellerListings()` — real API | ✅ Working |
| `/seller/orders` | ✅ | ✅ Orders | `bookingsAPI` — real API | ✅ Working |
| `/seller/analytics` | ✅ | ✅ Analytics | Data source unconfirmed | ⚠️ Needs verification |
| `/seller/earnings` | ✅ | ✅ Earnings | Wallet from user object, no transaction log | ⚠️ Partial |
| `/seller/inbox` | ✅ | ❌ Missing | Likely real API | ❌ No sidebar link |
| `/seller/support` | ✅ | ❌ Missing | Ticket system | ❌ No sidebar link |
| `/seller/profile` | ✅ | ❌ Missing | `userAPI` | ❌ No sidebar link |
| `/seller/reviews` | ✅ | ❌ Missing | API — product reviews | ❌ No sidebar link |

**Total routes: 9 — Sidebar shows 5 — 4 routes hidden**

---

## Detailed Findings

### 1. Sidebar Navigation
- **Missing links**: `/seller/inbox`, `/seller/support`, `/seller/profile`, `/seller/reviews`
- Pages exist and are functional but have no sidebar navigation entry
- Same problem as admin panel — static sidebar config not updated
- **Severity**: High — sellers cannot navigate to these pages

### 2. Dashboard
- KPI cards: Total Listings, Active Listings, Total Orders, Revenue, Pending Approvals
- Recent Bookings table shows latest orders with customer info and status
- Uses real API data via `sellerAPI.getDashboardStats()`
- **Rating**: ✅ Good

### 3. Listings (CRUD)
- **Create**: Full form with title, description, category, size, price, images — works
- **Read**: Grid view of all seller listings with status badges — works
- **Update**: Edit modal pre-fills form data and submits updates via API — works
- **Delete**: Delete action with confirmation — works
- **Submit for Approval**: Status change from draft → pending — works
- **Image Upload**: Uses Cloudinary with object URL fallback — inconsistent
- **Rating**: ✅ Core CRUD functional but image uploads fragile

### 4. Orders
- Lists booking requests for seller's outfits
- Status: pending, confirmed, active, completed, cancelled, returned
- Each status has appropriate action buttons (confirm, mark completed, etc.)
- Real booking data from `bookingsAPI`
- **Rating**: ✅ Good

### 5. Analytics
- Route exists at `/seller/analytics`
- Likely shows listing views, conversion rates, revenue trends
- **Data source unconfirmed** — needs verification that it's real vs mock
- **Rating**: ⚠️ Needs verification

### 6. Earnings
- Shows wallet balance and earnings summary
- **Transaction log/history never fetched from API**
- Wallet tab shows balance from user object but list is empty
- **Withdraw button is a toast-only placeholder** — no actual payout flow
- **Rating**: ❌ Incomplete feature

### 7. Approval Workflow
- Seller creates listing → listing is "draft"
- Seller submits → listing becomes "pending"
- Admin approves → listing becomes "active"
- **Seller has no notification** when listing is approved/rejected
- No way to appeal rejection or communicate with admin
- **Rating**: ⚠️ Missing feedback loop

### 8. Mobile Responsiveness
- **Seller sidebar is not mobile responsive**
- Same issue as admin panel — sidebar does not adapt to mobile screens
- **Rating**: ❌ Blocks mobile seller usage

---

## Recommendations

1. Add all 4 missing routes to seller sidebar navigation
2. Verify analytics data is real (not mock/synthetic)
3. Implement transaction log fetch for earnings page
4. Replace toast-only Withdraw button with actual payout integration
5. Add notification system for listing approval/rejection status changes
6. Make seller sidebar responsive for mobile
7. Fix image upload consistency — use single Cloudinary utility component

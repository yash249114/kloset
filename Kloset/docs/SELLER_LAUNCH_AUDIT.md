# Seller Launch Audit — Marketplace Integration

**Date**: 2026-06-16  
**Build**: `npm run build` — ✅ 51 pages, 0 errors  
**Scope**: 7 integration flows × 4 dimensions (API, loading, error, success)

---

## 1. Seller Listing Creation

**Page**: `/seller/listings`  
**API**: `outfitsAPI.create()`, `outfitsAPI.update()`, `outfitsAPI.delete()`, `outfitsAPI.submitForApproval()`  
**Endpoint**: `POST /outfits`, `PUT /outfits/:id`, `DELETE /outfits/:id`, `PUT /outfits/:id/submit`

| Dimension | Verdict | Detail |
|-----------|---------|--------|
| API integration | ⚠️ P1 | Hardcoded `occasions: ['wedding', 'reception']`, `colors: ['Gold', 'Ivory']`, `accessories_included: []` — no form fields for these. Sellers cannot customize occasions, colors, or accessories. |
| Loading state | ✅ | Shimmer grid on initial load |
| Error handling | ✅ | Per-operation `toast.error()` with descriptive messages |
| Success state | ✅ | `toast.success()` + modal close + list refresh |

### Issues

| Priority | Issue | Details |
|----------|-------|---------|
| P1 | Occasions/colors/accessories not editable | `handleCreateListing` and `handleEditListing` send hardcoded values. Add form fields for `occasions`, `colors`, `accessories_included`. |
| P1 | City defaults to Mumbai | `useState('Mumbai')` should be empty string so seller must enter city |
| P2 | No price validation | `price1Day`, `price3Day` etc are `Number()` typecast — can become `NaN` or negative |
| P2 | No listing status filter | Page shows all statuses with no way to filter by `draft`, `pending_approval`, `active` |
| P2 | No pagination | `getSellerOutfits(1)` — hardcoded page 1 |
| P2 | Edit modal missing city/state/pincode | `openEditModal` sets them but they are not rendered in the edit form → city/state/pincode are always empty on edit (they ARE rendered, but see lines 642-645) — actually they are rendered. This is accurate. |

---

## 2. Seller Image Uploads

**Component**: `components/upload/ImageUploader.tsx`  
**API**: Cloudinary unsigned upload via `lib/cloudinary.ts`  
**Config**: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

| Dimension | Verdict | Detail |
|-----------|---------|--------|
| API integration | ⚠️ P0 | **Dev/demo mode returns `blob:` Object URLs** that are temporary. When `CLOUD_NAME === 'demo'`, `uploadImage()` uses `URL.createObjectURL(file)` which is an in-memory URL that breaks on page refresh. Listings created in dev mode will display broken images after reload. |
| Loading state | ✅ | Per-file progress bar with `Loader2` spinner + percentage |
| Error handling | ⚠️ P2 | Upload error handler catches but does not surface the actual error message from Cloudinary |
| Success state | ✅ | `toast.success()` per file + gallery grid updates in real-time |

### Issues

| Priority | Issue | Details |
|----------|-------|---------|
| P0 | Dev mode Object URLs don't persist | `lib/cloudinary.ts:36` — `URL.createObjectURL(file)` makes listings non-functional across refreshes in dev. Must either use real Cloudinary config or persist in localStorage. |
| P1 | No image delete from Cloudinary | `removeImage` removes from local state only. The image remains on Cloudinary. Need a `DELETE /outfits/images/:cloudinary_id` endpoint. |
| P1 | No primary image enforcement | Create listing requires "at least one image" but no validation that one is marked primary. |
| P2 | No image reordering | Users cannot drag to reorder images — sort order is set by upload sequence only. |

---

## 3. Seller Payout Flow

**Pages**: `/seller/earnings`, `/seller/settings`  
**API**: `sellerPayoutAPI.withdraw()`, `bankAPI.*`, `upiAPI.*`  
**Endpoints**: `POST /seller/payouts/withdraw`, `GET/POST/PUT/DELETE /seller/bank-accounts`, `GET/POST/DELETE /seller/upi`

| Dimension | Verdict | Detail |
|-----------|---------|--------|
| API integration | ✅ | Bank account and UPI CRUD fully wired. Withdrawal calls real endpoint. |
| Loading state | ✅ | Shimmer on payout method card + earnings history table |
| Error handling | ⚠️ P1 | Catch blocks use `console.warn()` for bank/upi fetch — silent failure. Withdraw has proper toast. |
| Success state | ✅ | `toast.success()` + `ConfirmDialog` confirmation before withdrawal |

### Issues

| Priority | Issue | Details |
|----------|-------|---------|
| P1 | Payout history not fetched | Only completed booking amounts are shown — no actual payout transaction history (when withdrawals happened, how much, status). |
| P1 | Wallet balance not refreshed | `totalBalance` comes from `user?.wallet_balance` (auth store) — not fetched from API. If a payout completes, the balance won't update until next login. |
| P2 | No payout method editing | Settings page allows add/delete/set-default but not editing existing bank account or UPI. |
| P2 | No payout amount selector | "Withdraw to Bank" withdraws full `totalBalance`. No option to enter partial amount. |

---

## 4. Seller Booking Management

**Page**: `/seller/orders`  
**API**: `bookingsAPI.listSellerBookings()`, `bookingsAPI.updateStatus()`  
**Endpoints**: `GET /bookings/seller`, `PATCH /bookings/:id/status`

| Dimension | Verdict | Detail |
|-----------|---------|--------|
| API integration | ✅ | Full status transition flow implemented |
| Loading state | ✅ | Shimmer cards |
| Error handling | ✅ | Toast on failure |
| Success state | ✅ | `toast.success()` + optimistic state update |

### Issues

| Priority | Issue | Details |
|----------|-------|---------|
| P1 | No confirmation on status change | Clicking "Dispatched", "Mark Returned", etc. immediately triggers API. No undo or confirm. |
| P1 | Cancelled/disputed bookings hidden | `showUpdateAction` only checks `['confirmed', 'picked_up', 'returned', 'cleaning']`. Cancelled and disputed bookings show no action at all — seller cannot see or handle disputes from this page. |
| P2 | No status filter | All bookings returned, no way to filter by status |
| P2 | No pagination | `listSellerBookings(1, 20)` — hardcoded |
| P2 | No customer contact | Renter name shown but no link to inbox/message them directly |

---

## 5. Seller Support Workflow

**Pages**: `/seller/support`, `/seller/support/[ticketId]`  
**API**: `sellerSupportAPI.*`  
**Endpoints**: `GET /support/tickets`, `GET /support/tickets/:id`, `POST /support/tickets`, `POST /support/tickets/:id/reply`

| Dimension | Verdict | Detail |
|-----------|---------|--------|
| API integration | ✅ | 4 endpoints wired, full CRUD + reply |
| Loading state | ✅ | Shimmer on list + detail |
| Error handling | ✅ | Toast on failure |
| Success state | ✅ | `toast.success()` + list refresh + reply updates |

### Issues

| Priority | Issue | Details |
|----------|-------|---------|
| P1 | Duplicate API surfaces | Both `supportAPI.createTicket` (line 775) and `sellerSupportAPI.createTicket` (line 453) call `POST /support/tickets`. The old `supportAPI` object also has `getMyTickets`, `getAllTickets`, `updateStatus`, `addAgentReply` that are unused. This creates confusion — two APIs for the same backend. |
| P1 | `sellerSupportAPI.getTicketById` may not exist on backend | `GET /support/tickets/:id` is defined in frontend but not verified against backend routes. The old `supportAPI` only had `GET /support/tickets` (list). |
| P2 | No ticket status update from seller | Seller cannot mark a ticket as resolved once their issue is fixed |
| P2 | No ticket attachments | Description is plain text only — no file upload for evidence/screenshots |
| P2 | No real-time updates | Replies require manual page refresh — no polling or WebSocket |

---

## 6. Seller Notification Delivery

**Status**: ❌ **Not implemented on frontend**  
**Backend**: `backend/internal/notification/` — exists (handler, repository, model, service)

| Dimension | Verdict | Detail |
|-----------|---------|--------|
| API integration | ❌ P0 | No frontend integration for notifications. Backend has `service.go`, `repository.go`, `model.go`, `handler.go` but frontend never calls any notification endpoint. |
| Loading state | ❌ | N/A |
| Error handling | ❌ | N/A |
| Success state | ❌ | N/A |

### Issues

| Priority | Issue | Details |
|----------|-------|---------|
| P0 | No notification bell/indicator | `SellerSidebar.tsx` has no notification bell. No unread count badge anywhere in the seller UI. |
| P0 | No notification page | No `/seller/notifications` route |
| P1 | `Notification` type unused | Defined in `types/index.ts` but never imported by any frontend file |
| P1 | No notification polling or WebSocket | No mechanism to receive real-time alerts for new bookings, messages, or status changes |

---

## 7. Seller Review System

**Page**: `/seller/reviews`  
**API**: `reviewsAPI.listAll()`  
**Endpoint**: `GET /reviews?limit=10`

| Dimension | Verdict | Detail |
|-----------|---------|--------|
| API integration | ⚠️ P1 | `listAll()` fetches ALL reviews (not seller-specific). Backend may not filter by seller_id. Frontend receives all reviews across all sellers. |
| Loading state | ✅ | Shimmer cards |
| Error handling | ✅ | Sets `[]` on error |
| Success state | ✅ | Review cards with star ratings + quotes |

### Issues

| Priority | Issue | Details |
|----------|-------|---------|
| P1 | Rating summary hardcoded | `ratingSummary` state initializes with `{ avg: 4.8, total: 24, breakdown: { 5: 18, 4: 4, 3: 2, 2: 0, 1: 0 } }` — not computed from actual reviews. When real reviews load, the summary never updates. |
| P1 | Reviews not filtered by seller | `reviewsAPI.listAll()` returns `GET /reviews` — no seller_id filter. A seller might see reviews for other sellers' outfits. |
| P2 | No outfit-specific review view | Reviews are shown as a flat list — no grouping by outfit listing |
| P2 | No pagination | `limit=10` hardcoded with no load-more |

---

## Priority Summary

| Priority | Count | Key Items |
|----------|-------|-----------|
| **P0** | 3 | Dev mode Object URLs (listing images break), notification system missing entirely, no notification bell |
| **P1** | 11 | Hardcoded occasions/colors, no image Cloudinary cleanup, no seller-filtered reviews, hardcoded rating summary, cancelled/disputed bookings hidden, duplicate support APIs, wallet balance not refreshed |
| **P2** | 11 | Price validation, no listing filter, no pagination (multiple), no payout history, no amount selector, no ticket attachments, no status update from seller |

---

## Actionable Fixes

### P0 (Ship-blocking — fix before beta)

1. **Dev mode Object URLs** (`lib/cloudinary.ts:36`) — Replace `URL.createObjectURL(file)` with a dev adapter that uploads to a mock service or uses a real Cloudinary cloud name. Without this, all listings created in dev show broken images on refresh.

2. **Notification delivery** — Build notification integration:
   - Create `/seller/notifications` route
   - Add bell icon + unread count to `SellerSidebar.tsx`
   - Poll `GET /notifications` or wire WebSocket
   - Mark-as-read functionality

### P1 (High — launch with known issues but document)

3. **Listing form** — Add form fields for `occasions`, `colors`, `accessories_included` instead of hardcoding
4. **Image cleanup** — Add `DELETE /outfits/images/:cloudinary_id` endpoint + call on removal
5. **Reviews filter** — Change `GET /reviews` to `GET /seller/reviews` with seller_id filtering
6. **Rating summary computed** — Remove hardcoded defaults, compute `avg/total/breakdown` from fetched reviews
7. **Orders** — Add confirmation dialog on status change (same pattern as ConfirmDialog on listing delete)
8. **Cancelled/disputed orders** — Show these statuses in orders page with appropriate actions
9. **Wallet balance** — Fetch fresh `GET /auth/me` after withdrawal to update displayed balance
10. **Deduplicate support APIs** — Remove `supportAPI` object, migrate all callers to `sellerSupportAPI`

### P2 (Polish — address post-launch)

11. **Pagination** — Add to listings, orders, earnings, reviews
12. **Listing price validation** — Add `min={0}` and NaN checks on price inputs
13. **City default** — Change `useState('Mumbai')` to `useState('')`
14. **Payout history** — Add `GET /seller/payouts/history` endpoint + integration
15. **Partial withdrawal** — Add amount input on withdraw
16. **Ticket attachments** — Add image upload to support ticket creation
17. **Ticket resolve button** — Allow seller to mark ticket as resolved

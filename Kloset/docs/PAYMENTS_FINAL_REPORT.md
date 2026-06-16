# Payment Systems — Final Audit Report

**Date:** 2026-06-16  
**Repository:** `yash249114/Kloset`  
**Branch:** `release-candidate`  
**Audited scope:** Razorpay integration, deposits, refunds, payouts, commissions

---

## 1. Architecture Overview

Payments flow through four layers:

```
Renter (Browser)
    │
    ▼
Razorpay Checkout.js ──────┐
    │                       │
    ▼                       ▼
Kloset Backend (Go/Fiber)   Razorpay API (server-side)
    │                       │
    ▼                       ▼
PostgreSQL (transactions + bookings)
```

- **Frontend**: Razorpay Checkout.js SDK loaded dynamically, handles card/UPI/netbanking UX
- **Backend**: Custom `RazorpayClient` in `pkg/payment/razorpay.go` for API calls
- **Storage**: `transactions` table for ledger records, `bookings` table for payment breakdown

---

## 2. Razorpay Integration

### 2.1 Order Creation (`booking/service.go:createRazorpayOrder`)
- Calls `POST https://api.razorpay.com/v1/orders` with amount in paise
- Amount = `rentalAmount + securityDeposit + deliveryFee + platformFee`
- Returns Razorpay `order_id` stored on `Booking.RazorpayOrderID`
- **Dev mode**: returns `"order_simulated_<timestamp>"` when credentials are placeholder

### 2.2 Payment Verification (`payment/service.go:VerifyPayment`)
- Verifies HMAC-SHA256 signature via `razorpay.VerifySignature(orderID, paymentID, signature)`
- **Dev mode**: bypasses verification when signature is `"simulated_signature"`
- On success: updates booking `payment_status="completed"`, `status="confirmed"`, creates `Transaction(type: "rental_payment")`
- Sends `"booking_confirmed"` (renter) and `"booking_request"` (seller) notifications

### 2.3 Webhook Handling (`payment/service.go:HandleWebhook`)
- Verifies HMAC-SHA256 signature via `razorpay.VerifyWebhookSignature(payload, headerSignature)`
- Handles three events:
  - `payment.captured` → same logic as VerifyPayment
  - `payment.failed` → sets `payment_status="failed"`, notifies renter
  - `refund.processed` → sets `payment_status="refunded"`, creates `Transaction(type: "rental_refund")`, notifies renter

### 2.4 Refund API (`pkg/payment/razorpay.go:RefundPayment`)
- Calls `POST https://api.razorpay.com/v1/payments/{paymentID}/refund` with amount in paise
- Used by: cancellation flow (`booking.Service.Cancel()`) and dispute resolution (`admin.Service.ResolveDispute()`)

### 2.5 Client (`frontend/lib/razorpay.ts`)
- Loads `https://checkout.razorpay.com/v1/checkout.js` dynamically
- `openRazorpay()` returns a Promise resolving to `{ status: 'success' | 'failed' | 'dismissed', response }`
- Uses Razorpay's `handler` callback for success, `payment.failed` event for failure, `ondismiss` for cancellation

---

## 3. Payment Breakdown & Fee Calculation

### 3.1 Booking Amount Calculation (`booking/service.go:Create`)

| Component | Source | Example (₹5k/day, 3 days) |
|---|---|---|
| Rental amount | `pricePerDay × rentalDays` (tiered: 7d, 3d, or 1d pricing) | ₹15,000 |
| Security deposit | `outfit.security_deposit` | ₹5,000 |
| Delivery fee | `outfit.delivery_fee` (if delivery type) | ₹150 |
| Platform fee | `round(rentalAmount × PLATFORM_FEE_PERCENT / 100)` | ₹750 |
| **Total amount** | Sum of all above | **₹20,900** |

### 3.2 Platform Fee Configuration
- Default: **5%** via `PLATFORM_FEE_PERCENT` env var
- Stored in `Config.Platform.FeePercent` (default 5.0)
- Computed at booking creation, stored on `Booking.PlatformFee`
- **NOT tracked as a separate transaction** — no `Transaction(type: "platform_fee")` ever created

---

## 4. Transaction Lifecycle

### 4.1 Transaction Types (DB enum `txn_type`)

| Type | Created Where | Real API Call? |
|---|---|---|
| `rental_payment` | VerifyPayment / webhook `payment.captured` | ✅ Signature verified |
| `deposit_payment` | Defined in enum — **never created** | ❌ |
| `platform_fee` | Defined in enum — **never created** | ❌ |
| `deposit_refund` | Booking completed / dispute resolved | ⚠️ Only on disputes |
| `rental_refund` | Webhook `refund.processed` | ✅ Via Razorpay webhook |
| `seller_payout` | Booking completed | ❌ Record only |
| `cancellation_refund` | Defined in enum — **never created** | ❌ |

### 4.2 Transaction Statuses (DB enum `txn_status`)

| Status | Used? | Where |
|---|---|---|
| `pending` | ✅ | Default on create |
| `processing` | ❌ | Never used |
| `completed` | ✅ | Payment confirmed |
| `failed` | ✅ | Payment failed |
| `reversed` | ❌ | Never used |

### 4.3 Booking Payment Statuses

```
                    ┌──────────┐
                    │  pending │ (booking created, awaiting payment)
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │completed│ │  failed │ │ refunded│
        └────┬────┘ └─────────┘ └─────────┘
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
completed  refund  cancelled
(escrow   (via    (via cancel
 release)  webhook)  API)
```

---

## 5. Payment Flow Walkthrough

### 5.1 Booking → Payment → Confirmation

```
1. POST /bookings (renter)
   → Create Razorpay order (totalAmount)
   → Booking saved (status: pending, payment_status: pending)

2. Frontend opens Razorpay Checkout
   → Renter completes payment on Razorpay

3. POST /payments/verify (renter, with signature)
   → HMAC verified (or bypassed in dev)
   → Booking: payment_status=completed, status=confirmed
   → Transaction: type=rental_payment, status=completed

4. GET /bookings/:id → Renter sees confirmed booking
```

### 5.2 Cancellation Refund

```
1. POST /bookings/:id/cancel (renter)
   → If payment_status=completed:
     → rzpClient.RefundPayment(paymentID, amount)
     → Transaction: type=rental_refund, status=completed
     → Booking: payment_status=refunded, status=cancelled
     → Notification to renter
```

### 5.3 Booking Completion → Escrow Release

```
1. PATCH /bookings/:id/status { status: "completed" }
   → Transaction: type=deposit_refund, amount=securityDeposit
     (renter gets deposit refund record)
   → Transaction: type=seller_payout, amount=rentalAmount - platformFee
     (seller gets payout record)
   → Sends notifications to both

   ⚠️ NO actual Razorpay API call for either deposit refund or seller payout
```

### 5.4 Dispute Resolution

```
1. PUT /admin/disputes/:id/resolve
   → rzpClient.RefundPayment(paymentID, refundAmount) ✅ real API call
   → Transaction: type=deposit_refund, amount=refundAmount
   → Updates booking deposit_refund_amount/reason
   → Notifications to both parties
```

---

## 6. State Machine Audit

### 6.1 All Possible States

| Entity | States | Transitions |
|---|---|---|
| `Booking.Status` | pending → confirmed → shipped → delivered → returned → completed | Linear, with cancellation from any state |
| `Booking.PaymentStatus` | pending → completed / failed → refunded | `completed` → `refunded` only via cancellation |
| `Transaction.Status` | pending → completed / failed | Failed never transitions further |

### 6.2 Missing / Untested Transitions

| Transition | Expected | Actual |
|---|---|---|
| `pending` → `processing` | When Razorpay order created | ❌ Never set |
| `completed` → `reversed` | If payment reversed by Razorpay | ❌ No webhook handler for `payment.dispute.created` |
| `refunded` → any | If partial refund followed by another | ❌ No partial refund support |
| Deposit refund to renter | Actual money movement via Razorpay | ❌ Record only (except disputes) |
| Seller payout to seller | Actual money movement via Razorpay or bank transfer | ❌ Record only |

---

## 7. Critical Gaps

### P0 — Needs Fixing Before Production

| # | Issue | Impact | File |
|---|---|---|---|
| 1 | **Deposit refund on completion is record-only** — no Razorpay API call | Renter never gets their deposit back | `booking/service.go:324-337` |
| 2 | **Seller payout on completion is record-only** — no Razorpay API call | Seller never gets paid | `booking/service.go:340-353` |
| 3 | **`platform_fee` transaction never created** — fee is embedded in total, not tracked separately | Cannot reconcile platform revenue independently | Never created anywhere |
| 4 | **No `POST /seller/payouts/withdraw` endpoint** — frontend calls it but backend doesn't have it | Seller payout withdrawal always fails | Missing from all handlers |
| 5 | **No `GET /admin/transactions` or `GET /admin/payments` endpoint** — frontend calls `adminAPI.getPaymentTransactions()` but no such route exists | Admin payments page always empty | Missing from admin handler |
| 6 | **No `GET /admin/settings` or `PUT /admin/settings` endpoint** — frontend calls `adminAPI.getSettings()` but no such route exists | Settings page errors | Missing from admin handler |

### P1 — Should Fix

| # | Issue | Impact |
|---|---|---|
| 7 | `deposit_payment` and `cancellation_refund` txn types defined in enum but never used | Schema inconsistency |
| 8 | `processing` and `reversed` txn_statuses defined but never used | Schema inconsistency |
| 9 | No `payment.dispute.created` webhook handler | Cannot handle chargebacks |
| 10 | `AdminSettings.platform_take_rate` in frontend types but no backend equivalent | Frontend/backend contract mismatch |
| 11 | `AdminTransactionEntry` type used in frontend but no corresponding backend response type | Type mismatch risk |

---

## 8. Weakness Analysis

### 8.1 Security
- Webhook signature verification ✅ HMAC-SHA256 with secret
- Payment verification ✅ HMAC-SHA256 with key secret
- Signature bypass in dev mode (`"simulated_signature"`) ⚠️ Acceptable for dev
- No idempotency key on order creation ⚠️ Risk of duplicate orders on retry
- No payment intent idempotency ⚠️ Risk of double-verify on network retry

### 8.2 Reliability
- Webhook `refund.processed` only handles full refund from Razorpay dashboard — partial refunds ignored
- No retry mechanism for failed Razorpay API calls (refunds, webhook processing)
- `go build ./...` passes ✅
- No payment-specific unit tests found

### 8.3 Audit Trail
- All monetary events create `Transaction` records ✅
- Transactions linked to bookings via `booking_id` ✅
- Transactions linked to users via `user_id` ✅
- `GatewayData` JSONB field available but **never populated** ⚠️
- No payout batch tracking or reconciliation support ❌

### 8.4 Frontend/Backend Contract
- Frontend `AdminSettings` type expects `platform_take_rate` — backend has `FeePercent`
- Frontend `adminAPI.getPaymentTransactions()` hits `/admin/payments` — no such route
- Frontend `sellerPayoutAPI.withdraw()` hits `/seller/payouts/withdraw` — no such route

---

## 9. Build Verification

- `go build ./...` passes ✅
- `npm run build` passes ✅
- No compilation errors in payment code

---

## 10. Recommendations

### Immediate (before production cutover)
1. Implement actual Razorpay transfer/payout API call on booking completion for both deposit refund and seller payout
2. Gate the escrow release behind actual settlement confirmation from Razorpay
3. Create missing admin routes: `/admin/settings`, `/admin/payments` (or `/admin/transactions`), handle frontend expectations
4. Create `POST /seller/payouts/withdraw` endpoint or remove frontend reference

### Short-term
5. Populate `GatewayData` JSONB with raw Razorpay responses for audit trail
6. Add idempotency keys to Razorpay order creation and payment verification
7. Create proper `Transaction(type: "platform_fee")` records when bookings are confirmed
8. Add `payment.dispute.created` and `payment.dispute.closed` webhook handlers

### Long-term
9. Implement payout batch processing (weekly/biweekly settlements to sellers)
10. Add reconciliation reports comparing DB transactions vs Razorpay dashboard
11. Add partial refund support in cancellation flow
12. Write payment-specific integration tests with Razorpay test mode

---

## 11. File Inventory

| File | Role | Status |
|---|---|---|
| `backend/internal/payment/model.go` | Transaction model | ✅ Clean |
| `backend/internal/payment/dto.go` | VerifyPaymentRequest DTO | ✅ Clean |
| `backend/internal/payment/repository.go` | Transaction CRUD | ✅ Clean |
| `backend/internal/payment/handler.go` | Verify + Webhook endpoints | ✅ Clean |
| `backend/internal/payment/service.go` | Payment verification + Webhook logic | ⚠️ No idempotency |
| `backend/pkg/payment/razorpay.go` | Razorpay HTTP client | ✅ Clean |
| `backend/internal/booking/model.go` | Booking payment fields | ✅ Clean |
| `backend/internal/booking/service.go` | Order creation, escrow release | ⚠️ Record-only payouts |
| `backend/internal/admin/service.go` | Dispute refunds, AIOps stats | ✅ Clean |
| `backend/internal/config/config.go` | Fee percent, Razorpay config | ✅ Clean |
| `backend/internal/email/service.go` | Payment/refund email templates | ✅ Clean |
| `backend/internal/notification/service.go` | Payment notifications | ✅ Clean |
| `backend/internal/database/migrations/004_payments.sql` | Transactions table DDL | ✅ Clean |
| `frontend/lib/razorpay.ts` | SDK loader + checkout opener | ✅ Clean |
| `frontend/lib/api.ts` | Payment API client calls | ⚠️ References missing routes |
| `frontend/components/payments/RazorpayButton.tsx` | Reusable payment button | ✅ Clean |
| `frontend/app/booking/checkout/page.tsx` | Checkout page | ✅ Clean |
| `frontend/app/booking/confirmation/page.tsx` | Confirmation page | ✅ Clean |
| `frontend/app/admin/payments/page.tsx` | Admin transactions view | ⚠️ Broken (no backend route) |
| `frontend/store/useCartStore.ts` | Cart with fee calculations | ⚠️ Duplicates backend fee logic |

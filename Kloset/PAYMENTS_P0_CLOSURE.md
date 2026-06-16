# PAYMENTS P0 CLOSURE — Real Money Movement

**Date:** 2026-06-16
**Commit:** `fix(payments): execute real payouts and refunds`

---

## Audit Finding

Refunds and payouts only created DB records. No actual money moved via Razorpay.

| Flow | Before | After |
|------|--------|-------|
| Booking cancellation refund | ✅ Real Razorpay refund | ✅ No change |
| Dispute resolution refund | ✅ Real Razorpay refund | ✅ No change |
| Security deposit refund (booking complete) | ❌ DB record only | ✅ **Real Razorpay refund** |
| Seller payout (booking complete) | ❌ DB record only | ✅ **Real Razorpay payout** |
| Dispute seller payout (full_release/split) | ❌ Not implemented | ✅ **Real Razorpay payout** |

---

## Changes

### 1. `pkg/payment/razorpay.go` — New Payout APIs

Added 3 new methods to `RazorpayClient`:

| Method | Razorpay Endpoint | Purpose |
|--------|-------------------|---------|
| `CreateContact(name, email, type)` | `POST /v1/contacts` | Create/retrieve seller identity for payouts. Handles `duplicate_reference_id` by fetching existing contact. |
| `CreateFundAccount(contactID, accountType, ...)` | `POST /v1/fund_accounts` | Register seller's bank account or UPI as payout destination. |
| `CreatePayout(fundAccountID, amount, ...)` | `POST /v1/payouts` | Execute actual bank transfer to seller. Uses `queue_if_low_balance: true` for reliability. |

All methods use same auth pattern (Basic Auth with `keyID:keySecret`) and 10s timeout as existing client.

### 2. `internal/booking/service.go` — Deposit Refund + Seller Payout

**`UpdateStatus("completed")` — Escrow Release:**

1. **Deposit refund to renter:** Calls `rzpClient.RefundPayment()` with the security deposit amount. On failure, records a `failed` transaction for manual retry. On success, records `completed` transaction with Razorpay refund ID.

2. **Seller payout:** Looks up seller's `bank_details` from users table. If valid bank info exists:
   - Creates Razorpay Contact (idempotent via `reference_id`)
   - Creates Fund Account (bank account destination)
   - Executes Payout via `bank_transfer` mode
   - Records `seller_payout` transaction with payout ID

   If seller has no bank details, records `pending` payout transaction for manual processing. Notifications inform seller whether payout is instant or pending.

### 3. `internal/admin/service.go` — Dispute Seller Payouts

**`ResolveDispute()` — Post-refund seller payout:**

For `full_release_seller` resolution: seller receives full security deposit via Razorpay payout.
For `split` resolution: seller receives `security_deposit - refund_amount` via Razorpay payout.

Same payout flow as booking completion (Contact → Fund Account → Payout). Records transaction for both completed and pending states.

---

## Payment Flow Diagram

```
Booking Completed
├── Security Deposit → Renter (Razorpay Refund)
│   └── POST /v1/payments/{id}/refund
└── Rental Earnings → Seller (Razorpay Payout)
    ├── POST /v1/contacts (create/retrieve)
    ├── POST /v1/fund_accounts (register bank/UPI)
    └── POST /v1/payouts (execute transfer)

Dispute Resolved (full_release / split)
├── Refund Amount → Renter (Razorpay Refund)
│   └── POST /v1/payments/{id}/refund
└── Remainder → Seller (Razorpay Payout)
    ├── POST /v1/contacts
    ├── POST /v1/fund_accounts
    └── POST /v1/payouts

Booking Cancelled
└── Full Amount → Renter (Razorpay Refund)
    └── POST /v1/payments/{id}/refund
```

---

## Verification

| Check | Result |
|-------|--------|
| `go build ./...` | **PASS** |
| `go vet ./...` | **PASS** |
| All existing refund paths unchanged | ✅ |
| New payout paths handle missing bank details gracefully | ✅ |
| Failed payouts recorded as `pending` for manual retry | ✅ |
| Notifications sent for all payout states | ✅ |

---

## Razorpay API Requirements

For seller payouts to work in production:

1. **Razorpay account must have Payouts enabled** (Settings → Payouts → Enable)
2. **Sufficient balance** in Razorpay account for payouts (or `queue_if_low_balance` queues them)
3. **Sellers must have `bank_details`** in their user profile with structure:
   ```json
   {
     "account_name": "Seller Name",
     "ifsc": "HDFC0001234",
     "account_number": "1234567890"
   }
   ```
4. **Webhook** should be configured for `payout.processed` and `payout.failed` events (future enhancement)

---

## Known Limitations

| Limitation | Mitigation |
|------------|------------|
| No `payout.processed` webhook handler | Payout status is set at creation time; async processing status not tracked |
| No retry queue for failed payouts | Failed payouts recorded as `pending` transaction; admin can retry manually |
| Seller must have bank details on file | Missing details → `pending` payout; notification informs seller |
| Single payout per booking completion | No batching — each booking triggers individual payout |

---

## Files Modified

- `Kloset/backend/pkg/payment/razorpay.go` — Added `CreateContact`, `CreateFundAccount`, `CreatePayout`, `findContactByEmail`
- `Kloset/backend/internal/booking/service.go` — Real deposit refund + seller payout in `UpdateStatus("completed")`
- `Kloset/backend/internal/admin/service.go` — Seller payout in `ResolveDispute()` for `full_release_seller`/`split`

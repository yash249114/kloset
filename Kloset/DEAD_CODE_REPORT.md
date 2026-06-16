# Dead Code Removal Report

**Date:** 2026-06-16  
**Scope:** Kloset frontend (`Kloset/frontend/`)  
**Tool:** `tsc --noEmit --noUnusedLocals --noUnusedParameters`  
**Goal:** 0 unused-vars warnings in production code

---

## Summary

| Category | Removed |
|---|---|
| Unused `import React` lines | 47 files |
| Unused lucide-react icon imports | 17 icons across 15 files |
| Unused variables / destructures | 7 instances across 5 files |
| Unused component imports (`Card`, `Badge`, `User`) | 5 files |
| Unused type exports (`SupportTicket`, `TicketReply`, `TicketReplyPayload`) | `lib/api.ts` + 1 importer |

**Total files modified:** ~50  
**Result:** `tsc --noUnusedLocals --noUnusedParameters` passes with **0 errors**.

---

## Unused `import React from 'react'` Removed (47 files)

React 19's automatic JSX transform makes explicit `import React` unnecessary. Removed from:

**Admin pages (10):** `aiops`, `analytics`, `disputes`, `kyc`, `listings`, `orders`, `payments`, `sellers`, `transactions`, `users`

**Auth/Booking/Cart/Home pages (6):** `booking/checkout`, `booking/confirmation`, `cart`, `dashboard/orders`, `discover`, `outfit/[id]`, `page`, `renter/ai-stylist`, `renter/returns`, `wishlist`

**Seller pages (7):** `analytics`, `earnings`, `inbox`, `inventory`, `notifications`, `orders`, `reviews`

**Components (21):** `AIOpsPanel`, `GoogleButton`, `KlosetLogo`, `Categories`, `Hero`, `HowItWorks`, `loading`, `Reviews`, `SellerCTA`, `Trending`, `Trust`, `AdminSidebar`, `MobileNavDrawer`, `NotificationBell`, `RenterNavbar`, `SellerSidebar`, `RazorpayButton`, `EmptyState`, `PremiumHero`, `Skeleton`, `Toast`

---

## Unused lucide-react Icons Removed

| File | Icons Removed |
|---|---|
| `admin/aiops/page.tsx` | `CheckCircle`, `AlertTriangle`, `Clock`, `ShieldAlert` |
| `admin/disputes/page.tsx` | `AlertCircle` |
| `admin/listings/page.tsx` | `Edit`, `Trash2`, `Eye` |
| `admin/page.tsx` | `CheckCircle`, `Clock` |
| `admin/payments/page.tsx` | `CreditCard` |
| `admin/transactions/page.tsx` | `DollarSign` |
| `discover/page.tsx` | `SlidersHorizontal` |
| `renter/returns/page.tsx` | `Clock`, `Inbox` |
| `seller/earnings/page.tsx` | `DollarSign` |
| `seller/orders/page.tsx` | `AlertCircle`, `XCircle` |
| `seller/page.tsx` | `Eye` |
| `seller/settings/page.tsx` | `Check`, `AlertTriangle` |
| `layout/RenterNavbar.tsx` | `MessageSquare`, `Phone` |

---

## Unused Variables / Destructures Removed

| File | Variable | Type |
|---|---|---|
| `admin/aiops/page.tsx` | `systemHealthData`, `revenueData` | Unused Promise.all destructures |
| `admin/aiops/page.tsx` | `systemHealth`, `revenue` | Unused useState values |
| `discover/page.tsx` | `i` → `_` | Unused map index |
| `outfit/[id]/page.tsx` | `setReviewsLoading` | Unused setter |
| `layout/RenterNavbar.tsx` | `aiStylistOpen` | Unused state value |

---

## Unused Component / Type Imports Removed

| File | Import Removed |
|---|---|
| `admin/page.tsx` | `Card` from `@/components/ui/Card` |
| `discover/page.tsx` | `Card` from `@/components/ui/Card` |
| `outfit/[id]/page.tsx` | `Card` from `@/components/ui/Card` |
| `seller/page.tsx` | `Card` from `@/components/ui/Card` |
| `seller/inventory/page.tsx` | `Badge` from `@/components/ui/Badge` |
| `profile/page.tsx` | `User` from `@/types` |
| `lib/api.ts` | `SupportTicket`, `TicketReply`, `TicketReplyPayload` type exports |
| `seller/support/[ticketId]/page.tsx` | `TicketReplyPayload` type import |

---

## Files Unchanged (Used Reactive Code Left Alone)

The following files still have `import React` because they reference `React.` types:

`layout.tsx`, `auth/login`, `auth/register`, `auth/forgot-password`, `auth/reset-password`, `auth/verify-email`, `support/page`, `outfit/new/page`, `orders/page`, `seller/page`, `seller/settings`, `seller/listings`, `seller/profile`, `seller/support/[ticketId]`, `admin/disputes`, `admin/settings`, `admin/page`, `profile/page`, `ImageUploader`, `CartDrawer`, `AIStylistDrawer`, `ConfirmDialog`, `Badge`, `Button`, `Card`, `Drawer`, `Input`, `Modal`, `PremiumCard`, `PremiumImageGallery`, `RenterFooter`, `GoogleProvider`, `PostHogProvider`, `AppShell`

---

## Verification

```bash
cd Kloset/frontend
npx tsc --noEmit --noUnusedLocals --noUnusedParameters
# → 0 errors
```

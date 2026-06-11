# Kloset — Fashion Rental Marketplace

> **Your Wardrobe, Expanded.** ✨
> A premium, production-ready, AI-powered fashion rental marketplace where curators list premium outfits and renters book them seamlessly. Built with high performance, secure payments, and operational automation.

---

## 🚀 Key Features

*   **Premium Rental Engine**: Multi-day renting options (1-day, 3-day, and 7-day pricing tiers) with automatic security deposit tracking.
*   **Secure Payment Flow**: Seamless Razorpay integration featuring cryptographically verified payments, sandbox/live mode, webhooks, and automatic refund tracking.
*   **Gemini AI integration**: Outfit moderation, automated descriptions, and intelligent recommendations powered by Gemini 1.5 Flash.
*   **Transactional Notifications**: In-App Notification Center and automated HTML transactional emails dispatched via Resend.
*   **Robust Background Workers**: Resilient database-backed email worker that guarantees dispatch retries in case of external service outages.
*   **Admin Studio & AIOps**: Operational control room with real-time diagnostic telemetry, KYC verification queue, outfit moderation, dispute resolution, and system logs.
*   **PostgreSQL Rate Limiting**: Intelligent API rate limiting using atomic transaction row locks in PostgreSQL.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS | Responsive, interactive, and optimized for conversions. |
| **Backend** | Go (Golang) 1.22+, Fiber v2 | RESTful API gateway with high throughput. |
| **ORM** | GORM (Go Object Relational Mapping) | Database schema migrations and fluent querying. |
| **Database** | PostgreSQL | Relational storage for users, bookings, and products. |
| **Cache & Limit** | PostgreSQL | OTP validation, email retry queues, and rate-limiting. |
| **Payments** | Razorpay SDK | Order creation, signature verification, and webhook handlers. |
| **Emails** | Resend API | Automated welcome, booking, refund, and support emails. |
| **AI Engine** | Gemini 1.5 Flash | Content moderation and recommendation intelligence. |
| **Media CDN** | Cloudinary | Fast, optimized image uploads and responsive assets. |

---

## 📐 Architecture

```
                      +-----------------------------+
                      |      Next.js Frontend       |
                      |   (Vercel / Port 3000)      |
                      +--------------+--------------+
                                     |
                                     | (REST API & CORS)
                                     v
                      +-----------------------------+
                      |      Go Fiber Backend       |
                      |   (Railway / Port 8080)     |
                      +-------+------------------+--+
                              |                  |
            +-----------------+                  +-----------------+
            |                                                      |
            v                                                      v
+-----------------------+                              +----------------------+
|  Supabase PostgreSQL  |                              |   External Services:  |
|  (Database & Cache)   |                              | - Razorpay (Payments)|
+-----------------------+                              | - Resend (Emails)    |
                                                       | - Gemini (AI Engine) |
                                                       | - Cloudinary (Media) |
                                                       +----------------------+
```

---

## ⚙️ Environment Configuration

Copy the root `.env.example` file to configure your local variables:
```bash
cp .env.example .env
```
Ensure you update the following sections in your local `.env`:
*   **Database**: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
*   **JWT**: `JWT_SECRET` (at least 32 characters)
*   **Cloudinary**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
*   **Razorpay**: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
*   **Resend**: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`
*   **Gemini**: `GEMINI_API_KEY`

---

## 🏃 Quick Start

### Prerequisites
*   Go 1.22+
*   Node.js 18+ (npm or yarn)
*   PostgreSQL running locally or on Supabase

### 1. Backend Service
```bash
cd backend
# Create environment file and adjust values
cp .env.example .env

# Install Go dependencies
go mod tidy

# Run migrations (automatically handles auto-migrating missing tables)
# Start the development server
go run cmd/server/main.go
```
The server will start listening on `http://localhost:8080`.

### 2. Frontend Application
```bash
cd frontend
# Configure frontend env variables
cp .env.local.example .env.local

# Install dependencies
npm install

# Run the dev server
npm run dev
```
The client dashboard will be available at `http://localhost:3000`.

---

## 🌱 Database Seeding

We provide an automated database seeder tool that truncates existing test tables and populates the database with consistent demo users, fashion catalogs, bookings, support tickets, and system logs.

To run the database seeder:
```bash
# Using Makefile
make seed

# Or run directly
cd backend && go run cmd/seed/main.go
```

### 👥 Demo Login Credentials
All seeded users share the same password: **`KlosetSecured123!`**

*   **System Admin**: `admin@kloset.in`
*   **Seller (Anika Sharma)**: `seller.anika@kloset.in` (Lehenga Owner)
*   **Seller (Rohit Mehta)**: `seller.rohit@kloset.in` (Sherwani Owner)
*   **Renter (Swetha Rao)**: `renter.swetha@kloset.in`
*   **Renter (Aditya Sen)**: `renter.aditya@kloset.in`

---

## 🛣️ API Endpoint Directory

All endpoints are prefixed with `/api/v1`.

### 🔐 Authentication (`/auth`)
*   `POST /auth/register` - Create a new renter or seller account.
*   `POST /auth/login` - Authenticate and retrieve Access & Refresh tokens.
*   `POST /auth/refresh` - Rotate expired access tokens (utilizes refresh token rotation).
*   `POST /auth/logout` - Invalidate user sessions and tokens.
*   `GET /auth/me` - Retrieve current authenticated user details.

### 👤 User Profiles (`/users`)
*   `GET /users/profile` - Fetch personal user profile.
*   `PUT /users/profile` - Update profile data.
*   `GET /users/addresses` - Retrieve shipping addresses.
*   `POST /users/addresses` - Register a new address.
*   `PUT /users/addresses/:id/default` - Set default shipping address.
*   `DELETE /users/addresses/:id` - Remove address record.

### 👗 Outfit Catalog (`/outfits`)
*   `GET /outfits` - Browse outfits (supports filters: category, size, price, search, and availability dates).
*   `GET /outfits/trending` - Fetch trending high-view count outfit items.
*   `GET /outfits/:id` - Get detailed item card including reviews.
*   `POST /outfits/:id/view` - Track outfit impression metrics.
*   `POST /outfits` - List new outfit (Requires `seller` role).
*   `PUT /outfits/:id` - Edit listing details.
*   `PUT /outfits/:id/submit` - Lock item details and submit for Admin moderation.
*   `DELETE /outfits/:id` - Deactivate or remove listing.

### 💖 Wishlist (`/wishlist`)
*   `GET /wishlist` - Get current user's wishlisted items.
*   `POST /wishlist/:outfitId` - Add an outfit to the wishlist.
*   `DELETE /wishlist/:outfitId` - Remove from wishlist.

### 📅 Rental Bookings (`/bookings`)
*   `POST /bookings` - Draft a booking slot (validates date overlaps, calculates taxes, security deposit, and platform fees).
*   `GET /bookings/mine` - View my rented items history.
*   `GET /bookings/seller` - View orders received for my listings (Requires `seller` role).
*   `GET /bookings/:id` - Fetch detailed booking receipt status.
*   `PATCH /bookings/:id/status` - Transition booking status (`confirmed`, `shipped`, `delivered`, `returned`, `completed`).
*   `POST /bookings/:id/cancel` - Cancel booking and trigger corresponding refund logic.

### 💳 Payments (`/payments`)
*   `POST /payments/verify` - Verify Razorpay payment signatures cryptographically on the server.
*   `POST /payments/webhook` - Public webhook destination for Razorpay notifications (`payment.captured`, `payment.failed`, `refund.processed`).

### 🔔 Notifications (`/notifications`)
*   `GET /notifications` - Fetch list of in-app notifications.
*   `PUT /notifications/read-all` - Mark all notifications as read.
*   `PUT /notifications/:id/read` - Mark single notification as read.

### ⭐ Reviews & Ratings (`/reviews`)
*   `POST /reviews` - Submit feedback and 1-5 star rating for a completed booking.
*   `GET /reviews/outfit/:outfitId` - Get list of reviews for an outfit.

### ⚖️ Disputes (`/disputes`)
*   `POST /disputes` - Log a booking dispute (e.g. damaged package, late returns).
*   `GET /disputes/:id` - Check dispute status and history.

### 🎫 Support Tickets (`/support`)
*   `POST /support/tickets` - Open a customer support issue.
*   `GET /support/tickets` - View my ticket history.
*   `GET /support/admin/tickets` - Fetch all system tickets (Requires `admin` role).
*   `PUT /support/admin/tickets/:id/status` - Set ticket status (Requires `admin` role).
*   `POST /support/admin/tickets/:id/reply` - Append a reply to tickets (Requires `admin` role).

### 🛠️ Admin Studio (`/admin`)
*   `GET /admin/stats` - Multi-dimensional business intelligence overview.
*   `GET /admin/aiops` - High-level AI operations audit.
*   `GET /admin/kyc` - List pending seller identity reviews.
*   `PUT /admin/kyc/:userId/approve` - Approve KYC verification.
*   `PUT /admin/kyc/:userId/reject` - Reject KYC verification.
*   `GET /admin/outfits` - Get outfits pending moderation.
*   `PUT /admin/outfits/:id/approve` - Approve outfit listing for public catalog.
*   `PUT /admin/outfits/:id/reject` - Reject listing with reason.
*   `GET /admin/disputes` - View all active/closed disputes.
*   `PUT /admin/disputes/:id/resolve` - Resolve open disputes.
*   `GET /admin/logs` - Query structured audit and execution logs.

### 📈 System Telemetry & Monitoring
*   `GET /healthz` - Database status ping.
*   `GET /readyz` - Full database + Redis readiness check.
*   `GET /api/v1/admin/monitoring/diagnostics` - Live server connection pools, error metrics, and service status (Requires `admin` role).

---

## 🚢 Production Deployment

For step-by-step production cutover checklist, environment variable mapping, database backup protocols, and rollbacks, refer to the [Production Deployment & Operations Manual](C:/Users/alany/.gemini/antigravity-ide/brain/a7517cdd-6a36-476f-a4af-c6f1d3dc69f0/deployment_readiness.md).

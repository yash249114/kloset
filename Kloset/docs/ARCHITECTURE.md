# Kloset Architecture Guide

This document describes the architectural layout, modules, and component interactions of the Kloset Fashion Rental Marketplace.

---

## 1. System Topology

```
             +------------------------------+
             |      Next.js Front-End       |
             |       (Vercel / Node)        |
             +------------------------------+
                            || HTTPS
                            \/
             +------------------------------+
             |       Go Fiber Backend       |
             |       (API Host: 8080)       |
             +------------------------------+
                ||
                \/
     +----------------------------------+
     |        PostgreSQL (GORM)         |
     | (Rental, Users, Rate Limit, OTP) |
     +----------------------------------+
```

---

## 2. API Server Layers

The Go backend utilizes an layered, domain-focused structure inside the `backend/internal/` directory:

```
[Client Request] ---> [Router Middleware] ---> [Handler Controller] ---> [Business Service] ---> [Repository DB Layer]
```

* **Handler (`handler.go`)**: Validates payload structures, processes Fiber context, and marshals JSON responses.
* **Service (`service.go`)**: Contains business workflows (escrow payment signature verify, support ticket logs, security, etc.).
* **Repository (`repository.go`)**: Direct interface to database engines using GORM transactions.

---

## 3. Telemetry, Monitoring, and AIOps

Diagnostics endpoints report real-time database connections pools status, failed mail logs, and error rates:
* `GET /healthz`: Standard DB ping endpoint for health monitoring.
* `GET /readyz`: Validates database connectivity.
* `GET /api/v1/admin/monitoring/diagnostics`: Administrative JSON status dump.

---

## 4. Operational Gateways

Kloset interfaces with the following production SaaS layers:
1. **Razorpay SDK**: Handles customer credit cards, escrow collections, signature verifications, and refunds.
2. **Resend SDK**: Background transactional email workers dispatching rental logs and updates.
3. **Cloudinary SDK**: Media storage for outfit catalog uploads.
4. **Google OAuth JWKs**: Federated token signature check.

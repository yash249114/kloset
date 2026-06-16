# Kloset Production Deployment Guide

This guide details steps to set up Kloset in a secure, production-grade cloud environment.

---

## 1. Database & Cache Infrastructure

### PostgreSQL (RDS / Aurora)
* Provision an AWS RDS PostgreSQL instance (version 15 or higher).
* Create a dedicated database user (do not use `postgres` default) and assign permissions:
  ```sql
  CREATE DATABASE kloset_production;
  CREATE USER kloset_prod_user WITH PASSWORD 'secure_password';
  GRANT ALL PRIVILEGES ON DATABASE kloset_production TO kloset_prod_user;
  ```
* Enforce SSL/TLS connections in the parameter groups (`rds.force_ssl = 1`).

---

## 2. API Server Host (EC2 / ECS / systemd)

For running the Go API server, use systemd or PM2 to ensure process persistence and auto-restarts.

### Option A: systemd Service Configuration
Create `/etc/systemd/system/kloset-api.service`:
```ini
[Unit]
Description=Kloset Go API Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/kloset/backend
ExecStart=/var/www/kloset/backend/main
Restart=always
RestartSec=5
EnvironmentFile=/var/www/kloset/backend/.env

[Install]
WantedBy=multi-user.target
```
Commands to enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable kloset-api
sudo systemctl start kloset-api
```

### Option B: PM2 (Process Manager)
```bash
pm2 start ./main --name "kloset-api" --update-env
```

---

## 3. Frontend Storefront (Vercel / AWS Amplify)

Deploy the Next.js frontend to Vercel or a standalone Node.js server.

### Standing Node Deploy (PM2)
```bash
# Build
npm run build

# Start
pm2 start npm --name "kloset-frontend" -- start -- -p 3000
```

---

## 4. HTTPS & Reverse Proxy (Nginx)

Configure Nginx as a reverse proxy with Let's Encrypt SSL.

```nginx
server {
    listen 80;
    server_name api.kloset.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.kloset.in;

    ssl_certificate /etc/letsencrypt/live/api.kloset.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.kloset.in/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Use `certbot --nginx -d api.kloset.in` to obtain and auto-renew certificates.

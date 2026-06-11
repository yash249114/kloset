-- Migration 010: Migrate Redis features (OTP, Rate Limiting, Email Queue, AI Cache) to PostgreSQL
-- Kloset Fashion Rental Marketplace

CREATE TABLE IF NOT EXISTS otp_verifications (
    phone          VARCHAR(50) PRIMARY KEY,
    code           VARCHAR(6) NOT NULL,
    expires_at     TIMESTAMPTZ NOT NULL,
    cooldown_until TIMESTAMPTZ NOT NULL,
    attempts       INTEGER NOT NULL DEFAULT 0,
    send_count     INTEGER NOT NULL DEFAULT 0,
    window_start   TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limit_events (
    key        VARCHAR(255) NOT NULL,
    path       VARCHAR(255) NOT NULL,
    count      INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (key, path)
);

CREATE TABLE IF NOT EXISTS email_queue (
    id           UUID PRIMARY KEY,
    email_log_id UUID NOT NULL,
    to_email     VARCHAR(255) NOT NULL,
    subject      VARCHAR(255) NOT NULL,
    html         TEXT NOT NULL,
    attempts     INTEGER NOT NULL DEFAULT 1,
    last_error   TEXT,
    created_at   TIMESTAMPTZ NOT NULL,
    updated_at   TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_cache (
    key        VARCHAR(255) PRIMARY KEY,
    response   TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_expiry ON rate_limit_events(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_log ON email_queue(email_log_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expiry ON ai_cache(expires_at);

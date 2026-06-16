-- Migration 010: Email OTP Verifications
-- Kloset Fashion Rental Marketplace

CREATE TABLE email_otp_verifications (
  email         VARCHAR(255) PRIMARY KEY,
  code          VARCHAR(6) NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  cooldown_until TIMESTAMPTZ NOT NULL,
  attempts      INTEGER NOT NULL DEFAULT 0,
  send_count    INTEGER NOT NULL DEFAULT 0,
  window_start  TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_otp_expires ON email_otp_verifications(expires_at);

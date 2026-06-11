-- ==============================================================================
-- KLOSET Fashion Rental Marketplace
-- Complete Launch Database Schema Package
-- Migrations 001 through 010 Combined
-- ==============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── Enums & Custom Types ────────────────────────────────────────────────────
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('renter', 'seller', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
    CREATE TYPE kyc_status AS ENUM ('pending', 'submitted', 'verified', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'outfit_status') THEN
    CREATE TYPE outfit_status AS ENUM (
      'draft', 'pending_approval', 'active',
      'rented', 'cleaning', 'inactive', 'rejected'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'outfit_category') THEN
    CREATE TYPE outfit_category AS ENUM (
      'lehenga', 'saree', 'anarkali', 'sharara', 'gown',
      'sherwani', 'kurta_set', 'co_ord', 'western', 'other'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM (
      'pending', 'confirmed', 'picked_up',
      'in_use', 'return_initiated', 'returned',
      'cleaning', 'completed', 'cancelled', 'disputed'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_type') THEN
    CREATE TYPE delivery_type AS ENUM ('pickup', 'delivery');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'txn_type') THEN
    CREATE TYPE txn_type AS ENUM (
      'rental_payment', 'deposit_payment', 'platform_fee',
      'deposit_refund', 'rental_refund', 'seller_payout',
      'cancellation_refund'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'txn_status') THEN
    CREATE TYPE txn_status AS ENUM ('pending','processing','completed','failed','reversed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notif_channel') THEN
    CREATE TYPE notif_channel AS ENUM ('in_app','push','sms','email');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notif_type') THEN
    CREATE TYPE notif_type AS ENUM (
      'booking_request','booking_confirmed','booking_declined',
      'pickup_reminder','return_reminder','return_initiated',
      'deposit_refunded','payment_released','new_review',
      'dispute_raised','dispute_resolved','kyc_verified',
      'listing_approved','listing_rejected','welcome'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_status') THEN
    CREATE TYPE dispute_status AS ENUM ('open','in_review','resolved','closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_resolution') THEN
    CREATE TYPE dispute_resolution AS ENUM (
      'full_refund_renter','full_release_seller','split','dismissed'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_event_type') THEN
    CREATE TYPE ai_event_type AS ENUM (
      'view','wishlist','click','search','book','review',
      'share','time_spent'
    );
  END IF;
END $$;

-- ─── Users Table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(100) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(15) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'renter',
  avatar_url      TEXT,
  is_active       BOOLEAN DEFAULT true,
  is_verified     BOOLEAN DEFAULT false,
  kyc_status      kyc_status DEFAULT 'pending',
  aadhaar_hash    VARCHAR(64),
  pan_hash        VARCHAR(64),
  wallet_balance  DECIMAL(12,2) DEFAULT 0.00,
  trust_score     INTEGER DEFAULT 100,
  fcm_token       TEXT,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,

  -- Renter Profile Attributes
  date_of_birth       VARCHAR(20),
  gender              VARCHAR(20),
  payment_preferences TEXT,

  -- Seller Business Attributes
  business_name        VARCHAR(255),
  business_address     TEXT,
  pickup_address       TEXT,
  return_address       TEXT,
  gst_details          VARCHAR(50),
  pan_details          VARCHAR(50),
  bank_details         TEXT,
  payout_account       VARCHAR(100),
  kyc_documents        TEXT,
  store_banner         TEXT,
  store_logo           TEXT,
  business_description TEXT,
  support_contact      VARCHAR(50),
  rental_policies      TEXT,

  CONSTRAINT uni_users_email UNIQUE (email),
  CONSTRAINT uni_users_phone UNIQUE (phone)
);

-- ─── User Addresses Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_addresses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label           VARCHAR(50),
  full_address    TEXT NOT NULL,
  city            VARCHAR(100),
  state           VARCHAR(100),
  pincode         VARCHAR(10),
  lat             DECIMAL(10,8),
  lng             DECIMAL(11,8),
  is_default      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Refresh Tokens Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(64) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Outfits Table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outfits (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                 VARCHAR(200) NOT NULL,
  slug                  VARCHAR(250) UNIQUE,
  description           TEXT,
  ai_description        TEXT,
  category              outfit_category NOT NULL,
  occasions             TEXT[],
  colors                TEXT[],
  fabric                VARCHAR(100),
  sizes                 TEXT[],
  accessories_included  TEXT[],
  city                  VARCHAR(100),
  state                 VARCHAR(100),
  pincode               VARCHAR(10),
  price_1day            DECIMAL(10,2),
  price_3day            DECIMAL(10,2),
  price_7day            DECIMAL(10,2),
  security_deposit      DECIMAL(10,2),
  delivery_available    BOOLEAN DEFAULT false,
  delivery_fee          DECIMAL(8,2) DEFAULT 0,
  status                outfit_status DEFAULT 'draft',
  rejection_reason      TEXT,
  rating_avg            DECIMAL(3,2) DEFAULT 0,
  rating_count          INTEGER DEFAULT 0,
  view_count            INTEGER DEFAULT 0,
  wishlist_count        INTEGER DEFAULT 0,
  booking_count         INTEGER DEFAULT 0,
  search_vector         TSVECTOR,
  ai_tags               TEXT[],
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

-- ─── Outfit Images Table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outfit_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id     UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  cloudinary_id VARCHAR(200),
  is_primary    BOOLEAN DEFAULT false,
  sort_order    SMALLINT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Outfit Availability Blocks Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outfit_availability_blocks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id     UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  blocked_from  DATE NOT NULL,
  blocked_to    DATE NOT NULL,
  reason        VARCHAR(100)
);

-- ─── Wishlists Table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  outfit_id   UUID REFERENCES outfits(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, outfit_id)
);

-- ─── Bookings Table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref             VARCHAR(20) UNIQUE NOT NULL,
  outfit_id               UUID NOT NULL REFERENCES outfits(id),
  renter_id               UUID NOT NULL REFERENCES users(id),
  seller_id               UUID NOT NULL REFERENCES users(id),
  pickup_date             DATE NOT NULL,
  return_date             DATE NOT NULL,
  rental_days             INTEGER NOT NULL,
  size_selected           VARCHAR(10),
  status                  booking_status DEFAULT 'pending',
  delivery_type           delivery_type DEFAULT 'pickup',
  delivery_address        JSONB,
  rental_amount           DECIMAL(10,2),
  security_deposit        DECIMAL(10,2),
  delivery_fee            DECIMAL(8,2) DEFAULT 0,
  platform_fee            DECIMAL(8,2),
  total_amount            DECIMAL(10,2),
  payment_status          VARCHAR(20) DEFAULT 'pending',
  razorpay_order_id       VARCHAR(100),
  razorpay_payment_id     VARCHAR(100),
  return_photos           TEXT[],
  return_condition        VARCHAR(50),
  return_notes            TEXT,
  return_initiated_at     TIMESTAMPTZ,
  returned_at             TIMESTAMPTZ,
  deposit_refund_amount   DECIMAL(10,2),
  deposit_refund_reason   TEXT,
  seller_accepted_at      TIMESTAMPTZ,
  seller_accept_deadline  TIMESTAMPTZ,
  cancellation_reason     TEXT,
  cancelled_by            UUID REFERENCES users(id),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Transactions Table ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  booking_id      UUID REFERENCES bookings(id),
  type            txn_type NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  status          txn_status DEFAULT 'pending',
  gateway         VARCHAR(20),
  gateway_txn_id  VARCHAR(150),
  gateway_data    JSONB,
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- ─── Reviews Table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL UNIQUE REFERENCES bookings(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  outfit_id   UUID NOT NULL REFERENCES outfits(id),
  seller_id   UUID NOT NULL REFERENCES users(id),
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  photos      TEXT[],
  is_visible  BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notifications Table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        notif_type NOT NULL,
  title       VARCHAR(200),
  body        TEXT,
  data        JSONB,
  channels    notif_channel[] DEFAULT '{in_app}',
  is_read     BOOLEAN DEFAULT false,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Disputes Table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disputes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  raised_by       UUID NOT NULL REFERENCES users(id),
  against         UUID NOT NULL REFERENCES users(id),
  reason          VARCHAR(100),
  description     TEXT NOT NULL,
  evidence_photos TEXT[],
  status          dispute_status DEFAULT 'open',
  resolution      dispute_resolution,
  resolution_note TEXT,
  refund_amount   DECIMAL(10,2),
  resolved_by     UUID REFERENCES users(id),
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AI Events Table ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  outfit_id   UUID REFERENCES outfits(id) ON DELETE CASCADE,
  event_type  ai_event_type NOT NULL,
  metadata    JSONB,
  session_id  VARCHAR(64),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Recommendation Cache Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recommendation_cache (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  outfit_ids    UUID[] NOT NULL,
  strategy      VARCHAR(50),
  computed_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ
);

-- ─── Trending Outfits Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trending_outfits (
  outfit_id     UUID PRIMARY KEY REFERENCES outfits(id) ON DELETE CASCADE,
  score         DECIMAL(10,4) DEFAULT 0,
  period        VARCHAR(20) DEFAULT '7d',
  rank          INTEGER,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── OTP Verifications Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS otp_verifications (
  phone          VARCHAR(50) PRIMARY KEY,
  code           VARCHAR(6) NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  cooldown_until TIMESTAMPTZ NOT NULL,
  attempts       INTEGER NOT NULL DEFAULT 0,
  send_count     INTEGER NOT NULL DEFAULT 0,
  window_start   TIMESTAMPTZ NOT NULL
);

-- ─── Rate Limit Events Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limit_events (
  key        VARCHAR(255) NOT NULL,
  path       VARCHAR(255) NOT NULL,
  count      INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (key, path)
);

-- ─── Email Queue Table ───────────────────────────────────────────────────────
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

-- ─── AI Cache Table ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_cache (
  key        VARCHAR(255) PRIMARY KEY,
  response   TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- ─── System Logs Table (for debugging and diagnostics) ───────────────────────
CREATE TABLE IF NOT EXISTS system_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  ip_address VARCHAR(50),
  severity   VARCHAR(20) DEFAULT 'info',
  timestamp  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Email Logs Table (for monitoring sends) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS email_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email   VARCHAR(255) NOT NULL,
  subject    VARCHAR(255) NOT NULL,
  status     VARCHAR(20) NOT NULL,
  error_msg  TEXT,
  sent_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Triggers & Stored Procedures ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION outfit_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.occasions,' '),'')), 'C');
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS outfit_search_update ON outfits;
CREATE TRIGGER outfit_search_update
  BEFORE INSERT OR UPDATE ON outfits
  FOR EACH ROW EXECUTE FUNCTION outfit_search_vector_update();

-- ─── Core & Composite Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_name_trgm ON users USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_seller ON outfits(seller_id);
CREATE INDEX IF NOT EXISTS idx_outfits_status ON outfits(status);
CREATE INDEX IF NOT EXISTS idx_outfits_city ON outfits(city);
CREATE INDEX IF NOT EXISTS idx_outfits_category ON outfits(category);
CREATE INDEX IF NOT EXISTS idx_outfits_search ON outfits USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_outfits_ai_tags ON outfits USING GIN(ai_tags);
CREATE INDEX IF NOT EXISTS idx_outfit_images_outfit ON outfit_images(outfit_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_outfit ON wishlists(outfit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_outfit ON bookings(outfit_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_seller ON bookings(seller_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(pickup_date, return_date);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_txn_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_booking ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_txn_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_txn_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_txn_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_outfit ON reviews(outfit_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_disputes_booking ON disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_raised_by ON disputes(raised_by);
CREATE INDEX IF NOT EXISTS idx_ai_events_user ON ai_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_events_outfit ON ai_events(outfit_id, event_type);
CREATE INDEX IF NOT EXISTS idx_ai_events_session ON ai_events(session_id);
CREATE INDEX IF NOT EXISTS idx_trending_score ON trending_outfits(score DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_expiry ON rate_limit_events(expires_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_log ON email_queue(email_log_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expiry ON ai_cache(expires_at);

-- Performance Composite & Discovery Indexes
CREATE INDEX IF NOT EXISTS idx_outfits_discovery ON outfits(status, city, category)
  WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_overlap_check ON bookings(outfit_id, pickup_date, return_date)
  WHERE status NOT IN ('cancelled', 'completed');

CREATE INDEX IF NOT EXISTS idx_outfits_price_range ON outfits(price_1day, price_3day)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_bookings_seller_recent ON bookings(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_renter_recent ON bookings(renter_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_outfits_seller_active ON outfits(seller_id)
  WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(user_id)
  WHERE is_read = false;

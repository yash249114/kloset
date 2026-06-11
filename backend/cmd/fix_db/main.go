package main

import (
	"context"
	"os"

	"github.com/kloset/backend/internal/config"
	"github.com/kloset/backend/internal/database"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	log.Info().Msg("🌸 Starting Kloset Database Constraint and Column Patching...")

	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.ConnectPostgres(&cfg.DB)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to get underlying database connection")
	}

	// 1. Rename existing constraints if they exist
	log.Info().Msg("Renaming users table constraints to match GORM expectations...")
	renameQuery := `
	DO $$
	BEGIN
		IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key') THEN
			ALTER TABLE users RENAME CONSTRAINT users_email_key TO uni_users_email;
			RAISE NOTICE 'Renamed users_email_key to uni_users_email';
		END IF;
		IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_phone_key') THEN
			ALTER TABLE users RENAME CONSTRAINT users_phone_key TO uni_users_phone;
			RAISE NOTICE 'Renamed users_phone_key to uni_users_phone';
		END IF;
	END $$;
	`
	_, err = sqlDB.ExecContext(context.Background(), renameQuery)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to rename constraints")
	}
	log.Info().Msg("✅ Constraints renamed successfully (or already renamed).")

	// 2. Add missing columns to users table
	log.Info().Msg("Adding missing columns for Renter and Seller profiles...")
	alterQuery := `
	ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(20);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_preferences TEXT;
	ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS business_address TEXT;
	ALTER TABLE users ADD COLUMN IF NOT EXISTS pickup_address TEXT;
	ALTER TABLE users ADD COLUMN IF NOT EXISTS return_address TEXT;
	ALTER TABLE users ADD COLUMN IF NOT EXISTS gst_details VARCHAR(50);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_details VARCHAR(50);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_details TEXT;
	ALTER TABLE users ADD COLUMN IF NOT EXISTS payout_account VARCHAR(100);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_documents TEXT;
	ALTER TABLE users ADD COLUMN IF NOT EXISTS store_banner TEXT;
	ALTER TABLE users ADD COLUMN IF NOT EXISTS store_logo TEXT;
	ALTER TABLE users ADD COLUMN IF NOT EXISTS business_description TEXT;
	ALTER TABLE users ADD COLUMN IF NOT EXISTS support_contact VARCHAR(50);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS rental_policies TEXT;
	`
	_, err = sqlDB.ExecContext(context.Background(), alterQuery)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to add missing columns")
	}
	log.Info().Msg("✅ Missing columns added successfully (or already existed).")
	log.Info().Msg("🎉 Database patch migration complete!")
}

package main

import (
	"os"
	"path/filepath"

	"github.com/kloset/backend/internal/config"
	"github.com/kloset/backend/internal/database"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	log.Info().Msg("🌸 Starting Kloset Database Migration Tool...")

	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.ConnectPostgres(&cfg.DB)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	// Read launch schema SQL package
	schemaPath := filepath.Join("internal", "database", "migrations", "launch_schema.sql")
	log.Info().Str("path", schemaPath).Msg("Reading schema package file...")
	sqlBytes, err := os.ReadFile(schemaPath)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to read schema package file")
	}

	sqlContent := string(sqlBytes)

	// Execute SQL migration package against database connection
	log.Info().Msg("Executing schema package on Supabase/PostgreSQL database...")
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to get underlying database connection")
	}
	_, err = sqlDB.Exec(sqlContent)
	if err != nil {
		log.Fatal().Err(err).Msg("Database execution failed")
	}

	log.Info().Msg("✅ Database bootstrap migrations applied successfully!")
}

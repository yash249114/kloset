package main

import (
	"context"
	"fmt"
	"os"

	"github.com/kloset/backend/internal/config"
	"github.com/kloset/backend/internal/database"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	log.Info().Msg("Inspecting database schema...")

	cfg := config.Load()
	db, err := database.ConnectPostgres(&cfg.DB)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to db")
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to get sql.DB")
	}

	// 1. Get constraints
	rows, err := sqlDB.QueryContext(context.Background(), `
		SELECT conname, contype 
		FROM pg_constraint 
		WHERE conrelid = 'users'::regclass;
	`)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to query pg_constraint")
	}
	defer rows.Close()

	fmt.Println("--- CONSTRAINTS ---")
	for rows.Next() {
		var conname, contype string
		if err := rows.Scan(&conname, &contype); err != nil {
			log.Fatal().Err(err).Msg("Failed to scan row")
		}
		fmt.Printf("Constraint: %s, Type: %s\n", conname, contype)
	}

	// 2. Get indexes
	indexRows, err := sqlDB.QueryContext(context.Background(), `
		SELECT indexname, indexdef 
		FROM pg_indexes 
		WHERE tablename = 'users';
	`)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to query pg_indexes")
	}
	defer indexRows.Close()

	fmt.Println("--- INDEXES ---")
	for indexRows.Next() {
		var indexname, indexdef string
		if err := indexRows.Scan(&indexname, &indexdef); err != nil {
			log.Fatal().Err(err).Msg("Failed to scan index row")
		}
		fmt.Printf("Index: %s, Def: %s\n", indexname, indexdef)
	}
}

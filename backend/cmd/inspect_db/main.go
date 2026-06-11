package main

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "host=aws-1-ap-southeast-1.pooler.supabase.com port=5432 user=postgres.fzaaxtdxnshyeegggriv password=Yash@143swe dbname=postgres sslmode=require"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		fmt.Printf("Failed to open database: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()

	// 1. Database Version
	var version string
	err = db.QueryRow("SHOW server_version;").Scan(&version)
	if err != nil {
		fmt.Printf("Failed to fetch version: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Database Version: %s\n", version)

	// 2. Table count
	var tableCount int
	err = db.QueryRow("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';").Scan(&tableCount)
	if err != nil {
		fmt.Printf("Failed to fetch table count: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("Table Count: %d\n", tableCount)

	// List tables
	rows, err := db.Query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
	if err == nil {
		fmt.Println("Tables:")
		for rows.Next() {
			var name string
			rows.Scan(&name)
			fmt.Printf("  - %s\n", name)
		}
		rows.Close()
	}

	// 3. Custom types / enums count
	var enumCount int
	err = db.QueryRow("SELECT count(distinct typname) FROM pg_type t join pg_enum e on t.oid = e.enumtypid;").Scan(&enumCount)
	if err != nil {
		fmt.Printf("Failed to fetch enum count: %v\n", err)
	} else {
		fmt.Printf("Enum Type Count: %d\n", enumCount)
	}

	// List some custom enums
	rows, err = db.Query("SELECT distinct typname FROM pg_type t join pg_enum e on t.oid = e.enumtypid ORDER BY typname;")
	if err == nil {
		fmt.Println("Enum Types:")
		for rows.Next() {
			var name string
			rows.Scan(&name)
			fmt.Printf("  - %s\n", name)
		}
		rows.Close()
	}

	// 4. Foreign keys count
	var fkCount int
	err = db.QueryRow(`
		SELECT count(*) 
		FROM information_schema.table_constraints tc 
		WHERE constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
	`).Scan(&fkCount)
	if err != nil {
		fmt.Printf("Failed to fetch FK count: %v\n", err)
	} else {
		fmt.Printf("Foreign Key Count: %d\n", fkCount)
	}

	// 5. Indexes count
	var idxCount int
	err = db.QueryRow(`
		SELECT count(*) 
		FROM pg_stat_user_indexes 
		WHERE schemaname = 'public';
	`).Scan(&idxCount)
	if err != nil {
		fmt.Printf("Failed to fetch index count: %v\n", err)
	} else {
		fmt.Printf("Index Count: %d\n", idxCount)
	}
}

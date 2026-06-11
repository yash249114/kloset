package main

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	pass := "Yash@123swe"
	if len(os.Args) > 1 {
		pass = os.Args[1]
	}

	hosts := []string{
		"localhost",
		"aws-1-ap-southeast-1.pooler.supabase.com",
		"db.fzaaxtdxnshyeegggriv.supabase.co",
	}
	ports := []int{5432, 6543}

	for _, host := range hosts {
		for _, port := range ports {
			user := "postgres.fzaaxtdxnshyeegggriv"
			if host == "db.fzaaxtdxnshyeegggriv.supabase.co" || host == "localhost" {
				user = "postgres"
			}
			connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=postgres sslmode=require", host, port, user, pass)
			fmt.Printf("Testing connection: host=%s port=%d user=%s...\n", host, port, user)
			db, err := sql.Open("postgres", connStr)
			if err != nil {
				fmt.Printf("  sql.Open error: %v\n", err)
				continue
			}

			err = db.Ping()

			if err != nil {
				fmt.Printf("  db.Ping error: %v\n", err)
				db.Close()
				continue
			}

			fmt.Println("  ✅ Connection Successful!")
			db.Close()
			return
		}
	}
}

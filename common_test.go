package main

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"log"
	"os"
	"sort"
	"strings"
	"testing"
)

func TestMain(m *testing.M) {
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}

	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "postgres"
	}

	log.Printf("USE TEST DB ACCESS %v %v", dbUser, dbPassword)

	var err error
	db, err = sql.Open("postgres", "postgresql://"+dbUser+":"+dbPassword+"@postgres:5432?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}

	tmpDBName := fmt.Sprintf("test_%d", os.Getpid())
	if _, err := db.Exec("CREATE DATABASE " + tmpDBName); err != nil {
		log.Fatal(err)
	}
	fmt.Printf("CREATED %v\n", tmpDBName)
	db.Close()

	db, err = sql.Open("postgres", "postgresql://"+dbUser+":"+dbPassword+"@postgres/"+tmpDBName+"?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}

	entries, err := os.ReadDir("./postgres")

	if err != nil {
		log.Fatal(err)
	}

	var files []string

	for _, e := range entries {
		if !strings.Contains(e.Name(), "IGNORE_TEST") {
			files = append(files, e.Name())
		}
	}

	sort.StringsAreSorted(files)

	for _, file := range files {
		fmt.Printf("APLLY MIGRATION %v\n", file)
		data, err := os.ReadFile("./postgres/" + file)
		if err == nil {
			migration := string(data)
			_, err := db.Exec(migration)

			if err != nil {
				db.Close()

				db, err = sql.Open("postgres", "postgresql://"+dbUser+":"+dbPassword+"@postgres:5432?sslmode=disable")
				if err == nil {
					db.Exec("DROP DATABASE " + tmpDBName)
				}
				log.Fatal(err)
			}
		}
	}

	retCode := m.Run()

	db.Close()

	db, err = sql.Open("postgres", "postgresql://"+dbUser+":"+dbPassword+"@postgres:5432?sslmode=disable")
	if err == nil {
		db.Exec("DROP DATABASE " + tmpDBName)
	}

	os.Exit(retCode)
}

package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"sort"
	"strings"
	"testing"
)

var TestDb *sql.DB

func TestMain(m *testing.M) {
	adminConnect := "postgresql://postgres:123456Aa!@localhost:5432?sslmode=disable"

	db, err := sql.Open("postgres", adminConnect)
	if err != nil {
		log.Fatal(err)
	}

	tmpDBName := fmt.Sprintf("test_%d", os.Getpid())
	if _, err := db.Exec("CREATE DATABASE " + tmpDBName); err != nil {
		log.Fatal(err)
	}

	fmt.Printf("CREATED %v\n", tmpDBName)
	db.Close()

	TestDb, err = sql.Open("postgres", "postgresql://postgres:123456Aa!@localhost:5432/"+tmpDBName+"?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}

	entries, err := os.ReadDir("./postgres")

	if err != nil {
		TestDb.Close()
		db, err = sql.Open("postgres", adminConnect)
		db.Exec("DROP DATABASE " + tmpDBName)

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
			_, err := TestDb.Exec(migration)

			if err != nil {
				TestDb.Close()
				db, err = sql.Open("postgres", adminConnect)
				db.Exec("DROP DATABASE " + tmpDBName)

				log.Fatal(err)
			}
		}
	}

	retCode := m.Run()

	TestDb.Close()
	db, err = sql.Open("postgres", adminConnect)
	if _, err := db.Exec("DROP DATABASE " + tmpDBName); err != nil {
		log.Fatal(err)
	}

	os.Exit(retCode)
}

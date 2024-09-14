package main

import (
	"database/sql"
	"fmt"
	"github.com/gofiber/fiber/v2"
	//"github.com/gofiber/swagger"
	"os"
	//_ "rsoi/docs"

	_ "github.com/lib/pq"

	"log"
)

// @title Persons API
// @version 0.1
// @description Апи для лабы 1
// @contact.name RigelLab
// @contact.url https://t.me/rigellab
// @host rsoi.rigellab.ru
// @BasePath /api/v1
func main() {

	dbName, exists := os.LookupEnv("DB_NAME")
	if !exists {
		dbName = "persons"
	}

	dbUser, exists := os.LookupEnv("DB_USER")
	if !exists {
		dbUser = "program"
	}

	dbPassword, exists := os.LookupEnv("DB_PASSWORD")
	if !exists {
		dbPassword = "test"
	}

	fmt.Sprintf("USE DB %v %v %v", dbName, dbUser, dbPassword)

	var err error
	db, err := sql.Open("postgres", "postgresql://"+dbUser+":"+dbPassword+"@localhost:5432/"+dbName+"?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}

	app := fiber.New()

	v1 := app.Group("/api/v1")
	BindApi(v1, db)

	//app.Get("/swagger/*", swagger.HandlerDefault)

	app.Static("/", "public")

	// http://localhost:3000/i/will/match/anything
	app.Get("*", func(c *fiber.Ctx) error {
		c.SendFile("public/index.html")
		return nil
	})

	port := 43430
	log.Fatalln(app.Listen(fmt.Sprintf(":%v", port)))
}

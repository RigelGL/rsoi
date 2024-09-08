package main

import (
	"database/sql"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"log"
	"rsoi/model"
)

var db *sql.DB

// @Summary     Поиск пользователей
// @Tags        persons
// @Accept      json
// @Produce     json
// @Param       search query string false "Поиск по имени, адресу, работе"
// @Success 200 {object} model.ArrayResult{items=[]model.PersonData} "Пользователи"
// @Router      /persons [get]
func getPersons(c *fiber.Ctx) error {
	search := c.Query("search", "")

	var res model.PersonData
	var persons []model.PersonData
	rows, err := db.Query(
		`SELECT id, name, age, address, work
				FROM person
				WHERE name ILIKE $1
				   OR address ILIKE $1
				   OR work ILIKE $1
				ORDER BY id`,
		fmt.Sprintf("%%%s%%", search))
	defer rows.Close()

	if err != nil {
		c.Status(500)
		log.Fatalln(err)
	}

	for rows.Next() {
		rows.Scan(&res.Id, &res.Name, &res.Age, &res.Address, &res.Work)
		persons = append(persons, res)
	}

	return c.JSON(model.NewArrayResult[model.PersonData](len(persons), len(persons), persons))
}

// @Summary     Пользователь
// @Tags        persons
// @Accept      json
// @Produce     json
// @Param       id path int true "id пользователя"
// @Success 200 {object} model.PersonData "Пользователь"
// @failure 404 "Пользователь не найден"
// @Router      /persons/{id} [get]
func getPerson(c *fiber.Ctx) error {
	id := c.Params("id")

	row := db.QueryRow(
		`SELECT id, name, age, address, work
				FROM person
				WHERE id = $1`,
		id)
	var res model.PersonData

	err := row.Scan(&res.Id, &res.Name, &res.Age, &res.Address, &res.Work)
	if err != nil {
		return c.Status(404).Send(nil)
	}

	return c.JSON(res)
}

// @Summary     Создание пользователя
// @Tags        persons
// @Accept      json
// @Param request body model.PersonRequest true "Данные о пользователе"
// @Header  201 {string}  Location  "/api/v1/persons/{id}"
// @Success 201 "Пользователь создан"
// @failure 400 "Ошибка в теле запроса"
// @Router      /persons [post]
func addPerson(c *fiber.Ctx) error {
	u := new(model.PersonRequest)

	if err := c.BodyParser(u); err != nil {
		return c.Status(400).SendString(err.Error())
	}

	var id int
	err := db.QueryRow(
		`INSERT INTO person (name, age, address, work)
				VALUES ($1, $2, $3, $4)
				RETURNING id`,
		u.Name, u.Age, u.Address, u.Work).Scan(&id)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	c.Set("Location", fmt.Sprintf("/api/v1/persons/%v", id))
	return c.Status(201).Send(nil)
}

// @Summary     Обновление пользователя
// @Tags        persons
// @Accept      json
// @Param       id path int true "id пользователя"
// @Param request body model.PersonRequest true "Данные о пользователе"
// @Success 204 "Пользователь обновлён"
// @failure 400 "Ошибка в теле запроса"
// @failure 404 "Пользователь не найден"
// @Router      /persons/{id} [patch]
func updatePerson(c *fiber.Ctx) error {
	id := c.Params("id")

	u := new(model.PersonRequest)

	if err := c.BodyParser(u); err != nil {
		return c.Status(400).SendString(err.Error())
	}

	res, err := db.Exec(
		`UPDATE person
				SET name=$1,
					age=$2,
					address=$3,
					work=$4
				WHERE id = $5`,
		u.Name, u.Age, u.Address, u.Work, id)
	if amount, _ := res.RowsAffected(); amount == 0 {
		return c.Status(404).Send(nil)
	}
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	return c.Status(204).Send(nil)
}

// @Summary     Удаление пользователя
// @Tags        persons
// @Param       id path int true "id пользователя"
// @Success 204 "Пользователь удалён"
// @failure 404 "Пользователь не найден"
// @Router      /persons/{id} [delete]
func deletePerson(c *fiber.Ctx) error {
	id := c.Params("id")

	var count int
	err := db.QueryRow(
		`WITH deleted AS (DELETE FROM person WHERE id = $1 RETURNING id)
				SELECT count(*)
				FROM deleted`,
		id).Scan(&count)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	if count == 0 {
		return c.Status(404).Send(nil)
	}

	return c.Status(204).Send(nil)
}

func BindApi(router fiber.Router, database *sql.DB) {
	db = database

	persons := router.Group("persons", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "application/json")
		return c.Next()
	})

	persons.Get("", getPersons)
	persons.Get(":id", getPerson)
	persons.Post("", addPerson)
	persons.Patch(":id", updatePerson)
	persons.Delete(":id", deletePerson)
}

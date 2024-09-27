package main

import (
	"database/sql"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"net/http"
	"rsoi/model"
	"strconv"
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

	persons, err := findPersons(search)

	if err.code == 500 {
		return c.Status(500).Send(nil)
	}

	return c.JSON(persons.Items)
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
	id, idErr := strconv.Atoi(c.Params("id"))

	if idErr != nil {
		return c.Status(400).Send(nil)
	}

	var person, err = findPersonById(id)

	if err.code == 404 {
		return c.Status(404).Send(nil)
	}

	return c.JSON(person)
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
		return c.Status(http.StatusBadRequest).SendString(err.Error())
	}

	id, err := addNewPerson(u)

	if err.code == 500 {
		return c.Status(http.StatusInternalServerError).Send(nil)
	}

	c.Set("Location", fmt.Sprintf("/api/v1/persons/%v", id))
	return c.Status(http.StatusCreated).Send(nil)
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
	id, idErr := strconv.Atoi(c.Params("id"))

	if idErr != nil {
		return c.Status(http.StatusBadRequest).Send(nil)
	}

	u := new(model.PersonRequest)

	if err := c.BodyParser(u); err != nil {
		return c.Status(http.StatusBadRequest).SendString(err.Error())
	}

	err := updatePersonById(id, u)

	if err.code == 404 {
		return c.Status(http.StatusNotFound).Send(nil)
	}
	if err.code == 500 {
		return c.Status(http.StatusInternalServerError).Send(nil)
	}

	person, err := findPersonById(id)

	return c.Status(http.StatusOK).JSON(person)
}

// @Summary     Удаление пользователя
// @Tags        persons
// @Param       id path int true "id пользователя"
// @Success 204 "Пользователь удалён"
// @failure 404 "Пользователь не найден"
// @Router      /persons/{id} [delete]
func deletePerson(c *fiber.Ctx) error {
	id, idErr := strconv.Atoi(c.Params("id"))

	if idErr != nil {
		return c.Status(http.StatusBadRequest).Send(nil)
	}

	err := deletePersonById(id)

	if err.code == 404 {
		return c.Status(http.StatusNotFound).Send(nil)
	}

	if err.code == 500 {
		return c.Status(http.StatusInternalServerError).Send(nil)
	}

	return c.Status(http.StatusNoContent).Send(nil)
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

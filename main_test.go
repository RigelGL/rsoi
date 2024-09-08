package main

import (
	"bytes"
	"encoding/json"
	"github.com/stretchr/testify/require"
	"io"
	"net/http"
	"rsoi/model"
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/gofiber/fiber/v2"
)

func Test_CreatePerson(t *testing.T) {
	app := fiber.New()
	BindApi(app.Group("/api/v1"), TestDb)

	var age int32 = 10
	var work = "No"
	var address = "City"
	var b, _ = json.Marshal(model.PersonRequest{Name: "User", Age: &age, Work: &work, Address: &address})
	req, _ := http.NewRequest("POST", "/api/v1/persons", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	require.NoError(t, err)

	assert.Equal(t, http.StatusCreated, resp.StatusCode)
	assert.Equal(t, "application/json", resp.Header.Get("Content-Type"))
	assert.Equal(t, "/api/v1/persons/1", resp.Header.Get("Location"))

	require.NoError(t, err)
}

func Test_GetPerson(t *testing.T) {
	app := fiber.New()
	BindApi(app.Group("/api/v1"), TestDb)

	req, _ := http.NewRequest("GET", "/api/v1/persons/1", nil)
	resp, err := app.Test(req)
	require.NoError(t, err)

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, "application/json", resp.Header.Get("Content-Type"))

	body, err := io.ReadAll(resp.Body)
	require.NoError(t, err)

	var person model.PersonData
	require.NoError(t, json.Unmarshal(body, &person))
	assert.Equal(t, int64(1), person.Id)
	assert.Equal(t, "User", person.Name)
	assert.Equal(t, int32(10), *person.Age)
	assert.Equal(t, "No", *person.Work)
	assert.Equal(t, "City", *person.Address)
}

func Test_UpdatePerson(t *testing.T) {
	app := fiber.New()
	BindApi(app.Group("/api/v1"), TestDb)

	var age int32 = 12
	var work = "NoUpd"
	var address = "CityUpd"
	var b, _ = json.Marshal(model.PersonRequest{Name: "UserUpd", Age: &age, Work: &work, Address: &address})
	req, _ := http.NewRequest("PATCH", "/api/v1/persons/1", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req)
	require.NoError(t, err)

	assert.Equal(t, http.StatusNoContent, resp.StatusCode)

	req, _ = http.NewRequest("GET", "/api/v1/persons/1", nil)
	resp, err = app.Test(req)
	require.NoError(t, err)

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	assert.Equal(t, "application/json", resp.Header.Get("Content-Type"))

	body, err := io.ReadAll(resp.Body)
	require.NoError(t, err)

	var person model.PersonData
	require.NoError(t, json.Unmarshal(body, &person))
	assert.Equal(t, int64(1), person.Id)
	assert.Equal(t, "UserUpd", person.Name)
	assert.Equal(t, int32(12), *person.Age)
	assert.Equal(t, "NoUpd", *person.Work)
	assert.Equal(t, "CityUpd", *person.Address)
}

func Test_PersonsList(t *testing.T) {
	app := fiber.New()
	BindApi(app.Group("/api/v1"), TestDb)

	req, _ := http.NewRequest("GET", "/api/v1/persons", nil)
	resp, err := app.Test(req)
	require.NoError(t, err)

	assert.Equal(t, http.StatusOK, resp.StatusCode)

	body, err := io.ReadAll(resp.Body)
	require.NoError(t, err)

	var persons model.ArrayResult[model.PersonData]
	require.NoError(t, json.Unmarshal(body, &persons))
	assert.Equal(t, 1, len(persons.Items))
}

func Test_DeletePerson(t *testing.T) {
	app := fiber.New()
	BindApi(app.Group("/api/v1"), TestDb)

	req, _ := http.NewRequest("DELETE", "/api/v1/persons/1", nil)
	resp, err := app.Test(req)
	require.NoError(t, err)

	assert.Equal(t, http.StatusNoContent, resp.StatusCode)

	req, _ = http.NewRequest("GET", "/api/v1/persons/1", nil)
	resp, err = app.Test(req)
	require.NoError(t, err)

	assert.Equal(t, http.StatusNotFound, resp.StatusCode)
}

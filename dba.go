package main

import (
	"fmt"
	"rsoi/model"
)

type DbaError struct {
	code int
}

func findPersons(search string) (*model.ArrayResult[model.PersonData], DbaError) {
	var res model.PersonData
	var persons = []model.PersonData{}
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
		return nil, DbaError{code: 500}
	}

	for rows.Next() {
		rows.Scan(&res.Id, &res.Name, &res.Age, &res.Address, &res.Work)
		persons = append(persons, res)
	}

	return model.NewArrayResult[model.PersonData](len(persons), len(persons), persons), DbaError{code: 0}
}

func findPersonById(id int) (model.PersonData, DbaError) {
	row := db.QueryRow(
		`SELECT id, name, age, address, work
				FROM person
				WHERE id = $1`,
		id)
	var res model.PersonData

	err := row.Scan(&res.Id, &res.Name, &res.Age, &res.Address, &res.Work)
	if err != nil {
		return res, DbaError{code: 404}
	}

	return res, DbaError{code: 0}
}

func addNewPerson(request *model.PersonRequest) (int, DbaError) {
	var id int
	err := db.QueryRow(
		`INSERT INTO person (name, age, address, work)
				VALUES ($1, $2, $3, $4)
				RETURNING id`,
		request.Name, request.Age, request.Address, request.Work).Scan(&id)
	if err != nil {
		return 0, DbaError{code: 500}
	}
	return id, DbaError{code: 0}
}

func updatePersonById(id int, request *model.PersonRequest) DbaError {
	person, personErr := findPersonById(id)

	if personErr.code == 0 {
		if request.Name == nil {
			request.Name = person.Name
		}

		if request.Age == nil {
			request.Age = person.Age
		}

		if request.Work == nil {
			request.Work = person.Work
		}

		if request.Address == nil {
			request.Address = person.Address
		}
	}

	res, err := db.Exec(
		`UPDATE person
				SET name=$1,
					age=$2,
					address=$3,
					work=$4
				WHERE id = $5`,
		request.Name, request.Age, request.Address, request.Work, id)
	if amount, _ := res.RowsAffected(); amount == 0 {
		return DbaError{code: 404}
	}
	if err != nil {
		return DbaError{code: 500}
	}
	return DbaError{code: 0}
}

func deletePersonById(id int) DbaError {
	var count int
	err := db.QueryRow(
		`WITH deleted AS (DELETE FROM person WHERE id = $1 RETURNING id)
				SELECT count(*)
				FROM deleted`,
		id).Scan(&count)
	if err != nil {
		return DbaError{code: 500}
	}

	if count == 0 {
		return DbaError{code: 404}
	}

	return DbaError{code: 0}
}

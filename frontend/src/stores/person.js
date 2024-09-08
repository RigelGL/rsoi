import { defineStore } from 'pinia'
import api, { ezAction } from "@/utils/api.js";

export const usePersonsStore = defineStore('person', () => {
    const getPersons = ezAction('persons', api.get);
    const getPerson = ezAction('persons/{id}', api.get);
    const addPerson = ezAction('persons', api.post);
    const updatePerson = ezAction('persons/{id}', api.patch);
    const deletePerson = ezAction('persons/{id}', api.del);

    return { getPersons, getPerson, addPerson, updatePerson, deletePerson }
})

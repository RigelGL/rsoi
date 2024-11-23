import { Injectable } from "@nestjs/common";
import { PersonInfo, PersonRequest } from "../api/dto";


@Injectable()
export class PersonThirdService {
    private readonly url: string;

    constructor() {
        this.url = process.env.PERSON_URL;
        console.log(process.env);
    }

    async getAllRawPersons(): Promise<PersonInfo[]> {
        const resp = await fetch(`${this.url}/api/v1/persons`);
        if (resp.status !== 200)
            return null;
        return await resp.json();
    }

    async getPersonByName(name: string): Promise<PersonInfo | null> {
        console.log('URL', `${this.url}/api/v1/persons/byName?name=${name}`);
        const resp = await fetch(`${this.url}/api/v1/persons/byName?name=${name}`);
        if (resp.status !== 200)
            return null;
        return await resp.json();
    }

    async addPerson(request: PersonRequest): Promise<PersonInfo | null> {
        let resp = await fetch(`${this.url}/api/v1/persons`, {
            method: 'POST',
            headers: { 'Content-type': 'application/json;charset=utf-8' },
            body: JSON.stringify(request),
        });
        if (resp.status !== 201) return null;

        return await this.getPersonByName(request.name);
    }
}
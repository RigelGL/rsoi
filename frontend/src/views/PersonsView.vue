<template>
    <div>
        <div class="h4">
            Пользователи <a href="https://rsoi.rigellab.ru/swagger" target="_blank">Swagger</a>
        </div>

        <div class="mt-4">
            <v-text-field v-model="search" variant="outlined" density="compact"
                          label="Поиск по имени, адресу, месту работы"/>
            <v-table>
                <thead>
                <tr>
                    <th class="text-left" style="width: 40px">#</th>
                    <th class="text-left">Id</th>
                    <th class="text-left">Имя</th>
                    <th class="text-left">Возраст</th>
                    <th class="text-left">Адрес</th>
                    <th class="text-left">Работа</th>
                    <th style="width: 50px"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(e, i) in persons" :key="e.id">
                    <td>{{ i + 1 }}</td>
                    <td>{{ e.id }}</td>
                    <td>{{ e.name }}</td>
                    <td>{{ e.age }}</td>
                    <td>{{ e.address }}</td>
                    <td>{{ e.work }}</td>
                    <td>
                        <v-btn icon size="small" @click="openPerson(e)" variant="text">
                            <v-icon>mdi-pencil-outline</v-icon>
                        </v-btn>
                    </td>
                </tr>
                </tbody>
            </v-table>

            <v-dialog width="700" v-model="add.dialog" transition="scale">
                <template v-slot:activator="{props: activatorProps}">
                    <v-btn class="mt-4" color="primary" @click="openPerson()">Добавить пользователя</v-btn>
                </template>

                <v-card>
                    <v-card-title class="d-flex justify-space-between">
                        <div>{{
                                selected.id ? `Изменить пользователя ${selected.name}` : 'Добавить пользователя'
                            }}
                        </div>

                        <v-dialog width="500" v-model="add.deleteDialog">
                            <template v-slot:activator="{props: activatorProps}">
                                <v-btn v-bind="activatorProps" icon variant="text" color="red" v-if="selected.id">
                                    <v-icon>mdi-delete-outline</v-icon>
                                </v-btn>
                            </template>

                            <v-card>
                                <v-card-title>
                                    {{ `Удалить пользователя ${selected.name}?` }}
                                </v-card-title>
                                <v-card-text>
                                    Данное действие необратимо
                                </v-card-text>
                                <v-card-actions class="d-flex justify-space-between">
                                    <v-btn variant="text" @click="add.deleteDialog = false">Отмена</v-btn>
                                    <v-btn variant="outlined" color="red" @click="deletePerson()">Удалить</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-card-title>
                    <v-card-text class="pt-4">
                        <v-text-field label="Имя" v-model.trim="add.name" variant="outlined" density="compact"/>
                        <v-text-field label="Вораст" v-model.number="add.age" type="number" variant="outlined"
                                      density="compact"/>
                        <v-text-field label="Адрес" v-model.trim="add.address" variant="outlined" density="compact"/>
                        <v-text-field label="Работа" v-model.trim="add.work" variant="outlined" density="compact"/>
                    </v-card-text>
                    <v-card-actions class="d-flex justify-space-between">
                        <v-btn variant="text" @click="add.dialog = false">Отмена</v-btn>
                        <v-btn variant="outlined" color="primary" @click="savePerson()">
                            {{ selected.id ? 'Сохранить' : 'Добавить' }}
                        </v-btn>
                    </v-card-actions>
                </v-card>

            </v-dialog>
        </div>
    </div>
</template>

<script>
import {usePersonsStore} from "@/stores/person.js";
import {getCreatedId} from "@/utils/api.js";
import collections from "@/utils/collections.js";


export default {
    setup() {
        return {personsStore: usePersonsStore()};
    },
    data: () => ({
        persons: [],
        count: 0,
        pages: 0,
        page: 0,
        limit: 100,

        search: '',
        shouldSearch: true,
        timer: null,

        selected: {},
        add: {
            dialog: false,
            loading: false,


            name: '',
            age: '',
            address: '',
            work: '',

            editable: ['name', 'age', 'address', 'work'],

            deleteDialog: false,
            deleteLoading: false,
        }
    }),
    watch: {
        search() {
            this.shouldSearch = true;
        }
    },
    methods: {
        openPerson(person) {
            this.selected = person || {};
            this.add.editable.forEach(e => this.add[e] = person?.[e] || '');
            this.add.dialog = true;
        },
        savePerson() {
            const name = this.add.name;

            if (!name) return;

            this.add.loading = true;
            (this.selected.id ? this.personsStore.updatePerson : this.personsStore.addPerson)({
                id: this.selected.id,
                name: name,
                age: +this.add.age,
                address: this.add.address,
                work: this.add.work,
            }).then(e => {
                if (e.status === 200) {
                    const id = this.selected.id || getCreatedId(e.headers.location);
                    this.personsStore.getPerson({id}).then(e => {
                        this.add.loading = false;
                        if (e.status !== 200) return

                        collections.addOrReplace(this.persons, e.json);
                        this.add.dialog = false;
                    });
                } else
                    this.add.loading = false;
            });
        },
        deletePerson() {
            const id = this.selected.id;
            if (!id) return;

            this.add.deleteLoading = true;
            this.personsStore.deletePerson({id}).then(e => {
                this.add.deleteLoading = false;
                if (e.status !== 200) return;

                collections.remove(this.persons, id);
                this.add.deleteDialog = false;
                this.add.dialog = false;
            })
        },

        searchPersons() {
            if (!this.shouldSearch) return;
            this.shouldSearch = false;
            this.personsStore.getPersons({search: this.search}).then(e => {
                if (e.status !== 200) return

                this.persons = e.json; //.items;
                this.count = this.persons.length;// e.json.count;
                this.pages = 1; //e.json.pages;
            });
        }
    },
    mounted() {
        this.timer = setInterval(this.searchPersons, 100);
    },
    beforeUnmount() {
        clearInterval(this.timer);
    }
}
</script>

<style scoped>

</style>
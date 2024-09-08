<template>
    <v-card class="card pa-2" style="width: 400px">
        <v-card-title class="text-center">Вход в Лабу 1</v-card-title>
        <v-card-text class="mt-2">
            <v-text-field v-model="email" variant="outlined" density="compact" label="Почта" :error-messages="error.email"/>
            <v-text-field v-model="password" type="password" variant="outlined" density="compact" label="Пароль" :error-messages="error.password"/>
        </v-card-text>
        <v-card-actions>
            <v-btn color="primary" variant="elevated" block @click="submit()">Войти</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>

import { useUserStore } from "@/stores/user.js";

export default {
    data: () => ({
        email: '',
        password: '',
        loading: false,
        error: { email: null, password: null },
    }),
    setup() {
        return { userStore: useUserStore() };
    },
    methods: {
        submit() {
            this.loading = true;
            const email = this.email.trim();
            const password = this.password.trim();

            this.error.email = null;
            this.error.password = null;

            if(!email) return this.error.email = 'Введите почту';
            if(!password) return this.error.password = 'Введите пароль';

            this.userStore.login({email, password}).then(e => {
                this.loading = false;
                if(e.status === 410) return this.error.email = 'Почта не найдена';
                if(e.status === 409) return this.error.password = 'Неверный пароль';
            })
        },
    }
}
</script>

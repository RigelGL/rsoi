import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from "@/utils/api.js";

export const useUserStore = defineStore('user', () => {
    let user = ref(null);

    function getMe() {
        api.authGet('user/me').then(e => {
            user = e.status === 200 ? e.json : null;
        })
    }

    function logout() {
        user = null;
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
    }

    function login(data) {
        return new Promise(resolve => api.post('user/login', { ...data }).then(e => {
            if (e.status === 200) {
                user = e.json.user;
                localStorage.setItem('access', e.json.access);
                localStorage.setItem('refresh', e.json.refresh);
            }
            resolve(e);
        }));
    }

    return { user, getMe, login }
})

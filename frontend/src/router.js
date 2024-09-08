import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/login', name: 'signin', component: () => import('@/views/auth/SigninPage.vue'), meta: { layout: 'auth', guest: true } },
        { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
        { path: '/persons', name: 'persons', component: () => import('@/views/PersonsView.vue') },

        { path: '/:pathMatch(.*)*', name: 'Error', component: () => import('@/views/error/NotFoundPage.vue'), meta: { layout: 'error', guest: true } },
    ]
})

router.beforeEach((to, from, next) => {
    // if (to.meta?.guest) {
    //     if (localStorage.getItem('access'))
    //         return next('/');
    // }
    // else if (!to.meta?.guest) {
    //     if (!localStorage.getItem('access'))
    //         return next('/login');
    // }
    return next()
})

export default router

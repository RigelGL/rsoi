<template>
    <v-app>
        <component :is="currentLayout" v-if="isRouterLoaded">
            <router-view/>
        </component>
    </v-app>
</template>

<script>
import errorLayout from '@/layouts/ErrorLayout.vue'
import authLayout from '@/layouts/AuthLayout.vue'
import simpleLayout from '@/layouts/SimpleLayout.vue'
import defaultLayout from '@/layouts/DefaultLayout.vue'


export default {
    components: {
        authLayout,
        errorLayout,
        simpleLayout,
        defaultLayout,
    },
    computed: {
        isRouterLoaded: function () {
            return this.$route.name !== null;
        },
        currentLayout: function () {
            return `${this.$route.meta.layout || 'default'}Layout`;
        }
    },
}
</script>

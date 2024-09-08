<template>
    <div class="d-flex flex-grow-1">
        <v-navigation-drawer v-model="drawer" app floating class="elevation-1" light style="z-index: 200">
            <v-list nav>
                <v-list-item link to="/">Главная</v-list-item>
                <v-list-item link to="/persons">Пользователи</v-list-item>
            </v-list>
        </v-navigation-drawer>
        <v-main>
            <div class="pa-2">
                <slot/>
            </div>
        </v-main>
    </div>
</template>

<script>

export default {
    components: {},
    data: () => ({ drawer: true }),
    computed: {},
    methods: {},
    mounted() {
    },
    beforeDestroy() {
    }
}
</script>

<style scoped>

</style>

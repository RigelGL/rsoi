<template>
    <v-card class="text-center w-full error-page pa-3">
        <v-img src="/images/illustrations/404-illustration.svg" max-height="400" contain/>
        <div class="display-2 mt-10">Как вы здесь оказались?</div>
        <div class="mt-3 mb-6">Страница не найдена</div>
        <v-btn to="/" block large color="primary">На главную</v-btn>
    </v-card>
</template>

<style>
.error-page {
    max-width: 500px;
}
</style>

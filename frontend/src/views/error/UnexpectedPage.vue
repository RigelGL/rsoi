<template>
    <v-card class="text-center w-full error-page pa-3">
        <v-img src="/images/illustrations/500-illustration.svg" max-height="400" contain/>
        <div class="display-2 mt-10">Ой! Что-то пошло не так</div>
        <div class="mt-3 mb-10">Сообщите об этой проблеме разработчику</div>
        <v-btn to="/" block large color="primary">На главную</v-btn>
    </v-card>
</template>

<style>
.error-page {
    max-width: 500px;
}
</style>

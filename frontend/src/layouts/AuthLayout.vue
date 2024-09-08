<template>
    <div class="flex-grow-1 align-center justify-center d-flex flex-column" style="min-height: 100vh">
        <div class="layout-content ma-auto w-full">
            <slot/>
        </div>
    </div>
</template>

<script>

export default {
    computed: {}
}
</script>

<style scoped>
.layout-content {
    max-width: 480px;
}
</style>

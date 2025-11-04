<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
    <div id="app">
        <RouterView />
    </div>
</template>

<style scoped>
#app {
    width: 100%;
    min-height: 100vh;
    overflow: hidden;
    /* 禁用文本选中 */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}
</style>

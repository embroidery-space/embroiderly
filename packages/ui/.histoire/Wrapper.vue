<script setup lang="ts">
import App from "../src/components/App/App.vue";
</script>

<template>
  <App :portal="false" :toasts="null">
    <slot />
  </App>
</template>

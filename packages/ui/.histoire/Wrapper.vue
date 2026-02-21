<script setup lang="ts">
import App from "../src/components/App/App.vue";

defineSlots<{ default(): any }>();
</script>

<template>
  <App :portal="false" :toaster="null">
    <slot />
  </App>
</template>

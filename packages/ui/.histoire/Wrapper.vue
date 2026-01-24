<template>
  <App :portal="false">
    <slot />
  </App>
</template>

<script setup lang="ts">
  import { App } from "../src/";
</script>

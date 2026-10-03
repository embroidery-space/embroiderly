<script setup lang="ts">
import InputColor from "../InputColor.vue";
</script>

<template>
  <div id="input-color-states">
    <InputColor />
    <InputColor disabled />
  </div>
</template>

<style>
#input-color-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

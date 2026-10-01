<script setup lang="ts">
import Input from "../Input.vue";
</script>

<template>
  <div id="input-states">
    <Input model-value="Default" />
    <Input model-value="Disabled" disabled />
  </div>
</template>

<style>
#input-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

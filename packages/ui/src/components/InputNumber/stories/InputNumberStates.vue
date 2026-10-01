<script setup lang="ts">
import InputNumber from "../InputNumber.vue";
</script>

<template>
  <div id="input-number-states">
    <InputNumber placeholder="Default" />
    <InputNumber placeholder="Disabled" disabled />
  </div>
</template>

<style>
#input-number-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

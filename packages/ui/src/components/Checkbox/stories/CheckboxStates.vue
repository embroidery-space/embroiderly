<script setup lang="ts">
import Checkbox from "../Checkbox.vue";
</script>

<template>
  <div id="checkbox-states">
    <Checkbox label="Default" />
    <Checkbox label="Disabled" disabled />
    <Checkbox label="Checked" :model-value="true" />
    <Checkbox label="Checked disabled" :model-value="true" disabled />
  </div>
</template>

<style>
#checkbox-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

<script setup lang="ts">
import Switch from "../Switch.vue";
</script>

<template>
  <div id="switch-states">
    <Switch label="Default" />
    <Switch label="Disabled" disabled />
    <Switch label="Checked" :model-value="true" />
    <Switch label="Checked disabled" :model-value="true" disabled />
  </div>
</template>

<style>
#switch-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

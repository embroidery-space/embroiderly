<script setup lang="ts">
import ToolToggle from "../ToolToggle.vue";
</script>

<template>
  <div id="tool-toggle-states">
    <ToolToggle icon="lucide:eye" tooltip="Default" />
    <ToolToggle icon="lucide:eye" tooltip="Disabled" disabled />
    <ToolToggle icon="lucide:eye" tooltip="Toggled" :model-value="true" />
    <ToolToggle icon="lucide:eye" tooltip="Toggled disabled" :model-value="true" disabled />
  </div>
</template>

<style>
#tool-toggle-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

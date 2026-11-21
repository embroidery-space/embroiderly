<script setup lang="ts">
import ToolToggle from "../ToolToggle.vue";
</script>

<template>
  <div id="tool-toggle-states">
    <ToolToggle icon="visibility" tooltip="Default" />
    <ToolToggle icon="visibility" tooltip="Disabled" disabled />
    <ToolToggle icon="visibility" tooltip="Toggled" :model-value="true" />
    <ToolToggle icon="visibility" tooltip="Toggled disabled" :model-value="true" disabled />
  </div>
</template>

<style>
#tool-toggle-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

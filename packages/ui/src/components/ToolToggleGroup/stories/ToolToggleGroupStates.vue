<script setup lang="ts">
import ToolToggleGroup from "../ToolToggleGroup.vue";
import type { ToolToggleGroupProps } from "../ToolToggleGroup.vue";

defineProps<Pick<ToolToggleGroupProps, "items">>();
</script>

<template>
  <div id="tool-toggle-group-states">
    <ToolToggleGroup :items="items" model-value="solid" />
    <ToolToggleGroup :items="items" model-value="solid" disabled />
  </div>
</template>

<style>
#tool-toggle-group-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

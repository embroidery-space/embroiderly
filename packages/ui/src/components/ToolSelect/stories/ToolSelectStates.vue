<script setup lang="ts">
import ToolSelect from "../ToolSelect.vue";
import type { ToolSelectProps } from "../ToolSelect.vue";

defineProps<Pick<ToolSelectProps, "items">>();
</script>

<template>
  <div id="tool-select-states">
    <ToolSelect model-value="pencil" :items="items" />
    <ToolSelect model-value="pencil" :items="items" disabled />
  </div>
</template>

<style>
#tool-select-states {
  display: flex;
  gap: calc(var(--spacing) * 4);
  align-items: flex-start;
}
</style>

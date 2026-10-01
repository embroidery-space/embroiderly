<script setup lang="ts">
import ToolSelect from "../ToolSelect.vue";
import type { ToolSelectProps } from "../ToolSelect.vue";

defineProps<Pick<ToolSelectProps, "items">>();

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div id="tool-select-sizes">
    <template v-for="size in sizes" :key="size">
      <ToolSelect model-value="pencil" :items="items" :size="size" />
    </template>
  </div>
</template>

<style>
#tool-select-sizes {
  display: flex;
  gap: calc(var(--spacing) * 4);
  align-items: flex-start;
}
</style>

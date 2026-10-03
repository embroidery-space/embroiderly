<script setup lang="ts">
import ToolSelect from "../ToolSelect.vue";
import type { ToolSelectProps } from "../ToolSelect.vue";

defineOptions({ inheritAttrs: false });
defineProps<Pick<ToolSelectProps, "items">>();
</script>

<template>
  <div id="tool-select-open">
    <ToolSelect v-bind="$attrs" :items="items" />
  </div>
</template>

<style>
#tool-select-open {
  width: calc(var(--spacing) * 48);
  height: calc(var(--spacing) * 48);
}
</style>

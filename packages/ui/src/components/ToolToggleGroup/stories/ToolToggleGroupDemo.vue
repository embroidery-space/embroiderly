<script setup lang="ts">
import ToolToggleGroup from "../ToolToggleGroup.vue";
import type { ToolToggleGroupProps } from "../ToolToggleGroup.vue";

defineOptions({ inheritAttrs: false });
defineProps<Pick<ToolToggleGroupProps, "items">>();
</script>

<template>
  <ToolToggleGroup v-bind="$attrs" :items="items" />
</template>

<script setup lang="ts">
import ToolToggle from "../ToolToggle.vue";
import type { ToolToggleProps } from "../ToolToggle.vue";

defineOptions({ inheritAttrs: false });
defineProps<Pick<ToolToggleProps, "icon">>();
</script>

<template>
  <ToolToggle v-bind="$attrs" :icon="icon" />
</template>

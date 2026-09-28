<script setup lang="ts">
import ToolSelect from "../ToolSelect.vue";
import type { ToolSelectProps } from "../ToolSelect.vue";

defineOptions({ inheritAttrs: false });
defineProps<Pick<ToolSelectProps, "items">>();
</script>

<template>
  <ToolSelect v-bind="$attrs" :items="items" />
</template>

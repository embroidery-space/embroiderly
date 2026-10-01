<script setup lang="ts">
import Progress from "../Progress.vue";
import type { ProgressProps } from "../Progress.vue";

withDefaults(defineProps<ProgressProps & { modelValue?: number | null }>(), {
  orientation: "horizontal",
  modelValue: null,
});
</script>

<template>
  <div id="progress-demo" :class="orientation">
    <Progress :model-value="modelValue" :orientation="orientation" :color="color" :size="size" />
  </div>
</template>

<style>
#progress-demo {
  &.horizontal {
    width: calc(var(--spacing) * 96);
  }

  &.vertical {
    height: calc(var(--spacing) * 48);
  }
}
</style>

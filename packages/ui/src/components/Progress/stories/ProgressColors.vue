<script setup lang="ts">
import Progress from "../Progress.vue";
import type { ProgressProps } from "../Progress.vue";

const colors: NonNullable<ProgressProps["color"]>[] = [
  "primary",
  "error",
  "warning",
  "success",
  "info",
  "help",
  "neutral",
];
</script>

<template>
  <div id="progress-colors">
    <Progress v-for="color in colors" :key="color" :color="color" />
  </div>
</template>

<style>
#progress-colors {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  width: calc(var(--spacing) * 96);
}
</style>

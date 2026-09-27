<script setup lang="ts">
import Progress from "../Progress.vue";
import type { ProgressProps } from "../Progress.vue";

const sizes: NonNullable<ProgressProps["size"]>[] = ["xs", "sm", "md", "lg", "xl"];
</script>

<template>
  <div id="progress-sizes">
    <Progress v-for="size in sizes" :key="size" :size="size" />
  </div>
</template>

<style>
#progress-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  width: calc(var(--spacing) * 96);
}
</style>

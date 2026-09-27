<script setup lang="ts">
import Separator from "../Separator.vue";
import type { SeparatorProps } from "../Separator.vue";

const sizes: NonNullable<SeparatorProps["size"]>[] = ["xs", "sm", "md", "lg", "xl"];
</script>

<template>
  <div id="separator-sizes">
    <Separator v-for="size in sizes" :key="size" :size="size" />
  </div>
</template>

<style>
#separator-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  width: calc(var(--spacing) * 96);
}
</style>

<script setup lang="ts">
import InputColor from "../InputColor.vue";
import type { InputColorProps } from "../InputColor.vue";

const sizes: NonNullable<InputColorProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="input-color-sizes">
    <template v-for="size in sizes" :key="size">
      <InputColor :size="size" />
    </template>
  </div>
</template>

<style>
#input-color-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

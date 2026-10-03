<script setup lang="ts">
import Checkbox from "../Checkbox.vue";
import type { CheckboxProps } from "../Checkbox.vue";

const sizes: NonNullable<CheckboxProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="checkbox-sizes">
    <template v-for="size in sizes" :key="size">
      <Checkbox :size="size" :label="`Size: ${size}`" />
    </template>
  </div>
</template>

<style>
#checkbox-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

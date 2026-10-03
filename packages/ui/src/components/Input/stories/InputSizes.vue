<script setup lang="ts">
import Input from "../Input.vue";
import type { InputProps } from "../Input.vue";

const sizes: NonNullable<InputProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="input-sizes">
    <template v-for="size in sizes" :key="size">
      <Input :model-value="`Size: ${size}`" :size="size" />
    </template>
  </div>
</template>

<style>
#input-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

<script setup lang="ts">
import InputNumber from "../InputNumber.vue";
import type { InputNumberProps } from "../InputNumber.vue";

const sizes: NonNullable<InputNumberProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="input-number-sizes">
    <template v-for="size in sizes" :key="size">
      <InputNumber :size="size" :placeholder="`Size: ${size}`" />
    </template>
  </div>
</template>

<style>
#input-number-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

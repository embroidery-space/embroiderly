<script setup lang="ts">
import InputNumber from "../InputNumber.vue";
import type { InputNumberProps } from "../InputNumber.vue";

const variants: NonNullable<InputNumberProps["variant"]>[] = ["subtle", "outline"];
</script>

<template>
  <div id="input-number-variants">
    <template v-for="variant in variants" :key="variant">
      <InputNumber :variant="variant" :placeholder="`Variant: ${variant}`" />
    </template>
  </div>
</template>

<style>
#input-number-variants {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

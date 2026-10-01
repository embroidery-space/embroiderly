<script setup lang="ts">
import Input from "../Input.vue";
import type { InputProps } from "../Input.vue";

const variants: NonNullable<InputProps["variant"]>[] = ["subtle", "outline", "none"];
</script>

<template>
  <div id="input-variants">
    <template v-for="variant in variants" :key="variant">
      <Input :model-value="`Variant: ${variant}`" :variant="variant" />
    </template>
  </div>
</template>

<style>
#input-variants {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

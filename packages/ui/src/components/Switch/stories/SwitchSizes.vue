<script setup lang="ts">
import Switch from "../Switch.vue";
import type { SwitchProps } from "../Switch.vue";

const sizes: NonNullable<SwitchProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="switch-sizes">
    <template v-for="size in sizes" :key="size">
      <Switch :size="size" :label="`Size: ${size}`" />
    </template>
  </div>
</template>

<style>
#switch-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

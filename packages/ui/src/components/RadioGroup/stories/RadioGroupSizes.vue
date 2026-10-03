<script setup lang="ts">
import RadioGroup from "../RadioGroup.vue";
import type { RadioGroupProps } from "../RadioGroup.vue";

const sizes: NonNullable<RadioGroupProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="radio-group-sizes">
    <template v-for="size in sizes" :key="size">
      <RadioGroup :size="size" :items="[`Size: ${size}`]" />
    </template>
  </div>
</template>

<style>
#radio-group-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>

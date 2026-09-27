<script setup lang="ts">
import InputDimensions from "../InputDimensions.vue";
import type { InputDimensionsProps } from "../InputDimensions.vue";

defineOptions({ inheritAttrs: false });

const sizes: NonNullable<InputDimensionsProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="input-dimensions-sizes">
    <InputDimensions
      v-for="size in sizes"
      :key="size"
      v-bind="$attrs"
      :size="size"
      :width-field-options="{ label: 'Width' }"
      :height-field-options="{ label: 'Height' }"
    />
  </div>
</template>

<style>
#input-dimensions-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
}
</style>

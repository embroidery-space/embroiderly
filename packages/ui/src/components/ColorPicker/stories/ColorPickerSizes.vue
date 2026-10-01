<script setup lang="ts">
import ColorPicker from "../ColorPicker.vue";
import type { ColorPickerProps } from "../ColorPicker.vue";

const sizes: NonNullable<ColorPickerProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="color-picker-sizes">
    <template v-for="size in sizes" :key="size">
      <div>
        <span class="label">Size: {{ size }}</span>
        <ColorPicker :size="size" />
      </div>
    </template>
  </div>
</template>

<style>
#color-picker-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);

  width: calc(var(--spacing) * 64);

  > div > :not(:last-child) {
    margin-block-end: calc(var(--spacing) * 2);
  }

  .label {
    display: block;

    font-size: var(--text-xs);
    color: var(--text-color-dimmed);
  }
}
</style>

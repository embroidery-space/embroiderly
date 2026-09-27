<script setup lang="ts">
import Slider from "../Slider.vue";
import type { SliderProps } from "../Slider.vue";

const sizes: NonNullable<SliderProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="slider-sizes">
    <template v-for="size in sizes" :key="size">
      <div>
        <span class="label">Size: {{ size }}</span>
        <Slider :size="size" />
      </div>
    </template>
  </div>
</template>

<style>
#slider-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  width: calc(var(--spacing) * 64);

  > div > :not(:last-child) {
    margin-block-end: calc(var(--spacing) * 2);
  }

  .label {
    display: block;
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
    color: var(--text-color-dimmed);
  }
}
</style>

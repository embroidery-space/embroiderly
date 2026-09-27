<script setup lang="ts">
import Slider from "../Slider.vue";
</script>

<template>
  <div id="slider-states">
    <Slider :model-value="50" />
    <Slider :model-value="50" disabled />
  </div>
</template>

<style>
#slider-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  width: calc(var(--spacing) * 64);
}
</style>

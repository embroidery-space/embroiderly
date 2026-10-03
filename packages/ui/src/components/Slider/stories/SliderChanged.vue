<script setup lang="ts">
import Slider from "../Slider.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div id="slider-changed">
    <Slider v-bind="$attrs" />
  </div>
</template>

<style>
#slider-changed {
  width: calc(var(--spacing) * 64);
}
</style>

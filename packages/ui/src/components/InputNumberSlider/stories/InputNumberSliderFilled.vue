<script setup lang="ts">
import InputNumberSlider from "../InputNumberSlider.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <InputNumberSlider v-bind="$attrs" class="input-number-slider-filled" />
</template>

<style>
.input-number-slider-filled {
  width: calc(var(--spacing) * 96);
}
</style>

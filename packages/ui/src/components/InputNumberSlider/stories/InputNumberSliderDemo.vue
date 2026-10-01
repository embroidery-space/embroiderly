<script setup lang="ts">
import FormField from "../../FormField/FormField.vue";
import InputNumberSlider from "../InputNumberSlider.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField>
    <InputNumberSlider v-bind="$attrs" class="input-number-slider-demo" />
  </FormField>
</template>

<style>
.input-number-slider-demo {
  width: calc(var(--spacing) * 96);
}
</style>

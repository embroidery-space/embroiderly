<script setup lang="ts">
import FormField from "../../FormField/FormField.vue";
import Slider from "../Slider.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField>
    <div id="slider-demo">
      <Slider v-bind="$attrs" />
    </div>
  </FormField>
</template>

<style>
#slider-demo {
  width: calc(var(--spacing) * 64);
}
</style>

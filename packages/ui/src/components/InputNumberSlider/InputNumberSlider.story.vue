<script setup lang="ts">
  import { reactive, ref } from "vue";

  import type { InputNumberSliderProps } from "./InputNumberSlider.vue";
  import InputNumberSlider from "./InputNumberSlider.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const state = reactive<InputNumberSliderProps>({
    size: "md",

    min: 0,
    max: 100,
    step: 1,

    increment: false,
    decrement: false,
    tooltip: false,

    disabled: false,
  });

  const value = ref(50);

  defineExpose({ state, value });
</script>

<template>
  <Story id="input-number-slider" group="form" title="InputNumberSlider" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <InputNumberSlider v-model="value" v-bind="state" class="w-96" />

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />

        <HstNumber v-model="state.min" title="Min" />
        <HstNumber v-model="state.max" title="Max" />
        <HstNumber v-model="state.step" title="Step" />

        <HstCheckbox v-model="state.increment" title="Increment" />
        <HstCheckbox v-model="state.decrement" title="Decrement" />
        <HstCheckbox v-model="state.tooltip as boolean" title="Tooltip" />

        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>
  </Story>
</template>

<script setup lang="ts">
import InputNumber from "../InputNumber/InputNumber.vue";
import type { InputNumberProps } from "../InputNumber/InputNumber.vue";
import Slider from "../Slider/Slider.vue";
import type { SliderProps } from "../Slider/Slider.vue";

export interface InputNumberSliderProps extends Pick<
  InputNumberProps,
  "disabled" | "min" | "max" | "step" | "formatOptions"
> {
  /**
   * Whether to show the increment button on the input.
   * @default false
   */
  increment?: boolean;
  /**
   * Whether to show the decrement button on the input.
   * @default false
   */
  decrement?: boolean;

  /** Show tooltip on slider thumb with current value. */
  tooltip?: SliderProps["tooltip"];

  /**
   * Additional options for the InputNumber component.
   */
  inputOptions?: Omit<
    InputNumberProps,
    "modelValue" | "name" | "disabled" | "min" | "max" | "step" | "formatOptions" | "increment" | "decrement" | "size"
  >;
  /**
   * Additional options for the Slider component.
   */
  sliderOptions?: Omit<SliderProps, "modelValue" | "disabled" | "min" | "max" | "step" | "tooltip" | "size">;
}

const modelValue = defineModel<number>();
withDefaults(defineProps<InputNumberSliderProps>(), {
  increment: false,
  decrement: false,
});
</script>

<template>
  <div data-slot="root" :class="$style.root">
    <InputNumber
      v-model="modelValue"
      v-bind="inputOptions"
      :min="min"
      :max="max"
      :step="step"
      :format-options="formatOptions"
      :increment="increment"
      :decrement="decrement"
      :disabled="disabled"
    />
    <Slider
      v-model="modelValue"
      v-bind="sliderOptions"
      :disabled="disabled"
      :min="min"
      :max="max"
      :step="step"
      :tooltip="tooltip"
      :class="$style.slider"
    />
  </div>
</template>

<style module>
.root {
  display: flex;
  column-gap: calc(var(--spacing) * 2);
  align-items: center;
}

.slider {
  width: 100%;
}
</style>

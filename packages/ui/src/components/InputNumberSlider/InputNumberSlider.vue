<script setup lang="ts">
import { computed } from "vue";

import { useFormField } from "../../composables/useFormField.ts";
import InputNumber from "../InputNumber/InputNumber.vue";
import type { InputNumberProps } from "../InputNumber/InputNumber.vue";
import Slider from "../Slider/Slider.vue";
import type { SliderProps } from "../Slider/Slider.vue";

import { InputNumberSliderTheme } from "./InputNumberSlider.theme.ts";
import type { InputNumberSliderThemeSlots, InputNumberSliderThemeVariants } from "./InputNumberSlider.theme.ts";

export interface InputNumberSliderProps extends Pick<
  InputNumberProps,
  "id" | "disabled" | "min" | "max" | "step" | "formatOptions"
> {
  /**
   * The size of the input.
   * @default "md"
   */
  size?: InputNumberSliderThemeVariants["size"];

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

  class?: any;
  ui?: InputNumberSliderThemeSlots;
}

const modelValue = defineModel<number>();
const props = withDefaults(defineProps<InputNumberSliderProps>(), {
  size: "md",
  increment: false,
  decrement: false,
});

const { id, size, groupAttrs } = useFormField(props);

// oxlint-disable-next-line vue/no-dupe-keys
const ui = computed(() =>
  InputNumberSliderTheme({
    size: size.value,
  }),
);
</script>

<template>
  <div v-bind="groupAttrs" data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <InputNumber
      :id="id"
      v-model="modelValue"
      v-bind="inputOptions"
      :size="size"
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
      :size="size"
      :min="min"
      :max="max"
      :step="step"
      :tooltip="tooltip"
      class="w-full"
    />
  </div>
</template>

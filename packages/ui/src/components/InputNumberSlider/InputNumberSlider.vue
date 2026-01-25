<script setup lang="ts">
  import type { NumberFieldRootProps } from "reka-ui";
  import { computed } from "vue";

  import InputNumber from "../InputNumber/InputNumber.vue";
  import type { InputNumberProps } from "../InputNumber/InputNumber.vue";
  import Slider from "../Slider/Slider.vue";
  import type { SliderProps } from "../Slider/Slider.vue";

  import { InputNumberSliderTheme } from "./InputNumberSlider.theme.ts";
  import type { InputNumberSliderThemeSlots, InputNumberSliderThemeVariants } from "./InputNumberSlider.theme.ts";

  export interface InputNumberSliderProps extends Pick<
    NumberFieldRootProps,
    "name" | "disabled" | "min" | "max" | "step" | "formatOptions"
  > {
    /**
     * The size of the component.
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

    /**
     * Show tooltip on slider thumb with current value.
     * @default false
     */
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

  export interface InputNumberSliderEmits {
    "update:modelValue": [value: number | undefined];
  }

  const modelValue = defineModel<number>();
  const props = withDefaults(defineProps<InputNumberSliderProps>(), {
    size: "md",

    increment: false,
    decrement: false,
  });

  const ui = computed(() => {
    return InputNumberSliderTheme({
      size: props.size,
    });
  });
</script>

<template>
  <div :class="ui.root({ class: [props.ui?.root, props.class] })">
    <InputNumber
      v-model="modelValue"
      :name="name"
      :disabled="disabled"
      :size="size"
      :min="min"
      :max="max"
      :step="step"
      :format-options="formatOptions"
      :increment="increment"
      :decrement="decrement"
      v-bind="inputOptions"
    />
    <Slider
      v-model="modelValue"
      :disabled="disabled"
      :size="size"
      :min="min"
      :max="max"
      :step="step"
      :tooltip="tooltip"
      class="w-full"
      v-bind="sliderOptions"
    />
  </div>
</template>

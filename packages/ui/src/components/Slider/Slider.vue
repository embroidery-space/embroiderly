<script setup lang="ts">
  import type { SliderRootProps } from "reka-ui";
  import { Slider } from "reka-ui/namespaced";
  import { computed } from "vue";

  import Tooltip from "../Tooltip/Tooltip.vue";
  import type { TooltipProps } from "../Tooltip/Tooltip.vue";

  import { SliderTheme } from "./Slider.theme.ts";
  import type { SliderThemeSlots, SliderThemeVariants } from "./Slider.theme.ts";

  export interface SliderProps extends Pick<SliderRootProps, "as" | "asChild" | "disabled" | "min" | "max" | "step"> {
    /**
     * The color scheme of the slider.
     * @default "primary"
     */
    color?: SliderThemeVariants["color"];
    /**
     * The size of the slider.
     * @default "md"
     */
    size?: SliderThemeVariants["size"];

    /** Show tooltip on thumb with current value. */
    tooltip?: boolean | TooltipProps;

    class?: any;
    ui?: SliderThemeSlots;
  }

  const modelValue = defineModel<number>();
  const props = withDefaults(defineProps<SliderProps>(), {
    color: "primary",
    size: "md",
  });

  // Convert single value to array for Reka UI.
  const sliderValue = computed({
    get() {
      return modelValue.value === undefined ? undefined : [modelValue.value];
    },
    set(value) {
      if (value && value.length > 0) {
        modelValue.value = value[0];
      }
    },
  });

  const ui = computed(() => {
    return SliderTheme({
      color: props.color,
      size: props.size,

      disabled: props.disabled,
    });
  });
</script>

<template>
  <Slider.Root
    v-model="sliderValue"
    :as="as"
    :as-child="asChild"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <Slider.Track :class="ui.track({ class: props.ui?.track })">
      <Slider.Range :class="ui.range({ class: props.ui?.range })" />
    </Slider.Track>

    <Tooltip
      v-if="!!tooltip"
      disable-closing-trigger
      :text="String(modelValue ?? min)"
      v-bind="typeof tooltip === 'object' ? tooltip : {}"
    >
      <Slider.Thumb aria-label="Slider thumb" :class="ui.thumb({ class: props.ui?.thumb })" />
    </Tooltip>
    <Slider.Thumb v-else aria-label="Slider thumb" :class="ui.thumb({ class: props.ui?.thumb })" />
  </Slider.Root>
</template>

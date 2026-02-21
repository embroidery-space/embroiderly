<script setup lang="ts">
import type { SliderRootProps } from "reka-ui";
import { Slider } from "reka-ui/namespaced";
import { computed } from "vue";

import { useFormField } from "../../composables/useFormField.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Tooltip from "../Tooltip/Tooltip.vue";
import type { TooltipProps } from "../Tooltip/Tooltip.vue";

import { SliderTheme } from "./Slider.theme.ts";
import type { SliderThemeSlots, SliderThemeVariants } from "./Slider.theme.ts";

export interface SliderProps extends Pick<SliderRootProps, "as" | "asChild" | "disabled" | "min" | "max" | "step"> {
  id?: string;
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

const { messages } = useLocale();

const { id, size, ariaAttrs } = useFormField(props);

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
    size: size.value,

    disabled: props.disabled,
  });
});
</script>

<template>
  <Slider.Root
    :id="id"
    v-model="sliderValue"
    v-bind="ariaAttrs"
    :as="as"
    :as-child="asChild"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <Slider.Track data-slot="track" :class="ui.track({ class: props.ui?.track })">
      <Slider.Range data-slot="range" :class="ui.range({ class: props.ui?.range })" />
    </Slider.Track>

    <Tooltip
      v-if="!!tooltip"
      disable-closing-trigger
      :text="String(modelValue ?? min)"
      v-bind="typeof tooltip === 'object' ? tooltip : {}"
    >
      <Slider.Thumb
        :aria-label="messages.slider.thumb"
        data-slot="thumb"
        :class="ui.thumb({ class: props.ui?.thumb })"
      />
    </Tooltip>
    <Slider.Thumb
      v-else
      :aria-label="messages.slider.thumb"
      data-slot="thumb"
      :class="ui.thumb({ class: props.ui?.thumb })"
    />
  </Slider.Root>
</template>

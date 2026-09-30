<script setup lang="ts">
import { Slider } from "reka-ui/namespaced";
import { computed } from "vue";

import { useFormField } from "../../composables/useFormField.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Tooltip from "../Tooltip/Tooltip.vue";
import type { TooltipProps } from "../Tooltip/Tooltip.vue";

export interface SliderProps {
  id?: string;

  /**
   * The color scheme of the slider.
   * @default "primary"
   */
  color?: "primary";
  /**
   * The size of the slider.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /** The minimum value of the slider. */
  min?: number;
  /** The maximum value of the slider. */
  max?: number;
  /** The step interval of the slider. */
  step?: number;

  /** Whether the slider is disabled. */
  disabled?: boolean;

  /** Show tooltip on thumb with current value. */
  tooltip?: boolean | TooltipProps;
}

const modelValue = defineModel<number>();
const props = withDefaults(defineProps<SliderProps>(), {
  color: "primary",
  size: "md",
});

const locale = useLocale();

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
</script>

<template>
  <Slider.Root
    :id="id"
    v-model="sliderValue"
    v-bind="ariaAttrs"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    data-slot="root"
    :class="[$style.root, $style[`color-${color}`], $style[`size-${size}`], { [$style.disabled]: disabled }]"
  >
    <Slider.Track data-slot="track" :class="$style.track">
      <Slider.Range data-slot="range" :class="$style.range" />
    </Slider.Track>

    <Tooltip
      v-if="!!tooltip"
      disable-closing-trigger
      :text="String(modelValue ?? min)"
      v-bind="typeof tooltip === 'object' ? tooltip : {}"
    >
      <Slider.Thumb :aria-label="locale.messages.slider.thumb" data-slot="thumb" :class="$style.thumb" />
    </Tooltip>
    <Slider.Thumb v-else :aria-label="locale.messages.slider.thumb" data-slot="thumb" :class="$style.thumb" />
  </Slider.Root>
</template>

<style module>
.root {
  touch-action: none;
  user-select: none;

  position: relative;

  display: flex;
  align-items: center;

  width: 100%;

  &.disabled {
    cursor: not-allowed;

    opacity: 75%;
  }
}

.track {
  position: relative;

  overflow: hidden;
  flex-grow: 1;

  border-radius: calc(infinity * 1px);

  background-color: var(--background-color-accented);

  .size-sm & {
    height: calc(var(--spacing) * 1.5);
  }

  .size-md & {
    height: calc(var(--spacing) * 2);
  }

  .size-lg & {
    height: calc(var(--spacing) * 2.5);
  }
}

.range {
  position: absolute;

  height: 100%;
  border-radius: calc(infinity * 1px);

  .color-primary & {
    background-color: var(--color-primary);
  }
}

.thumb {
  cursor: pointer;

  display: block;

  border-radius: calc(infinity * 1px);

  background-color: var(--background-color-default);
  box-shadow: 0 0 0 2px currentcolor;

  .size-sm & {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);
  }

  .size-md & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-lg & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }

  .color-primary & {
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  .disabled & {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid;
    outline-offset: 2px;
  }

  .color-primary &:focus-visible {
    outline-color: var(--color-primary);
  }
}
</style>

<script setup lang="ts">
import { Progress } from "reka-ui/namespaced";
import { computed } from "vue";

import { ProgressTheme } from "./Progress.theme.ts";
import type { ProgressThemeSlots, ProgressThemeVariants } from "./Progress.theme.ts";

export interface ProgressProps {
  /**
   * The orientation of the progress bar.
   * @default "horizontal"
   */
  orientation?: ProgressThemeVariants["orientation"];

  /**
   * The color of the progress bar.
   * @default "primary"
   */
  color?: ProgressThemeVariants["color"];
  /**
   * The size of the progress bar.
   * @default "md"
   */
  size?: ProgressThemeVariants["size"];

  class?: any;
  ui?: ProgressThemeSlots;
}

/**
 * The progress value (0–100). When `null`, the progress bar is indeterminate.
 * @default null
 */
const modelValue = defineModel<number | null>({ default: null });
const props = withDefaults(defineProps<ProgressProps>(), {
  orientation: "horizontal",
  color: "primary",
  size: "md",
});

const percent = computed(() => {
  if (modelValue.value === null) return undefined;
  return Math.max(0, Math.min(100, Math.round(modelValue.value)));
});

const indicatorStyle = computed(() => {
  if (percent.value === undefined) return undefined;
  if (props.orientation === "vertical") {
    return { transform: `translateY(-${100 - percent.value}%)` };
  }
  return { transform: `translateX(-${100 - percent.value}%)` };
});

const ui = computed(() => {
  return ProgressTheme({
    orientation: props.orientation,

    size: props.size,
    color: props.color,
  });
});
</script>

<template>
  <Progress.Root
    :model-value="modelValue"
    data-slot="base"
    :class="ui.base({ class: [props.ui?.base, props.class] })"
    style="transform: translateZ(0)"
  >
    <Progress.Indicator
      data-slot="indicator"
      :class="ui.indicator({ class: props.ui?.indicator })"
      :style="indicatorStyle"
    />
  </Progress.Root>
</template>

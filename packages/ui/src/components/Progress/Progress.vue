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
   * The size of the progress bar.
   * @default "md"
   */
  size?: ProgressThemeVariants["size"];

  class?: any;
  ui?: ProgressThemeSlots;
}

const props = withDefaults(defineProps<ProgressProps>(), {
  orientation: "horizontal",
  size: "md",
});

const ui = computed(() => {
  return ProgressTheme({
    orientation: props.orientation,
    size: props.size,
  });
});
</script>

<template>
  <Progress.Root
    :model-value="null"
    :class="ui.base({ class: [props.ui?.base, props.class] })"
    style="transform: translateZ(0)"
  >
    <Progress.Indicator :class="ui.indicator({ class: props.ui?.indicator })" />
  </Progress.Root>
</template>

<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui";
import { Separator } from "reka-ui/namespaced";
import { computed } from "vue";

import { SeparatorTheme } from "./Separator.theme.ts";
import type { SeparatorThemeSlots, SeparatorThemeVariants } from "./Separator.theme.ts";

export interface SeparatorProps extends PrimitiveProps {
  /**
   * The orientation of the separator.
   * @default "horizontal"
   */
  orientation?: SeparatorThemeVariants["orientation"];
  /**
   * The size of the separator.
   * @default "xs"
   */
  size?: SeparatorThemeVariants["size"];

  /**
   * Whether the separator is decorative.
   * @default false
   */
  decorative?: boolean;

  class?: any;
  ui?: SeparatorThemeSlots;
}

const props = withDefaults(defineProps<SeparatorProps>(), {
  orientation: "horizontal",
  size: "xs",

  decorative: false,
});

const ui = computed(() => {
  return SeparatorTheme({
    orientation: props.orientation,
    size: props.size,
  });
});
</script>

<template>
  <Separator
    :as="as"
    :as-child="asChild"
    :decorative="decorative"
    :orientation="orientation"
    :class="ui.base({ class: [props.ui?.base, props.class] })"
  />
</template>

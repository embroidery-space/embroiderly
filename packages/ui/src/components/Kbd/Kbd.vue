<script setup lang="ts">
import { Primitive } from "reka-ui";
import type { PrimitiveProps } from "reka-ui";
import { computed } from "vue";

import { KbdTheme } from "./Kbd.theme.ts";
import type { KbdThemeSlots, KbdThemeVariants } from "./Kbd.theme.ts";

export interface KbdProps extends PrimitiveProps {
  /** The value to display. */
  value?: string;
  /**
   * The size of the kbd.
   * @default "md"
   */
  size?: KbdThemeVariants["size"];

  class?: any;
  ui?: KbdThemeSlots;
}

const props = withDefaults(defineProps<KbdProps>(), {
  as: "kbd",

  size: "md",
});

const ui = computed(() => {
  return KbdTheme({
    size: props.size,
  });
});
</script>

<template>
  <Primitive :as="as" :as-child="asChild" :class="ui.base({ class: [props.ui?.base, props.class] })">
    {{ value }}
  </Primitive>
</template>

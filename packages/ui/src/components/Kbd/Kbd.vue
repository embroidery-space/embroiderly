<script setup lang="ts">
import { computed } from "vue";

import { KbdTheme } from "./Kbd.theme.ts";
import type { KbdThemeSlots, KbdThemeVariants } from "./Kbd.theme.ts";

export interface KbdProps {
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
  size: "md",
});

const ui = computed(() => {
  return KbdTheme({
    size: props.size,
  });
});
</script>

<template>
  <kbd data-slot="base" :class="ui.base({ class: [props.ui?.base, props.class] })">
    {{ value }}
  </kbd>
</template>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { useForwardPropsEmits } from "reka-ui";
import type { ScrollAreaRootProps } from "reka-ui";
import { ScrollArea } from "reka-ui/namespaced";
import { computed } from "vue";

import { ScrollAreaTheme } from "./ScrollArea.theme.ts";
import type { ScrollAreaThemeSlots, ScrollAreaThemeVariants } from "./ScrollArea.theme.ts";

export interface ScrollAreaProps extends ScrollAreaRootProps {
  /**
   * The orientation of the scroll area.
   * @default "vertical"
   */
  orientation?: ScrollAreaThemeVariants["orientation"];

  class?: any;
  ui?: ScrollAreaThemeSlots;
}

export interface ScrollAreaSlots {
  default(): any;
}

const props = withDefaults(defineProps<ScrollAreaProps>(), {
  orientation: "vertical",
});
defineSlots<ScrollAreaSlots>();

const rootProps = useForwardPropsEmits(reactivePick(props, "as", "asChild", "type", "dir", "scrollHideDelay"));

const ui = computed(() => {
  return ScrollAreaTheme({
    orientation: props.orientation,
  });
});
</script>

<template>
  <ScrollArea.Root v-bind="rootProps" data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <ScrollArea.Viewport as-child data-slot="viewport" :class="ui.viewport({ class: props.ui?.viewport })">
      <slot />
    </ScrollArea.Viewport>

    <ScrollArea.Scrollbar
      :orientation="orientation"
      data-slot="scrollbar"
      :class="ui.scrollbar({ class: props.ui?.scrollbar })"
    >
      <ScrollArea.Thumb data-slot="thumb" :class="ui.thumb({ class: props.ui?.thumb })" />
    </ScrollArea.Scrollbar>
  </ScrollArea.Root>
</template>

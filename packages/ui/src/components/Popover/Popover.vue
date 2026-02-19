<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import defu from "defu";
import { useForwardPropsEmits } from "reka-ui";
import type { PopoverContentProps, PopoverRootEmits, PopoverRootProps } from "reka-ui";
import { Popover } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { usePortal } from "../../composables/usePortal.ts";

import { PopoverTheme } from "./Popover.theme.ts";
import type { PopoverThemeSlots } from "./Popover.theme.ts";

export interface PopoverProps extends PopoverRootProps {
  /**
   * The content of the popover.
   * @default { side: "bottom", sideOffset: 4, collisionPadding: 4 }
   */
  content?: Omit<PopoverContentProps, "as" | "asChild">;

  /**
   * Display an arrow alongside the popover.
   * @default false
   */
  arrow?: boolean;

  /**
   * Render the popover in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;

  class?: any;
  ui?: PopoverThemeSlots;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PopoverEmits extends PopoverRootEmits {}

export interface PopoverSlots {
  default(props: { open: boolean }): any;
  content(props: { close: () => void }): any;
}

const props = withDefaults(defineProps<PopoverProps>(), {
  portal: true,
  arrow: false,
});
const emits = defineEmits<PopoverEmits>();

const rootProps = useForwardPropsEmits(reactivePick(props, "open", "defaultOpen", "modal"), emits);
const contentProps = computed(
  () =>
    defu(props.content, {
      side: "bottom",
      sideOffset: 4,
      collisionPadding: 4,
    }) as PopoverContentProps,
);
const portalProps = usePortal(toRef(() => props.portal));

// eslint-disable-next-line vue/no-dupe-keys
const ui = PopoverTheme();
</script>

<template>
  <Popover.Root v-slot="{ open, close }" v-bind="rootProps">
    <Popover.Trigger as-child>
      <slot :open="open" />
    </Popover.Trigger>

    <Popover.Portal v-bind="portalProps">
      <Popover.Content
        v-bind="contentProps"
        data-slot="content"
        :class="ui.content({ class: [props.ui?.content, props.class] })"
      >
        <slot name="content" :close="close" />
        <Popover.Arrow v-if="arrow" data-slot="arrow" :class="ui.arrow({ class: props.ui?.arrow })" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
</template>

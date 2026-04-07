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
   * The preferred side of the trigger to render against when open.
   * @default "bottom"
   */
  side?: PopoverContentProps["side"];
  /**
   * The preferred alignment against the trigger.
   * @default "center"
   */
  align?: PopoverContentProps["align"];

  /**
   * The content of the popover.
   * @default { side: "bottom", sideOffset: 4, collisionPadding: 4 }
   */
  content?: Omit<PopoverContentProps, "as" | "asChild">;

  /**
   * Render the popover in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;

  class?: any;
  ui?: PopoverThemeSlots;
}

export interface PopoverSlots {
  default(props: { open: boolean; pinned: boolean }): any;
  content(props: { pin: () => void; unpin: () => void; close: () => void }): any;
}

const open = defineModel<boolean>("open", { default: false });
const pinned = defineModel<boolean>("pinned", { default: false });

const props = withDefaults(defineProps<PopoverProps>(), {
  side: "bottom",
  align: "center",

  portal: true,
});

const emits = defineEmits<PopoverRootEmits>();
defineSlots<PopoverSlots>();

const rootProps = useForwardPropsEmits(reactivePick(props, "defaultOpen", "modal"), emits);
const contentProps = computed<PopoverContentProps>(
  () =>
    defu(props.content, {
      side: props.side,
      align: props.align,
      sideOffset: 4,
      collisionPadding: 4,
    }) as PopoverContentProps,
);
const portalProps = usePortal(toRef(() => props.portal));

// eslint-disable-next-line vue/no-dupe-keys
const ui = PopoverTheme();
</script>

<template>
  <Popover.Root v-bind="rootProps" v-model:open="open">
    <Popover.Trigger as-child>
      <slot :open="open" :pinned="pinned" />
    </Popover.Trigger>

    <Popover.Portal v-bind="portalProps">
      <Popover.Content
        v-bind="contentProps"
        data-slot="content"
        :class="ui.content({ class: [props.ui?.content, props.class] })"
        @pointer-down-outside="pinned && $event.preventDefault()"
        @interact-outside="pinned && $event.preventDefault()"
        @focus-outside="pinned && $event.preventDefault()"
      >
        <slot
          name="content"
          :pin="() => (pinned = true)"
          :unpin="() => (pinned = false)"
          :close="() => (open = false)"
        />
        <Popover.Arrow data-slot="arrow" :class="ui.arrow({ class: props.ui?.arrow })" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
</template>

<script setup lang="ts">
import defu from "defu";
import type { PopoverContentProps } from "reka-ui";
import { Popover } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { usePortal } from "../../composables/usePortal.ts";

export interface PopoverProps {
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

  /** Whether the popover should block interaction with the outside elements. */
  modal?: boolean;

  /**
   * Render the popover in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;
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
defineSlots<PopoverSlots>();

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
</script>

<template>
  <Popover.Root v-model:open="open" :modal="modal">
    <Popover.Trigger as-child>
      <slot :open="open" :pinned="pinned" />
    </Popover.Trigger>

    <Popover.Portal v-bind="portalProps">
      <Popover.Content
        v-bind="contentProps"
        data-slot="content"
        :class="$style.content"
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
        <Popover.Arrow data-slot="arrow" :class="$style.arrow" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
</template>

<style module>
.content {
  pointer-events: auto;

  transform-origin: var(--reka-popover-content-transform-origin);

  border-radius: var(--radius-md);

  background-color: var(--background-color-default);
  box-shadow:
    0 0 0 1px var(--border-color-default),
    var(--shadow-lg);

  &:focus {
    outline-style: none;
  }

  &[data-state="closed"] {
    animation: global(scale-out) 100ms ease-in;
  }

  &[data-state="open"] {
    animation: global(scale-in) 100ms ease-out;
  }
}

.arrow {
  fill: var(--border-color-default);
}
</style>

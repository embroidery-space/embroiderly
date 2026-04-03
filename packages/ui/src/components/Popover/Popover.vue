<script setup lang="ts">
import defu from "defu";
import type { PopoverContentProps, PopoverRootProps } from "reka-ui";
import { Popover } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { usePortal } from "../../composables/usePortal.ts";

import { PopoverTheme } from "./Popover.theme.ts";
import type { PopoverThemeSlots } from "./Popover.theme.ts";

export interface PopoverProps extends Pick<PopoverRootProps, "defaultOpen" | "modal"> {
  /**
   * Display an arrow alongside the popover.
   * @default false
   */
  arrow?: boolean;

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
  arrow: false,
  portal: true,
});
defineSlots<PopoverSlots>();

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
  <Popover.Root v-slot="{ close }" v-model:open="open" :default-open="defaultOpen" :modal="modal">
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
        <slot name="content" :pin="() => (pinned = true)" :unpin="() => (pinned = false)" :close="close" />
        <Popover.Arrow v-if="arrow" data-slot="arrow" :class="ui.arrow({ class: props.ui?.arrow })" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
</template>

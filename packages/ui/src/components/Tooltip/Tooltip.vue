<script setup lang="ts">
import type { TooltipContentProps } from "reka-ui";
import { Tooltip } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { usePortal } from "../../composables/usePortal.ts";
import { parseShortcutDisplay } from "../../utils/shortcut.ts";
import Kbd from "../Kbd/Kbd.vue";

export interface TooltipProps {
  /** The text content of the tooltip. */
  text?: string;
  /** Keyboard shortcut string displayed after text. */
  shortcut?: string;

  /**
   * The preferred side of the trigger to render against when open.
   * @default "bottom"
   */
  side?: TooltipContentProps["side"];
  /**
   * The preferred alignment against the trigger.
   * @default "center"
   */
  align?: TooltipContentProps["align"];

  /**
   * The time in milliseconds to delay before showing the tooltip.
   * @default 700
   */
  delayDuration?: number;

  /** Whether the tooltip is disabled. */
  disabled?: boolean;

  /**
   * Render the tooltip in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;
}

export interface TooltipSlots {
  default(): any;
}

const open = defineModel<boolean>("open", { default: false });
const props = withDefaults(defineProps<TooltipProps>(), {
  side: "bottom",
  align: "center",

  delayDuration: 700,

  portal: true,
});
defineSlots<TooltipSlots>();

const contentProps = computed<TooltipContentProps>(() => ({
  side: props.side,
  align: props.align,
  sideOffset: 0,
  collisionPadding: 4,
}));
const portalProps = usePortal(toRef(() => props.portal));
</script>

<template>
  <Tooltip.Root v-model:open="open" :delay-duration="delayDuration" :disabled="disabled || (!text && !shortcut)">
    <Tooltip.Trigger v-bind="$attrs" as-child>
      <slot :open="open" />
    </Tooltip.Trigger>

    <Tooltip.Portal v-bind="portalProps">
      <Tooltip.Content v-bind="contentProps" data-slot="content" :class="$style.content">
        <span v-if="text" data-slot="text" :class="$style.text">{{ text }}</span>
        <span v-if="shortcut" data-slot="kbds" :class="$style.kbds">
          <Kbd v-for="(key, i) in parseShortcutDisplay(shortcut)" :key="i" :value="key" size="sm" />
        </span>
        <Tooltip.Arrow data-slot="arrow" :class="$style.arrow" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</template>

<style module>
.content {
  pointer-events: auto;
  user-select: none;

  transform-origin: var(--reka-tooltip-content-transform-origin);

  display: flex;
  gap: calc(var(--spacing) * 1);
  align-items: center;

  height: calc(var(--spacing) * 6);
  padding-block: calc(var(--spacing) * 1);
  padding-inline: calc(var(--spacing) * 2.5);
  border-radius: var(--radius-sm);

  font-size: var(--text-xs);
  line-height: var(--text-xs--line-height);

  background-color: var(--background-color-default);
  box-shadow:
    0 0 0 1px var(--border-color-default),
    var(--shadow-sm);

  &[data-state="closed"] {
    animation: global(scale-out) 100ms ease-in;
  }

  &[data-state="delayed-open"] {
    animation: global(scale-in) 100ms ease-out;
  }
}

.text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kbds {
  display: none;
  flex-shrink: 0;
  gap: calc(var(--spacing) * 0.5);
  align-items: center;

  &:not(:first-child)::before {
    content: "·";
    margin-inline-end: calc(var(--spacing) * 0.5);
  }

  @media (width >= 64rem) {
    display: inline-flex;
  }
}

.arrow {
  fill: var(--border-color-default);
}
</style>

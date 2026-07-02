<script setup lang="ts">
import type { TooltipContentProps } from "reka-ui";
import { Tooltip } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { usePortal } from "../../composables/usePortal.ts";
import { parseShortcutDisplay } from "../../utils/shortcut.ts";
import Kbd from "../Kbd/Kbd.vue";

import { TooltipTheme } from "./Tooltip.theme.ts";
import type { TooltipThemeSlots } from "./Tooltip.theme.ts";

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

  class?: any;
  ui?: TooltipThemeSlots;
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

// oxlint-disable-next-line vue/no-dupe-keys
const ui = TooltipTheme();
</script>

<template>
  <Tooltip.Root v-model:open="open" :delay-duration="delayDuration" :disabled="disabled || (!text && !shortcut)">
    <Tooltip.Trigger v-bind="$attrs" as-child>
      <slot :open="open" />
    </Tooltip.Trigger>

    <Tooltip.Portal v-bind="portalProps">
      <Tooltip.Content
        v-bind="contentProps"
        data-slot="content"
        :class="ui.content({ class: [props.ui?.content, props.class] })"
      >
        <span v-if="text" data-slot="text" :class="ui.text({ class: props.ui?.text })">{{ text }}</span>
        <span v-if="shortcut" data-slot="kbds" :class="ui.kbds({ class: props.ui?.kbds })">
          <Kbd v-for="(key, i) in parseShortcutDisplay(shortcut)" :key="i" :value="key" size="sm" />
        </span>
        <Tooltip.Arrow data-slot="arrow" :class="ui.arrow({ class: props.ui?.arrow })" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</template>

<script setup lang="ts">
  import { reactivePick } from "@vueuse/core";
  import defu from "defu";
  import type { TooltipContentProps, TooltipRootEmits, TooltipRootProps } from "reka-ui";
  import {
    TooltipArrow,
    TooltipContent,
    TooltipPortal,
    TooltipRoot,
    TooltipTrigger,
    useForwardPropsEmits,
  } from "reka-ui";
  import { computed, toRef } from "vue";

  import { usePortal } from "../../composables/usePortal.ts";

  import { TooltipTheme } from "./Tooltip.theme.ts";
  import type { TooltipThemeSlots } from "./Tooltip.theme.ts";

  export interface TooltipProps extends TooltipRootProps {
    /** The text content of the tooltip. */
    text?: string;

    /**
     * The content of the tooltip.
     * @default { side: "bottom", sideOffset: 4, collisionPadding: 4 }
     */
    content?: Omit<TooltipContentProps, "as" | "asChild">;

    /**
     * Render the tooltip in a portal.
     * @default true
     */
    portal?: boolean | string | HTMLElement;

    class?: any;
    ui?: TooltipThemeSlots;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface TooltipEmits extends TooltipRootEmits {}

  export interface TooltipSlots {
    default(): any;
  }

  const props = withDefaults(defineProps<TooltipProps>(), {
    portal: true,
  });
  const emits = defineEmits<TooltipEmits>();

  const rootProps = useForwardPropsEmits(
    reactivePick(
      props,
      "open",
      "defaultOpen",
      "delayDuration",
      "disableHoverableContent",
      "disableClosingTrigger",
      "ignoreNonKeyboardFocus",
    ),
    emits,
  );
  const contentProps = computed(
    () =>
      defu(props.content, {
        side: "bottom",
        sideOffset: 4,
        collisionPadding: 4,
      }) as TooltipContentProps,
  );
  const portalProps = usePortal(toRef(() => props.portal));

  // eslint-disable-next-line vue/no-dupe-keys
  const ui = TooltipTheme();
</script>

<template>
  <TooltipRoot v-slot="{ open }" v-bind="rootProps" :disabled="disabled || !text">
    <TooltipTrigger as-child>
      <slot :open="open" />
    </TooltipTrigger>

    <TooltipPortal v-bind="portalProps">
      <TooltipContent v-bind="contentProps" :class="ui.content({ class: [props.ui?.content, props.class] })">
        <span :class="ui.text({ class: props.ui?.text })">{{ text }}</span>
        <TooltipArrow :class="ui.arrow({ class: props.ui?.arrow })" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>

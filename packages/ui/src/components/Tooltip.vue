<template>
  <TooltipRoot v-bind="rootProps" :disabled="disabled || !text">
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>

    <TooltipPortal v-bind="portalProps">
      <TooltipContent v-bind="contentProps" :class="cn(tooltipStyles.content, props.class)">
        <span class="truncate">{{ text }}</span>
        <TooltipArrow :class="tooltipStyles.arrow" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>

<script setup lang="ts">
  import { reactivePick } from "@vueuse/core";
  import defu from "defu";
  import type { TooltipContentProps, TooltipRootProps } from "reka-ui";
  import { TooltipArrow, TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from "reka-ui";
  import { computed, toRef } from "vue";

  import { usePortal } from "../composables/usePortal.ts";
  import { tooltipStyles } from "../theme/tooltip.ts";
  import { cn } from "../utils/theme.ts";

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

    class?: string;
  }

  export interface TooltipSlots {
    default(): any;
  }

  const props = withDefaults(defineProps<TooltipProps>(), {
    portal: true,
  });
  const rootProps = reactivePick(
    props,
    "delayDuration",
    "disableHoverableContent",
    "disableClosingTrigger",
    "ignoreNonKeyboardFocus",
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
</script>

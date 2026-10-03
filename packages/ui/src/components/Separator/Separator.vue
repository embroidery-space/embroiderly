<script setup lang="ts">
import { Separator } from "reka-ui/namespaced";

export interface SeparatorProps {
  /**
   * The orientation of the separator.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * The size of the separator.
   * @default "xs"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";

  /**
   * Whether the separator is decorative.
   * @default false
   */
  decorative?: boolean;
}

withDefaults(defineProps<SeparatorProps>(), {
  orientation: "horizontal",
  size: "xs",
});
</script>

<template>
  <Separator
    :decorative="decorative"
    :orientation="orientation"
    data-slot="base"
    :class="[$style.base, $style[`orientation-${orientation}`], $style[`size-${size}`]]"
  />
</template>

<style module>
.base {
  flex-shrink: 0;

  border-color: var(--border-color-default);
  border-style: solid;

  &.orientation-horizontal {
    width: 100%;

    &.size-xs {
      border-top-width: 1px;
    }

    &.size-sm {
      border-top-width: 2px;
    }

    &.size-md {
      border-top-width: 3px;
    }

    &.size-lg {
      border-top-width: 4px;
    }

    &.size-xl {
      border-top-width: 5px;
    }
  }

  &.orientation-vertical {
    height: 100%;

    &.size-xs {
      border-inline-start-width: 1px;
    }

    &.size-sm {
      border-inline-start-width: 2px;
    }

    &.size-md {
      border-inline-start-width: 3px;
    }

    &.size-lg {
      border-inline-start-width: 4px;
    }

    &.size-xl {
      border-inline-start-width: 5px;
    }
  }
}
</style>

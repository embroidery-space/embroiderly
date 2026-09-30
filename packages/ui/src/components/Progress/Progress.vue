<script setup lang="ts">
import { Progress } from "reka-ui/namespaced";
import { computed } from "vue";

export interface ProgressProps {
  /**
   * The orientation of the progress bar.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * The color of the progress bar.
   * @default "primary"
   */
  color?: "primary" | "error" | "warning" | "success" | "info" | "help" | "neutral";
  /**
   * The size of the progress bar.
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * The progress value (0–100). When `null`, the progress bar is indeterminate.
 * @default null
 */
const modelValue = defineModel<number | null>({ default: null });
const props = withDefaults(defineProps<ProgressProps>(), {
  orientation: "horizontal",
  color: "primary",
  size: "md",
});

const percent = computed(() => {
  if (modelValue.value === null) return undefined;
  return Math.max(0, Math.min(100, Math.round(modelValue.value)));
});

const indicatorStyle = computed(() => {
  if (percent.value === undefined) return undefined;
  if (props.orientation === "vertical") {
    return { transform: `translateY(-${100 - percent.value}%)` };
  }
  return { transform: `translateX(-${100 - percent.value}%)` };
});
</script>

<template>
  <Progress.Root
    :model-value="modelValue"
    data-slot="base"
    :class="[$style.base, $style[`orientation-${orientation}`], $style[`color-${color}`], $style[`size-${size}`]]"
    style="transform: translateZ(0)"
  >
    <Progress.Indicator data-slot="indicator" :class="$style.indicator" :style="indicatorStyle" />
  </Progress.Root>
</template>

<style module>
.base {
  position: relative;

  overflow: hidden;

  border-radius: calc(infinity * 1px);

  background-color: var(--background-color-accented);

  &.orientation-horizontal {
    width: 100%;

    &.size-xs {
      height: calc(var(--spacing) * 0.5);
    }

    &.size-sm {
      height: calc(var(--spacing) * 1);
    }

    &.size-md {
      height: calc(var(--spacing) * 2);
    }

    &.size-lg {
      height: calc(var(--spacing) * 3);
    }

    &.size-xl {
      height: calc(var(--spacing) * 4);
    }
  }

  &.orientation-vertical {
    height: 100%;

    &.size-xs {
      width: calc(var(--spacing) * 0.5);
    }

    &.size-sm {
      width: calc(var(--spacing) * 1);
    }

    &.size-md {
      width: calc(var(--spacing) * 2);
    }

    &.size-lg {
      width: calc(var(--spacing) * 3);
    }

    &.size-xl {
      width: calc(var(--spacing) * 4);
    }
  }
}

.indicator {
  width: 100%;
  height: 100%;
  border-radius: calc(infinity * 1px);

  &[data-state="indeterminate"] {
    .orientation-horizontal > & {
      animation: global(carousel) 2s ease-in-out infinite;
    }

    .orientation-vertical > & {
      animation: global(carousel-vertical) 2s ease-in-out infinite;
    }
  }

  .color-primary > & {
    background-color: var(--color-primary);
  }

  .color-error > & {
    background-color: var(--color-error);
  }

  .color-warning > & {
    background-color: var(--color-warning);
  }

  .color-success > & {
    background-color: var(--color-success);
  }

  .color-info > & {
    background-color: var(--color-info);
  }

  .color-help > & {
    background-color: var(--color-help);
  }

  .color-neutral > & {
    background-color: var(--background-color-inverted);
  }
}
</style>

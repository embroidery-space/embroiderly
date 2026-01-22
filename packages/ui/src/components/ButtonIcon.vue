<template>
  <Tooltip v-bind="tooltipProps">
    <Button v-bind="buttonProps" square :aria-label="tooltip" />
  </Tooltip>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  import type { ButtonProps } from "./Button.vue";
  import Button from "./Button.vue";
  import type { TooltipProps } from "./Tooltip.vue";
  import Tooltip from "./Tooltip.vue";

  export interface ButtonIconProps
    extends
      Omit<ButtonProps, "label" | "leadingIcon" | "trailingIcon" | "leading" | "trailing" | "square">,
      Pick<TooltipProps, "delayDuration"> {
    /** The icon to display. */
    icon: string;
    /** The tooltip text. */
    tooltip: string;

    /** Additional options for the tooltip. */
    tooltipOptions?: Omit<TooltipProps, "text" | "disabled" | "delayDuration">;
  }

  const props = defineProps<ButtonIconProps>();
  const buttonProps = computed<Partial<ButtonProps>>(() => ({
    as: props.as,
    asChild: props.asChild,

    icon: props.icon,

    variant: props.variant,
    color: props.color,
    size: props.size,

    loading: props.loading,
    disabled: props.disabled,

    loadingIcon: props.loadingIcon,

    class: props.class,
  }));
  const tooltipProps = computed<TooltipProps>(() => ({
    ...props.tooltipOptions,

    text: props.tooltip,

    disabled: props.disabled,
    delayDuration: props.delayDuration,
  }));
</script>

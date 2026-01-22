<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :class="cn(ui, props.class)"
  >
    <slot name="leading">
      <Icon
        v-if="isLeading && leadingIconName"
        aria-hidden="true"
        :icon="leadingIconName"
        :class="cn('shrink-0', iconSizeClass, { 'animate-spin': loading })"
      />
    </slot>

    <slot>
      <span v-if="label" class="truncate">{{ label }}</span>
    </slot>

    <slot name="trailing">
      <Icon
        v-if="isTrailing && trailingIconName"
        aria-hidden="true"
        :icon="trailingIconName"
        :class="cn('shrink-0', iconSizeClass, { 'animate-spin': loading && !isLeading })"
      />
    </slot>
  </Primitive>
</template>

<script setup lang="ts">
  import { Icon } from "@iconify/vue";
  import { Primitive } from "reka-ui";
  import type { PrimitiveProps } from "reka-ui";
  import { computed } from "vue";

  import { useComponentIcons } from "../composables/useComponentIcons.ts";
  import type { UseComponentIconsProps } from "../composables/useComponentIcons.ts";
  import { buttonVariants } from "../theme/button.ts";
  import type { ButtonVariants } from "../theme/button.ts";
  import { cn } from "../utils/theme.ts";

  export interface ButtonProps extends PrimitiveProps, UseComponentIconsProps {
    /**
     * The style variant of the button.
     * @default "solid"
     */
    variant?: ButtonVariants["variant"];
    /**
     * The color scheme of the button.
     * @default "primary"
     */
    color?: ButtonVariants["color"];
    /**
     * The size of the button.
     * @default "md"
     */
    size?: ButtonVariants["size"];

    /** Render the button with equal padding on all sides. */
    square?: boolean;

    /** The text label of the button. */
    label?: string;
    /** Whether the button is disabled. */
    disabled?: boolean;

    /** Additional CSS classes to apply to the button. */
    class?: string;
  }

  export interface ButtonSlots {
    leading(): any;
    default(): any;
    trailing(): any;
  }

  const props = withDefaults(defineProps<ButtonProps>(), {
    as: "button",

    variant: "solid",
    color: "primary",
    size: "md",

    loadingIcon: "lucide:loader-circle",
  });

  const ui = computed(() => {
    return buttonVariants({
      variant: props.variant,
      color: props.color,
      size: props.size,
      square: props.square,
    });
  });

  const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);
  const iconSizeClass = computed(() => {
    switch (props.size) {
      case "xs":
        return "size-4";
      case "sm":
        return "size-4";
      case "md":
        return "size-5";
      case "lg":
        return "size-5";
      case "xl":
        return "size-6";
      default:
        return "size-5";
    }
  });
</script>

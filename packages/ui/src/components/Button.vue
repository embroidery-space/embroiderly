<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :class="cn(ui, props.class)"
  >
    <slot name="leading">
      <Icon v-if="loading" aria-hidden="true" :icon="loadingIcon" :class="cn('animate-spin shrink-0', iconSizeClass)" />
      <Icon v-else-if="leadingIcon" aria-hidden="true" :icon="leadingIcon" :class="cn('shrink-0', iconSizeClass)" />
    </slot>

    <slot>
      <span v-if="label" class="truncate">{{ label }}</span>
    </slot>

    <slot name="trailing">
      <Icon
        v-if="trailingIcon && !loading"
        aria-hidden="true"
        :icon="trailingIcon"
        :class="cn('shrink-0', iconSizeClass)"
      />
    </slot>
  </Primitive>
</template>

<script setup lang="ts">
  import { Icon } from "@iconify/vue";
  import { Primitive } from "reka-ui";
  import type { PrimitiveProps } from "reka-ui";
  import { computed } from "vue";

  import { buttonVariants } from "../theme/button.ts";
  import type { ButtonVariants } from "../theme/button.ts";
  import { cn } from "../utils/theme.ts";

  export interface ButtonProps extends PrimitiveProps {
    variant?: ButtonVariants["variant"];
    color?: ButtonVariants["color"];
    size?: ButtonVariants["size"];

    label?: string;
    loading?: boolean;
    disabled?: boolean;

    leadingIcon?: string;
    trailingIcon?: string;
    loadingIcon?: string;

    class?: string;
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
    });
  });

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

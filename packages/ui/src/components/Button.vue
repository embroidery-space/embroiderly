<script setup lang="ts">
  import { Icon } from "@iconify/vue";
  import { Primitive } from "reka-ui";
  import type { PrimitiveProps } from "reka-ui";
  import { computed, ref } from "vue";

  import { useComponentIcons } from "../composables/useComponentIcons.ts";
  import type { UseComponentIconsProps } from "../composables/useComponentIcons.ts";
  import { buttonVariants } from "../theme/button.ts";
  import type { ButtonVariants } from "../theme/button.ts";
  import { cn } from "../utils/theme.ts";

  export interface ButtonProps extends PrimitiveProps, UseComponentIconsProps {
    /** The text label of the button. */
    label?: string;

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

    /** Set loading state automatically based on the `@click` promise state. */
    loadingAuto?: boolean;

    /** Whether the button is disabled. */
    disabled?: boolean;
    /** Render the button with equal padding on all sides. */
    square?: boolean;

    onClick?: ((event: MouseEvent) => void | Promise<void>) | Array<(event: MouseEvent) => void | Promise<void>>;
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

  const loadingAutoState = ref(false);
  async function onClickWrapper(event: MouseEvent) {
    loadingAutoState.value = true;
    try {
      const callbacks = Array.isArray(props.onClick) ? props.onClick : [props.onClick];
      await Promise.all(callbacks.map((fn) => fn?.(event)));
    } finally {
      loadingAutoState.value = false;
    }
  }

  const isLoading = computed(() => props.loading || (props.loadingAuto && loadingAutoState.value));

  const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(
    computed(() => ({ ...props, loading: isLoading.value })),
  );
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

  const ui = computed(() => {
    return buttonVariants({
      variant: props.variant,
      color: props.color,
      size: props.size,
      square: props.square,
    });
  });
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :disabled="disabled || isLoading"
    :aria-disabled="disabled || isLoading"
    :class="cn(ui, props.class)"
    @click="onClickWrapper"
  >
    <slot name="leading">
      <Icon
        v-if="isLeading && leadingIconName"
        aria-hidden="true"
        :icon="leadingIconName"
        :class="cn('shrink-0', iconSizeClass, { 'animate-spin': isLoading })"
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
        :class="cn('shrink-0', iconSizeClass, { 'animate-spin': isLoading && !isLeading })"
      />
    </slot>
  </Primitive>
</template>

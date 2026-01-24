<script setup lang="ts">
  import { Primitive } from "reka-ui";
  import type { PrimitiveProps } from "reka-ui";
  import { computed, ref } from "vue";

  import { useComponentIcons } from "../../composables/useComponentIcons.ts";
  import type { UseComponentIconsProps } from "../../composables/useComponentIcons.ts";
  import Icon from "../Icon/Icon.vue";

  import { ButtonTheme } from "./Button.theme.ts";
  import type { ButtonThemeSlots, ButtonThemeVariants } from "./Button.theme.ts";

  export interface ButtonProps extends PrimitiveProps, UseComponentIconsProps {
    /** The text label of the button. */
    label?: string;

    /**
     * The color scheme of the button.
     * @default "primary"
     */
    color?: ButtonThemeVariants["color"];
    /**
     * The style variant of the button.
     * @default "solid"
     */
    variant?: ButtonThemeVariants["variant"];
    /**
     * The size of the button.
     * @default "md"
     */
    size?: ButtonThemeVariants["size"];

    /** Set loading state automatically based on the `@click` promise state. */
    loadingAuto?: boolean;

    /** Whether the button is disabled. */
    disabled?: boolean;
    /** Render the button with equal padding on all sides. */
    square?: boolean;

    onClick?: ((event: MouseEvent) => void | Promise<void>) | Array<(event: MouseEvent) => void | Promise<void>>;

    class?: any;
    ui?: ButtonThemeSlots;
  }

  export interface ButtonSlots {
    leading(): any;
    default(): any;
    trailing(): any;
  }

  const props = withDefaults(defineProps<ButtonProps>(), {
    as: "button",

    color: "primary",
    variant: "solid",
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

  const ui = computed(() => {
    return ButtonTheme({
      color: props.color,
      variant: props.variant,
      size: props.size,

      loading: isLoading.value,
      square: props.square,

      leading: isLeading.value,
      trailing: isTrailing.value,
    });
  });
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :disabled="disabled || isLoading"
    :aria-disabled="disabled || isLoading"
    :class="ui.base({ class: [props.class, props.ui?.base] })"
    @click="onClickWrapper"
  >
    <slot name="leading">
      <Icon
        v-if="isLeading && leadingIconName"
        aria-hidden="true"
        :name="leadingIconName"
        :class="ui.leadingIcon({ class: props.ui?.leadingIcon })"
      />
    </slot>

    <slot>
      <span v-if="label" :class="ui.label({ class: props.ui?.label })">{{ label }}</span>
    </slot>

    <slot name="trailing">
      <Icon
        v-if="isTrailing && trailingIconName"
        aria-hidden="true"
        :name="trailingIconName"
        :class="ui.trailingIcon({ class: props.ui?.trailingIcon })"
      />
    </slot>
  </Primitive>
</template>

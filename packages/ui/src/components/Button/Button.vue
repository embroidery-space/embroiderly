<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed, ref } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import type { UseComponentIconsProps } from "../../composables/useComponentIcons.ts";
import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";
import Icon from "../Icon/Icon.vue";

import { ButtonTheme } from "./Button.theme.ts";
import type { ButtonThemeSlots, ButtonThemeVariants } from "./Button.theme.ts";

export interface ButtonProps extends UseComponentIconsProps {
  /** The text label of the button. */
  label?: string;

  /** The URL to navigate to; renders the button as an `<a>` element. */
  href?: string;
  /** The target attribute for anchor buttons. */
  target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
  /** Overrides the auto-computed rel attribute for anchor buttons. */
  rel?: string;

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
  color: "primary",
  variant: "solid",
});
defineSlots<ButtonSlots>();

const { fieldGroup, fieldGroupSize } = useFormFieldGroup();
const size = computed(() => props.size ?? fieldGroupSize.value ?? "md");

const loadingAutoState = ref(false);
const isLoading = computed(() => props.loading || (props.loadingAuto && loadingAutoState.value));

async function onClickWrapper(event: MouseEvent) {
  if (props.disabled || isLoading.value) return;
  loadingAutoState.value = true;
  try {
    const callbacks = Array.isArray(props.onClick) ? props.onClick : [props.onClick];
    await Promise.all(callbacks.map((fn) => fn?.(event)));
  } finally {
    loadingAutoState.value = false;
  }
}

const isExternal = computed(() => !!props.href && /^[a-z][a-z0-9+.-]*:/i.test(props.href));
const rel = computed(() => {
  if (props.rel !== null) return props.rel;
  if (isExternal.value) return "noopener noreferrer";
  return undefined;
});

const { icons } = useComponentIcons();
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(
  computed(() => ({
    ...props,
    loading: isLoading.value,
    trailingIcon: props.trailingIcon
      ? props.trailingIcon
      : !props.trailing && isExternal.value
        ? icons.value.external
        : undefined,
  })),
);

const ui = computed(() => {
  return ButtonTheme({
    color: props.color,
    variant: props.variant,
    size: size.value,

    loading: isLoading.value,
    square: props.square,

    leading: isLeading.value,
    trailing: isTrailing.value,

    fieldGroup: fieldGroup.value,
  });
});
</script>

<template>
  <Primitive
    :as="props.href ? 'a' : 'button'"
    :href="props.href && !(props.disabled || isLoading) ? props.href : undefined"
    :target="props.href ? target : undefined"
    :rel="props.href ? rel : undefined"
    :disabled="!props.href ? disabled || isLoading : undefined"
    :aria-disabled="disabled || isLoading"
    :tabindex="(disabled || isLoading) && props.href ? -1 : undefined"
    data-slot="base"
    :class="ui.base({ class: [props.ui?.base, props.class] })"
    @click="onClickWrapper"
  >
    <slot name="leading">
      <Icon
        v-if="isLeading && leadingIconName"
        aria-hidden="true"
        :name="leadingIconName"
        data-slot="leadingIcon"
        :class="ui.leadingIcon({ class: props.ui?.leadingIcon })"
      />
    </slot>

    <slot>
      <span v-if="label" data-slot="label" :class="ui.label({ class: props.ui?.label })">{{ label }}</span>
    </slot>

    <slot name="trailing">
      <Icon
        v-if="isTrailing && trailingIconName"
        aria-hidden="true"
        :name="trailingIconName"
        data-slot="trailingIcon"
        :class="ui.trailingIcon({ class: props.ui?.trailingIcon })"
      />
    </slot>
  </Primitive>
</template>

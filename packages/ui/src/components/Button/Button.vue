<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed, ref } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import type { UseComponentIconsProps } from "../../composables/useComponentIcons.ts";
import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";
import { getLinkRel, isExternalHref } from "../../utils/link.ts";
import Icon from "../Icon/Icon.vue";

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
  color?: "primary" | "neutral";
  /**
   * The style variant of the button.
   * @default "solid"
   */
  variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link";
  /**
   * The size of the button.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /** Set loading state automatically based on the `@click` promise state. */
  loadingAuto?: boolean;

  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Render the button with equal padding on all sides. */
  square?: boolean;

  onClick?: ((event: MouseEvent) => void | Promise<void>) | Array<(event: MouseEvent) => void | Promise<void>>;
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
const size = computed(() => props.size ?? fieldGroupSize.value);

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

const { icons } = useComponentIcons();
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(
  computed(() => ({
    ...props,
    loading: isLoading.value,
    trailingIcon: props.trailingIcon
      ? props.trailingIcon
      : !props.trailing && isExternalHref(props.href)
        ? icons.value.external
        : undefined,
  })),
);

const isLeadingSpinning = computed(() => isLoading.value && isLeading.value);
const isTrailingSpinning = computed(() => isLoading.value && !isLeading.value && isTrailing.value);
</script>

<template>
  <Primitive
    :as="props.href ? 'a' : 'button'"
    :href="props.href && !(props.disabled || isLoading) ? props.href : undefined"
    :target="props.href ? target : undefined"
    :rel="getLinkRel({ href: props.href, rel: props.rel })"
    :disabled="!props.href ? disabled || isLoading : undefined"
    :aria-disabled="disabled || isLoading"
    :tabindex="(disabled || isLoading) && props.href ? -1 : undefined"
    data-slot="base"
    :class="[
      $style.base,
      $style[`color-${color}`],
      $style[`variant-${variant}`],
      $style[`size-${size}`],
      square && $style.square,
      fieldGroup && $style.fieldGroup,
    ]"
    @click="onClickWrapper"
  >
    <slot name="leading">
      <Icon
        v-if="isLeading && leadingIconName"
        aria-hidden="true"
        :name="leadingIconName"
        data-slot="leading-icon"
        :class="[$style.leadingIcon, { [$style.loading]: isLeadingSpinning }]"
      />
    </slot>

    <slot>
      <span v-if="label" data-slot="label" :class="$style.label">{{ label }}</span>
    </slot>

    <slot name="trailing">
      <Icon
        v-if="isTrailing && trailingIconName"
        aria-hidden="true"
        :name="trailingIconName"
        data-slot="trailing-icon"
        :class="[$style.trailingIcon, { [$style.loading]: isTrailingSpinning }]"
      />
    </slot>
  </Primitive>
</template>

<style module>
.base {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: var(--radius-md);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: var(--default-transition-duration);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &:hover {
    cursor: pointer;
  }

  &:focus-visible {
    outline: 2px solid;
    outline-offset: 2px;
  }

  &:disabled,
  &[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: 75%;
  }

  &.variant-solid.color-primary {
    color: var(--text-color-inverted);
    background-color: var(--color-primary);

    &:hover {
      background-color: color-mix(in oklab, var(--color-primary) 75%, transparent);
    }

    &:focus-visible {
      outline-color: var(--color-primary);
    }

    &:active {
      background-color: color-mix(in oklab, var(--color-primary) 75%, transparent);
    }

    &:disabled,
    &[aria-disabled="true"] {
      background-color: var(--color-primary);
    }
  }

  &.variant-solid.color-neutral {
    color: var(--text-color-inverted);
    background-color: var(--background-color-inverted);

    &:hover {
      background-color: color-mix(in oklab, var(--background-color-inverted) 90%, transparent);
    }

    &:focus-visible {
      outline-color: var(--border-color-inverted);
    }

    &:active {
      background-color: color-mix(in oklab, var(--background-color-inverted) 90%, transparent);
    }

    &:disabled,
    &[aria-disabled="true"] {
      background-color: var(--background-color-inverted);
    }
  }

  &.variant-outline.color-primary {
    color: var(--color-primary);
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-primary) 50%, transparent);

    &:hover {
      background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
    }

    &:focus-visible {
      outline-color: var(--color-primary);
    }

    &:active {
      background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
    }

    &:disabled {
      background-color: transparent;
    }
  }

  &.variant-outline.color-neutral {
    color: var(--text-color-default);
    background-color: var(--background-color-default);
    box-shadow: inset 0 0 0 1px var(--border-color-accented);

    &:hover {
      background-color: var(--background-color-elevated);
    }

    &:focus-visible {
      outline-color: var(--border-color-inverted);
    }

    &:active {
      background-color: var(--background-color-elevated);
    }

    &:disabled {
      background-color: var(--background-color-default);
    }
  }

  &.variant-soft.color-primary,
  &.variant-subtle.color-primary {
    color: var(--color-primary);
    background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);

    &:hover {
      background-color: color-mix(in oklab, var(--color-primary) 15%, transparent);
    }

    &:focus-visible {
      outline-color: var(--color-primary);
    }

    &:active {
      background-color: color-mix(in oklab, var(--color-primary) 15%, transparent);
    }

    &:disabled {
      background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
    }
  }

  &.variant-subtle.color-primary {
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--color-primary) 25%, transparent);
  }

  &.variant-soft.color-neutral,
  &.variant-subtle.color-neutral {
    color: var(--text-color-default);
    background-color: var(--background-color-elevated);

    &:hover {
      background-color: color-mix(in oklab, var(--background-color-accented) 75%, transparent);
    }

    &:focus-visible {
      outline-color: var(--border-color-inverted);
    }

    &:active {
      background-color: color-mix(in oklab, var(--background-color-accented) 75%, transparent);
    }

    &:disabled {
      background-color: var(--background-color-elevated);
    }
  }

  &.variant-subtle.color-neutral {
    box-shadow: inset 0 0 0 1px var(--border-color-accented);
  }

  &.variant-ghost.color-primary {
    color: var(--color-primary);

    &:hover {
      background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
    }

    &:focus-visible {
      outline-color: var(--color-primary);
    }

    &:active {
      background-color: color-mix(in oklab, var(--color-primary) 10%, transparent);
    }
  }

  &.variant-ghost.color-neutral {
    color: var(--text-color-default);

    &:hover {
      background-color: var(--background-color-elevated);
    }

    &:focus-visible {
      outline-color: var(--border-color-inverted);
    }

    &:active {
      background-color: var(--background-color-elevated);
    }
  }

  /* Outweighs the hover and active backgrounds of the ghost color variants. */
  &.variant-ghost.color-primary,
  &.variant-ghost.color-neutral {
    &:disabled,
    &[aria-disabled="true"] {
      background-color: transparent;
    }
  }

  &.variant-link.color-primary {
    color: var(--color-primary);

    &:hover {
      color: color-mix(in oklab, var(--color-primary) 75%, transparent);
    }

    &:focus-visible {
      outline-color: var(--color-primary);
    }

    &:active {
      color: color-mix(in oklab, var(--color-primary) 75%, transparent);
    }
  }

  &.variant-link.color-neutral {
    color: var(--text-color-muted);

    &:hover {
      color: var(--text-color-default);
    }

    &:focus-visible {
      outline-color: var(--border-color-inverted);
    }

    &:active {
      color: var(--text-color-default);
    }
  }

  &.size-sm {
    gap: calc(var(--spacing) * 1);

    padding-block: calc(var(--spacing) * 1);
    padding-inline: calc(var(--spacing) * 2);

    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);

    &.square {
      padding: calc(var(--spacing) * 1);
    }
  }

  &.size-md {
    gap: calc(var(--spacing) * 1.5);

    padding-block: calc(var(--spacing) * 1.5);
    padding-inline: calc(var(--spacing) * 2.5);

    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);

    &.square {
      padding: calc(var(--spacing) * 1.5);
    }
  }

  &.size-lg {
    gap: calc(var(--spacing) * 2);

    padding-block: calc(var(--spacing) * 2);
    padding-inline: calc(var(--spacing) * 3);

    font-size: var(--text-base);
    line-height: var(--text-base--line-height);

    &.square {
      padding: calc(var(--spacing) * 2);
    }
  }

  &.field-group {
    &:focus-visible {
      z-index: 1;
    }

    &:not(:last-child):not(:first-child) {
      border-radius: 0;
    }

    &:not(:only-child):first-child {
      border-start-end-radius: 0;
      border-end-end-radius: 0;
    }

    &:not(:only-child):last-child {
      border-start-start-radius: 0;
      border-end-start-radius: 0;
    }
  }
}

.leading-icon,
.trailing-icon {
  flex-shrink: 0;

  &.loading {
    animation: var(--animate-spin);
  }

  .size-sm > & {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);
  }

  .size-md > & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-lg > & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

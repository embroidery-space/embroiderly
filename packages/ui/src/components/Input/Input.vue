<script setup lang="ts">
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import type { UseComponentIconsProps } from "../../composables/useComponentIcons.ts";
import { useFormField } from "../../composables/useFormField.ts";
import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";
import Icon from "../Icon/Icon.vue";

export interface InputProps extends UseComponentIconsProps {
  id?: string;

  /**
   * The color scheme of the input.
   * @default "primary"
   */
  color?: "primary";
  /**
   * The style variant of the input.
   * @default "subtle"
   */
  variant?: "subtle" | "outline" | "none";
  /**
   * The size of the input.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /** Whether the input is disabled. */
  disabled?: boolean;
}

export interface InputSlots {
  leading(): any;
  trailing(): any;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<string>();
const props = withDefaults(defineProps<InputProps>(), {
  color: "primary",
  variant: "subtle",
});
const slots = defineSlots<InputSlots>();

const { fieldGroup, fieldGroupSize } = useFormFieldGroup();
const { id, size: formFieldSize, ariaAttrs } = useFormField(props);
const size = computed(() => props.size ?? (fieldGroup.value ? fieldGroupSize.value : formFieldSize.value));

const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(
  computed(() => ({ ...props, loading: props.loading })),
);

const hasLeading = computed(() => isLeading.value || !!slots.leading);
const hasTrailing = computed(() => isTrailing.value || !!slots.trailing);

const isLeadingSpinning = computed(() => props.loading && hasLeading.value);
const isTrailingSpinning = computed(() => props.loading && !hasLeading.value && hasTrailing.value);
</script>

<template>
  <div
    data-slot="root"
    :class="[
      $style.root,
      $style[`color-${color}`],
      $style[`variant-${variant}`],
      $style[`size-${size}`],
      hasLeading && $style.hasLeading,
      hasTrailing && $style.hasTrailing,
      fieldGroup && $style.fieldGroup,
    ]"
  >
    <span v-if="hasLeading" data-slot="leading" :class="$style.leading">
      <slot name="leading">
        <Icon
          v-if="isLeading && leadingIconName"
          aria-hidden="true"
          :name="leadingIconName"
          data-slot="leading-icon"
          :class="[$style.leadingIcon, { [$style.loading]: isLeadingSpinning }]"
        />
      </slot>
    </span>

    <input
      :id="id"
      v-model="modelValue"
      v-bind="{ ...$attrs, ...ariaAttrs }"
      type="text"
      :disabled="disabled"
      data-slot="base"
      :class="$style.base"
    />

    <span v-if="hasTrailing" data-slot="trailing" :class="$style.trailing">
      <slot name="trailing">
        <Icon
          v-if="isTrailing && trailingIconName"
          aria-hidden="true"
          :name="trailingIconName"
          data-slot="trailing-icon"
          :class="[$style.trailingIcon, { [$style.loading]: isTrailingSpinning }]"
        />
      </slot>
    </span>
  </div>
</template>

<style module>
.root {
  position: relative;
  display: inline-flex;
  align-items: center;

  &.field-group:has(*:focus-visible) {
    z-index: 1;
  }
}

.leading {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;

  display: flex;
  align-items: center;

  .size-sm > & {
    padding-inline-start: calc(var(--spacing) * 2);
  }

  .size-md > & {
    padding-inline-start: calc(var(--spacing) * 2.5);
  }

  .size-lg > & {
    padding-inline-start: calc(var(--spacing) * 3);
  }
}

.leading-icon {
  flex-shrink: 0;
  color: var(--text-color-dimmed);

  &.loading {
    animation: var(--animate-spin);
  }

  .size-sm > * > & {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);
  }

  .size-md > * > & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-lg > * > & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }
}

.base {
  width: 100%;
  border-width: 0;
  border-radius: var(--radius-md);

  appearance: none;

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: var(--default-transition-duration);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &:focus {
    outline-style: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 75%;
  }

  .variant-subtle > & {
    background-color: var(--background-color-elevated);
    box-shadow: inset 0 0 0 1px var(--border-color-accented);
  }

  .variant-outline > & {
    background-color: var(--background-color-default);
    box-shadow: inset 0 0 0 1px var(--border-color-accented);
  }

  .variant-none > & {
    background-color: transparent;
  }

  .size-sm > & {
    gap: calc(var(--spacing) * 1);

    padding-block: calc(var(--spacing) * 1);
    padding-inline: calc(var(--spacing) * 2);

    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  .size-md > & {
    gap: calc(var(--spacing) * 1.5);

    padding-block: calc(var(--spacing) * 1.5);
    padding-inline: calc(var(--spacing) * 2.5);

    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  .size-lg > & {
    gap: calc(var(--spacing) * 2);

    padding-block: calc(var(--spacing) * 2);
    padding-inline: calc(var(--spacing) * 3);

    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }

  .color-primary.variant-subtle > &,
  .color-primary.variant-outline > & {
    &:focus-visible {
      box-shadow: inset 0 0 0 2px var(--color-primary);
    }
  }

  .size-sm.has-leading > & {
    padding-inline-start: calc(var(--spacing) * 7);
  }

  .size-md.has-leading > & {
    padding-inline-start: calc(var(--spacing) * 9);
  }

  .size-lg.has-leading > & {
    padding-inline-start: calc(var(--spacing) * 11);
  }

  .size-sm.has-trailing > & {
    padding-inline-end: calc(var(--spacing) * 7);
  }

  .size-md.has-trailing > & {
    padding-inline-end: calc(var(--spacing) * 9);
  }

  .size-lg.has-trailing > & {
    padding-inline-end: calc(var(--spacing) * 11);
  }

  .field-group:not(:last-child):not(:first-child) > & {
    border-radius: 0;
  }

  .field-group:not(:only-child):first-child > & {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  .field-group:not(:only-child):last-child > & {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
}

.trailing {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;

  display: flex;
  align-items: center;

  .size-sm > & {
    padding-inline-end: calc(var(--spacing) * 2);
  }

  .size-md > & {
    padding-inline-end: calc(var(--spacing) * 2.5);
  }

  .size-lg > & {
    padding-inline-end: calc(var(--spacing) * 3);
  }
}

.trailing-icon {
  flex-shrink: 0;
  color: var(--text-color-dimmed);

  &.loading {
    animation: var(--animate-spin);
  }

  .size-sm > * > & {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);
  }

  .size-md > * > & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-lg > * > & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }
}
</style>

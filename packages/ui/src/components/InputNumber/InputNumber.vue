<script setup lang="ts">
import { NumberField } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useFormField } from "../../composables/useFormField.ts";
import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Button from "../Button/Button.vue";

export interface InputNumberProps {
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
  variant?: "subtle" | "outline";
  /**
   * The size of the input.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /** Whether the input is disabled. */
  disabled?: boolean;

  /** The minimum value of the input. */
  min?: number;
  /** The maximum value of the input. */
  max?: number;
  /** The step size of the input. */
  step?: number;
  /** Whether to snap the input to the step size. */
  stepSnapping?: boolean;
  /** The format options for the input display value. */
  formatOptions?: Intl.NumberFormatOptions;

  /**
   * Whether to show the increment button.
   * @default true
   */
  increment?: boolean;
  /**
   * Whether to show the decrement button.
   * @default true
   */
  decrement?: boolean;
  /**
   * The icon for the increment button.
   * @default "icons.chevronUp"
   */
  incrementIcon?: string;
  /**
   * The icon for the decrement button.
   * @default "icons.chevronDown"
   */
  decrementIcon?: string;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<number | null>();
const props = withDefaults(defineProps<InputNumberProps>(), {
  color: "primary",
  variant: "subtle",

  increment: true,
  decrement: true,
});

const { icons } = useComponentIcons();
const locale = useLocale();

const { fieldGroup, fieldGroupSize } = useFormFieldGroup();
const { id, size: formFieldSize, ariaAttrs } = useFormField(props);
const size = computed(() => props.size ?? (fieldGroup.value ? fieldGroupSize.value : formFieldSize.value));

const hasButtons = computed(() => props.increment || props.decrement);
</script>

<template>
  <NumberField.Root
    :id="id"
    v-model="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :step-snapping="stepSnapping"
    :format-options="formatOptions"
    :disabled="disabled"
    data-slot="root"
    :class="[
      $style.root,
      $style[`color-${color}`],
      $style[`variant-${variant}`],
      $style[`size-${size}`],
      hasButtons && $style.hasButtons,
      fieldGroup && $style.fieldGroup,
    ]"
  >
    <NumberField.Input v-bind="{ ...$attrs, ...ariaAttrs }" data-slot="base" :class="$style.base" />

    <div v-if="hasButtons" data-slot="buttons" :class="$style.buttons">
      <NumberField.Increment v-if="increment" as-child :disabled="disabled">
        <Button
          square
          color="neutral"
          variant="link"
          :icon="incrementIcon ?? icons.chevronUp"
          :size="size"
          :aria-label="locale.messages.inputNumber.increment"
        />
      </NumberField.Increment>

      <NumberField.Decrement v-if="decrement" as-child :disabled="disabled">
        <Button
          square
          color="neutral"
          variant="link"
          :icon="decrementIcon ?? icons.chevronDown"
          :size="size"
          :aria-label="locale.messages.inputNumber.decrement"
        />
      </NumberField.Decrement>
    </div>
  </NumberField.Root>
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

  .size-sm > & {
    padding-block: calc(var(--spacing) * 1);
    padding-inline-start: calc(var(--spacing) * 2);
    padding-inline-end: calc(var(--spacing) * 7);

    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  .size-md > & {
    padding-block: calc(var(--spacing) * 1.5);
    padding-inline-start: calc(var(--spacing) * 2.5);
    padding-inline-end: calc(var(--spacing) * 8);

    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  .size-lg > & {
    padding-block: calc(var(--spacing) * 2);
    padding-inline-start: calc(var(--spacing) * 3);
    padding-inline-end: calc(var(--spacing) * 9);

    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }

  .color-primary.variant-subtle > &,
  .color-primary.variant-outline > & {
    &:focus-visible {
      box-shadow: inset 0 0 0 2px var(--color-primary);
    }
  }

  .size-sm:not(.has-buttons) > & {
    padding-inline-end: calc(var(--spacing) * 2);
  }

  .size-md:not(.has-buttons) > & {
    padding-inline-end: calc(var(--spacing) * 2.5);
  }

  .size-lg:not(.has-buttons) > & {
    padding-inline-end: calc(var(--spacing) * 3);
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

.buttons {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;

  .size-sm > & {
    padding-inline-end: calc(var(--spacing) * 1);
  }

  .size-md > & {
    padding-inline-end: calc(var(--spacing) * 1);
  }

  .size-lg > & {
    padding-inline-end: calc(var(--spacing) * 1.5);
  }

  &[data-slot="buttons"] > button[data-slot="base"] {
    scale: 80%;
    padding-block: 0;
  }
}
</style>

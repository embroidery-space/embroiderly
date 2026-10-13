<script setup lang="ts">
import { NumberField } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Button from "../Button/Button.vue";

export interface InputNumberProps {
  /**
   * The style variant of the input.
   * @default "subtle"
   */
  variant?: "subtle" | "outline";

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
  variant: "subtle",

  increment: true,
  decrement: true,
});

const { icons } = useComponentIcons();
const locale = useLocale();

const hasButtons = computed(() => props.increment || props.decrement);
</script>

<template>
  <NumberField.Root
    v-model="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :step-snapping="stepSnapping"
    :format-options="formatOptions"
    :disabled="disabled"
    data-slot="root"
    :class="[$style.root, $style[`variant-${variant}`], hasButtons && $style.hasButtons]"
  >
    <NumberField.Input v-bind="$attrs" data-slot="base" :class="$style.base" />

    <div v-if="hasButtons" data-slot="buttons" :class="$style.buttons">
      <NumberField.Increment v-if="increment" as-child :disabled="disabled">
        <Button
          square
          color="neutral"
          variant="link"
          :icon="incrementIcon ?? icons.chevronUp"
          :aria-label="locale.messages.inputNumber.increment"
        />
      </NumberField.Increment>

      <NumberField.Decrement v-if="decrement" as-child :disabled="disabled">
        <Button
          square
          color="neutral"
          variant="link"
          :icon="decrementIcon ?? icons.chevronDown"
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
}

.base {
  width: 100%;

  padding-block: calc(var(--spacing) * 1.5);
  padding-inline: calc(var(--spacing) * 2.5) calc(var(--spacing) * 8);
  border-width: 0;
  border-radius: var(--radius-md);

  font-size: var(--text-sm);

  appearance: none;

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: var(--default-transition-duration);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &:focus {
    outline-style: none;
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 2px var(--color-primary);
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

  &:not(.has-buttons > &) {
    padding-inline-end: calc(var(--spacing) * 2.5);
  }
}

.buttons {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;

  padding-inline-end: calc(var(--spacing) * 1);

  &[data-slot="buttons"] > button[data-slot="base"] {
    scale: 80%;

    padding-block: 0;
  }
}
</style>

<script setup lang="ts">
import { injectFieldRootContext } from "reka-ui";
import { Field } from "reka-ui/namespaced";

export interface TextareaProps {
  /** Whether the textarea should automatically resize based on content. */
  autoresize?: boolean;
  /** Whether the textarea is disabled. */
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<string>();
defineProps<TextareaProps>();

const fieldContext = injectFieldRootContext(null);
</script>

<template>
  <Field.Control
    v-if="fieldContext"
    ref="textarea"
    v-model="modelValue"
    v-bind="$attrs"
    as="textarea"
    :disabled="disabled"
    data-slot="base"
    :class="[$style.base, autoresize && $style.autoresize]"
  />
  <textarea
    v-else
    ref="textarea"
    v-model="modelValue"
    v-bind="$attrs"
    :disabled="disabled"
    data-slot="base"
    :class="[$style.base, autoresize && $style.autoresize]"
  />
</template>

<style module>
.base {
  gap: calc(var(--spacing) * 1.5);

  width: 100%;

  padding-block: calc(var(--spacing) * 1.5);
  padding-inline: calc(var(--spacing) * 2.5);
  border-width: 0;
  border-radius: var(--radius-md);

  font-size: var(--text-sm);

  appearance: none;

  background-color: var(--background-color-elevated);
  box-shadow: inset 0 0 0 1px var(--border-color-accented);

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

  &.autoresize {
    resize: none;

    field-sizing: content;
  }
}
</style>

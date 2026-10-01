<script setup lang="ts">
import { Label } from "reka-ui";
import { computed, provide, ref, useId } from "vue";

import { formFieldInjectionKey, inputIdInjectionKey } from "../../composables/useFormField.ts";
import type { FormFieldInjectedOptions } from "../../composables/useFormField.ts";

export interface FormFieldProps {
  /** The label text for the field. */
  label?: string;
  /** A description shown below the label. */
  description?: string;
  /** Help text shown below the input. */
  help?: string;
  /** A hint shown next to the label. */
  hint?: string;

  /**
   * The size of the form field.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}

export interface FormFieldSlots {
  default(): any;
}

const props = withDefaults(defineProps<FormFieldProps>(), {
  size: "md",
});
defineSlots<FormFieldSlots>();

const id = ref(useId());
const ariaId = id.value;

provide(inputIdInjectionKey, id);
provide(
  formFieldInjectionKey,
  computed(
    () =>
      ({
        ariaId,
        label: props.label,
        size: props.size,
        hint: props.hint,
        description: props.description,
        help: props.help,
      }) satisfies FormFieldInjectedOptions,
  ),
);
</script>

<template>
  <div data-slot="root" :class="[$style.root, $style[`size-${size}`]]">
    <div data-slot="wrapper">
      <div v-if="label" data-slot="label-wrapper" :class="$style.labelWrapper">
        <Label :id="`${ariaId}-label`" :for="id" data-slot="label" :class="$style.label">
          {{ label }}
        </Label>
        <span v-if="hint" :id="`${ariaId}-hint`" data-slot="hint" :class="$style.hint">
          {{ hint }}
        </span>
      </div>

      <p v-if="description" :id="`${ariaId}-description`" data-slot="description" :class="$style.description">
        {{ description }}
      </p>
    </div>

    <div :class="[(label || description) && $style.container]" data-slot="container">
      <slot />
      <p v-if="help" :id="`${ariaId}-help`" data-slot="help" :class="$style.help">
        {{ help }}
      </p>
    </div>
  </div>
</template>

<style module>
.root {
  width: 100%;

  /* Stretches the control. */
  > [data-slot="container"] > :first-child {
    width: 100%;
  }

  &.size-sm {
    font-size: var(--text-xs);
  }

  &.size-md {
    font-size: var(--text-sm);
  }

  &.size-lg {
    font-size: var(--text-base);
  }
}

.label-wrapper {
  display: flex;
  gap: calc(var(--spacing) * 1);
  align-items: center;
  justify-content: space-between;
}

.label {
  display: block;

  font-weight: 500;
  color: var(--text-color-default);
}

.hint {
  color: var(--text-color-muted);
}

.description {
  color: var(--text-color-muted);
}

.container {
  margin-top: calc(var(--spacing) * 1);
}

.help {
  margin-top: calc(var(--spacing) * 1);

  color: var(--text-color-muted);
}
</style>

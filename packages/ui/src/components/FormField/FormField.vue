<script setup lang="ts">
import { Field } from "reka-ui/namespaced";

export interface FormFieldProps {
  /** The label text for the field. */
  label?: string;
  /** A description shown below the label. */
  description?: string;
}

export interface FormFieldSlots {
  default(): any;
}

defineProps<FormFieldProps>();
defineSlots<FormFieldSlots>();
</script>

<template>
  <Field.Root data-slot="root" :class="$style.root">
    <Field.Label v-if="label" data-slot="label" :class="$style.label">
      {{ label }}
    </Field.Label>

    <Field.Description v-if="description" data-slot="description" :class="$style.description">
      {{ description }}
    </Field.Description>

    <div :class="[(label || description) && $style.container]" data-slot="container">
      <slot />
    </div>
  </Field.Root>
</template>

<style module>
.root {
  width: 100%;

  font-size: var(--text-sm);

  /* Stretches the control. */
  > [data-slot="container"] > :first-child {
    width: 100%;
  }
}

.label {
  display: block;

  font-weight: 500;
  color: var(--text-color-default);
}

.description {
  color: var(--text-color-muted);
}

.container {
  margin-top: calc(var(--spacing) * 1);
}
</style>

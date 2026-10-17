<script setup lang="ts">
import { Field, Switch } from "reka-ui/namespaced";

export interface SwitchProps {
  /** The label of the switch. */
  label?: string;
  /** The description of the switch. */
  description?: string;

  /** Whether the switch is disabled. */
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<boolean>();
defineProps<SwitchProps>();
</script>

<template>
  <Field.Root data-slot="root" :class="[$style.root, { [$style.disabled]: disabled }]">
    <div data-slot="container" :class="$style.container">
      <Switch.Root v-model="modelValue" v-bind="$attrs" :disabled="disabled" data-slot="base" :class="$style.base">
        <Switch.Thumb data-slot="thumb" :class="$style.thumb" />
      </Switch.Root>
    </div>

    <div v-if="label || description" data-slot="wrapper" :class="$style.wrapper">
      <Field.Label v-if="label" data-slot="label" :class="$style.label">{{ label }}</Field.Label>
      <Field.Description v-if="description" data-slot="description" :class="$style.description">
        {{ description }}
      </Field.Description>
    </div>
  </Field.Root>
</template>

<style module>
.root {
  position: relative;

  display: flex;
  align-items: flex-start;

  &.disabled {
    opacity: 75%;
  }
}

.container {
  display: flex;
  align-items: center;

  height: calc(var(--spacing) * 5);
}

.base {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;

  width: calc(var(--spacing) * 9);
  height: calc(var(--spacing) * 5);

  border: 2px solid transparent;
  border-radius: calc(infinity * 1px);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: 200ms;
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &[data-state="unchecked"] {
    background-color: var(--background-color-accented);
  }

  .disabled & {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &[data-state="checked"] {
    background-color: var(--color-primary);
  }

  &:not(:disabled):hover {
    cursor: pointer;
  }
}

.thumb {
  pointer-events: none;

  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);

  border-radius: calc(infinity * 1px);

  background-color: var(--background-color-default);
  box-shadow: var(--shadow-lg);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: 200ms;
  transition-property: transform, translate, scale, rotate;

  &[data-state="unchecked"] {
    translate: 0 0;
  }

  &[data-state="checked"] {
    translate: calc(var(--spacing) * 4) 0;
  }
}

.wrapper {
  width: 100%;
  margin-inline-start: calc(var(--spacing) * 2);

  font-size: var(--text-sm);
}

.label {
  display: block;

  font-weight: 500;
  color: var(--text-color-default);

  &:hover {
    cursor: pointer;
  }

  .disabled & {
    cursor: not-allowed;
  }
}

.description {
  color: var(--text-color-muted);

  .disabled & {
    cursor: not-allowed;
  }
}
</style>

<script setup lang="ts">
import { Checkbox, Field } from "reka-ui/namespaced";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";

export interface CheckboxProps {
  /** The label of the checkbox. */
  label?: string;
  /** The description of the checkbox. */
  description?: string;

  /**
   * The icon displayed when checked.
   * @default "icons.check"
   */
  icon?: IconValue;

  /** Whether the checkbox is disabled. */
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<boolean>();
defineProps<CheckboxProps>();

const { icons } = useComponentIcons();
</script>

<template>
  <Field.Root data-slot="root" :class="[$style.root, { [$style.disabled]: disabled }]">
    <div data-slot="container" :class="$style.container">
      <Checkbox.Root v-model="modelValue" v-bind="$attrs" :disabled="disabled" data-slot="base" :class="$style.base">
        <Checkbox.Indicator data-slot="indicator" :class="$style.indicator">
          <Icon :name="icon ?? icons.check" data-slot="icon" :class="$style.icon" />
        </Checkbox.Indicator>
      </Checkbox.Root>
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
  overflow: hidden;

  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);

  border-radius: var(--radius-sm);

  box-shadow: inset 0 0 0 1px var(--border-color-accented);

  .disabled & {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &:not(:disabled):hover {
    cursor: pointer;
  }
}

.indicator {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  color: var(--text-color-inverted);

  background-color: var(--color-primary);
}

.icon {
  flex-shrink: 0;

  width: 100%;
  height: 100%;
  margin-top: 1px;
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

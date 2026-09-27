<script setup lang="ts">
import { Checkbox, Label } from "reka-ui/namespaced";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useFormField } from "../../composables/useFormField.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";

export interface CheckboxProps {
  id?: string;

  /** The label of the checkbox. */
  label?: string;
  /** The description of the checkbox. */
  description?: string;

  /**
   * The color of the checkbox.
   * @default "primary"
   */
  color?: "primary";
  /**
   * The size of the checkbox.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

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
const props = withDefaults(defineProps<CheckboxProps>(), {
  color: "primary",
  size: "md",
});

const { icons } = useComponentIcons();

const { id, size, ariaAttrs } = useFormField(props);
</script>

<template>
  <div
    data-slot="root"
    :class="[$style.root, $style[`color-${color}`], $style[`size-${size}`], { [$style.disabled]: disabled }]"
  >
    <div data-slot="container" :class="$style.container">
      <Checkbox.Root
        :id="id"
        v-model="modelValue"
        v-bind="{ ...$attrs, ...ariaAttrs }"
        :disabled="disabled"
        data-slot="base"
        :class="$style.base"
      >
        <Checkbox.Indicator data-slot="indicator" :class="$style.indicator">
          <Icon :name="icon ?? icons.check" data-slot="icon" :class="$style.icon" />
        </Checkbox.Indicator>
      </Checkbox.Root>
    </div>

    <div v-if="label || description" data-slot="wrapper" :class="$style.wrapper">
      <Label v-if="label" :for="id" data-slot="label" :class="$style.label">{{ label }}</Label>
      <p v-if="description" data-slot="description" :class="$style.description">
        {{ description }}
      </p>
    </div>
  </div>
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

  .size-sm & {
    height: calc(var(--spacing) * 4);
  }

  .size-md & {
    height: calc(var(--spacing) * 5);
  }

  .size-lg & {
    height: calc(var(--spacing) * 6);
  }
}

.base {
  overflow: hidden;
  border-radius: var(--radius-sm);
  box-shadow: inset 0 0 0 1px var(--border-color-accented);

  .size-sm & {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);
  }

  .size-md & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-lg & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }

  .disabled & {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid;
    outline-offset: 2px;
  }

  .color-primary &:focus-visible {
    outline-color: var(--color-primary);
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

  .color-primary & {
    background-color: var(--color-primary);
  }
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

  .size-sm & {
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  .size-md & {
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  .size-lg & {
    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }
}

.label {
  display: block;
  font-weight: var(--font-weight-medium);
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

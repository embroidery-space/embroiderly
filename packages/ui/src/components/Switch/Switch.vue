<script setup lang="ts">
import { Switch, Label } from "reka-ui/namespaced";

import { useFormField } from "../../composables/useFormField.ts";

export interface SwitchProps {
  id?: string;

  /** The label of the switch. */
  label?: string;
  /** The description of the switch. */
  description?: string;

  /**
   * The color of the switch.
   * @default "primary"
   */
  color?: "primary";
  /**
   * The size of the switch.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /** Whether the switch is disabled. */
  disabled?: boolean;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<boolean>();
const props = withDefaults(defineProps<SwitchProps>(), {
  color: "primary",
  size: "md",
});

const { id, size, ariaAttrs } = useFormField(props);
</script>

<template>
  <div
    data-slot="root"
    :class="[$style.root, $style[`color-${color}`], $style[`size-${size}`], { [$style.disabled]: disabled }]"
  >
    <div data-slot="container" :class="$style.container">
      <Switch.Root
        :id="id"
        v-model="modelValue"
        v-bind="{ ...$attrs, ...ariaAttrs }"
        :disabled="disabled"
        data-slot="base"
        :class="$style.base"
      >
        <Switch.Thumb data-slot="thumb" :class="$style.thumb" />
      </Switch.Root>
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
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;

  border: 2px solid transparent;
  border-radius: calc(infinity * 1px);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: 200ms;
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &[data-state="unchecked"] {
    background-color: var(--background-color-accented);
  }

  .size-sm & {
    width: calc(var(--spacing) * 7);
    height: calc(var(--spacing) * 4);
  }

  .size-md & {
    width: calc(var(--spacing) * 9);
    height: calc(var(--spacing) * 5);
  }

  .size-lg & {
    width: calc(var(--spacing) * 11);
    height: calc(var(--spacing) * 6);
  }

  .disabled & {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid;
    outline-offset: 2px;
  }

  .color-primary & {
    &:focus-visible {
      outline-color: var(--color-primary);
    }

    &[data-state="checked"] {
      background-color: var(--color-primary);
    }
  }

  &:not(:disabled):hover {
    cursor: pointer;
  }
}

.thumb {
  pointer-events: none;

  border-radius: calc(infinity * 1px);

  background-color: var(--background-color-default);
  box-shadow: var(--shadow-lg);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: 200ms;
  transition-property: transform, translate, scale, rotate;

  &[data-state="unchecked"] {
    translate: 0 0;
  }

  .size-sm & {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);

    &[data-state="checked"] {
      translate: calc(var(--spacing) * 3) 0;
    }
  }

  .size-md & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);

    &[data-state="checked"] {
      translate: calc(var(--spacing) * 4) 0;
    }
  }

  .size-lg & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);

    &[data-state="checked"] {
      translate: calc(var(--spacing) * 5) 0;
    }
  }
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

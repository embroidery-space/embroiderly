<script setup lang="ts">
import { Field, Toggle } from "reka-ui/namespaced";

import { useShortcuts } from "../../composables/useShortcuts.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";
import Tooltip from "../Tooltip/Tooltip.vue";
import type { TooltipProps } from "../Tooltip/Tooltip.vue";

export interface ToolToggleProps extends Pick<TooltipProps, "delayDuration"> {
  /** Visible text beside the button (for expanded mode). */
  label?: string;
  /** Visible text below the label (for expanded mode). */
  description?: string;

  /** The icon to display. */
  icon: IconValue;

  /** Keyboard shortcut displayed in tooltip. */
  shortcut?: string;
  /** Hover tooltip text (for compact mode). */
  tooltip?: string;
  /** Additional options for the tooltip. */
  tooltipOptions?: Omit<TooltipProps, "text" | "shortcut" | "disabled" | "delayDuration">;

  /** Whether the toggle is disabled. */
  disabled?: boolean;
}

const modelValue = defineModel<boolean>();
const props = withDefaults(defineProps<ToolToggleProps>(), {});

useShortcuts(() => {
  if (!props.shortcut) return {};
  return {
    [props.shortcut]: () => {
      if (props.disabled) return;
      modelValue.value = !modelValue.value;
    },
  };
});
</script>

<template>
  <Field.Root
    data-slot="root"
    :class="[$style.root, disabled && $style.disabled, description && $style.hasDescription]"
  >
    <Tooltip
      v-bind="tooltipOptions"
      :text="label ? undefined : tooltip"
      :shortcut="shortcut"
      :disabled="disabled"
      :delay-duration="delayDuration"
    >
      <Toggle
        v-model="modelValue"
        v-bind="$attrs"
        :disabled="disabled"
        :aria-label="label ?? tooltip"
        data-slot="base"
        :class="$style.base"
      >
        <Icon :name="icon" data-slot="icon" :class="$style.icon" />
      </Toggle>
    </Tooltip>

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
  align-items: center;

  &.has-description {
    align-items: flex-start;
  }

  &.disabled {
    opacity: 75%;
  }
}

.base {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: calc(var(--spacing) * 1.5);

  border-radius: var(--radius-md);

  color: var(--text-color-dimmed);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: var(--default-transition-duration);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  .disabled & {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--border-color-inverted);
    outline-offset: 2px;
  }

  &:active {
    background-color: var(--background-color-elevated);
  }

  &[aria-pressed="true"] {
    background-color: var(--background-color-elevated);
  }

  &:not(:disabled):hover {
    cursor: pointer;

    background-color: var(--background-color-elevated);
  }

  &:not(:disabled)[aria-pressed="true"]:hover {
    background-color: var(--background-color-accented);
  }
}

.icon {
  flex-shrink: 0;

  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
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

  .disabled & {
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    cursor: pointer;
  }
}

.description {
  color: var(--text-color-muted);

  .disabled & {
    cursor: not-allowed;
  }
}
</style>

<script setup lang="ts">
import { Label, Toggle } from "reka-ui/namespaced";

import { useFormField } from "../../composables/useFormField.ts";
import { useShortcuts } from "../../composables/useShortcuts.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";
import Tooltip from "../Tooltip/Tooltip.vue";
import type { TooltipProps } from "../Tooltip/Tooltip.vue";

export interface ToolToggleProps extends Pick<TooltipProps, "delayDuration"> {
  id?: string;

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

  /**
   * The size of the toggle.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /** Whether the toggle is disabled. */
  disabled?: boolean;
}

const modelValue = defineModel<boolean>();
const props = withDefaults(defineProps<ToolToggleProps>(), {
  size: "md",
});

const { id, size, ariaAttrs } = useFormField(props);

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
  <div
    data-slot="root"
    :class="[$style.root, $style[`size-${size}`], disabled && $style.disabled, description && $style.hasDescription]"
  >
    <Tooltip
      v-bind="tooltipOptions"
      :text="label ? undefined : tooltip"
      :shortcut="shortcut"
      :disabled="disabled"
      :delay-duration="delayDuration"
    >
      <Toggle
        :id="id"
        v-model="modelValue"
        v-bind="ariaAttrs"
        :disabled="disabled"
        :aria-label="label ?? tooltip"
        data-slot="base"
        :class="$style.base"
      >
        <Icon :name="icon" data-slot="icon" :class="$style.icon" />
      </Toggle>
    </Tooltip>

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

  border-radius: var(--radius-md);

  color: var(--text-color-dimmed);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: var(--default-transition-duration);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  .size-sm & {
    padding: calc(var(--spacing) * 1);
  }

  .size-md & {
    padding: calc(var(--spacing) * 1.5);
  }

  .size-lg & {
    padding: calc(var(--spacing) * 2);
  }

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
}

.wrapper {
  width: 100%;
  margin-inline-start: calc(var(--spacing) * 2);

  .size-sm & {
    font-size: var(--text-xs);
  }

  .size-md & {
    font-size: var(--text-sm);
  }

  .size-lg & {
    font-size: var(--text-base);
  }
}

.label {
  display: block;

  font-weight: var(--font-weight-medium);
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

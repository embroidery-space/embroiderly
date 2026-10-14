<script setup lang="ts" generic="T extends ToolToggleItem">
import type { AcceptableValue } from "reka-ui";
import { Field, ToggleGroup } from "reka-ui/namespaced";

import { useShortcuts } from "../../composables/useShortcuts.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";
import Tooltip from "../Tooltip/Tooltip.vue";
import type { TooltipProps } from "../Tooltip/Tooltip.vue";

export interface ToolToggleItem {
  /** The icon to display. */
  icon: IconValue;

  /** Visible text beside the button (for expanded mode). */
  label?: string;
  /** Visible text below the label (expanded mode). */
  description?: string;

  /** The value of the item. */
  value: AcceptableValue;

  /** Keyboard shortcut displayed in tooltip. */
  shortcut?: string;
  /** Hover tooltip text (for compact/collapsed mode). */
  tooltip?: string;
}

export interface ToolToggleGroupProps<T extends ToolToggleItem = ToolToggleItem> extends Pick<
  TooltipProps,
  "delayDuration"
> {
  /** The items to display. */
  items: T[];

  /**
   * The orientation of the toggle group.
   * @default "horizontal"
   */
  orientation?: "vertical" | "horizontal";

  /** Whether the toggle group is disabled. */
  disabled?: boolean;

  /** Additional options for the tooltip. */
  tooltipOptions?: Omit<TooltipProps, "text" | "shortcut" | "disabled" | "delayDuration">;
}

const modelValue = defineModel<AcceptableValue>();
const props = withDefaults(defineProps<ToolToggleGroupProps<T>>(), {
  orientation: "horizontal",
});

useShortcuts(() => {
  return Object.fromEntries(
    props.items
      .filter((item) => item.shortcut)
      .map((item) => [
        item.shortcut!,
        () => {
          if (props.disabled) return;
          modelValue.value = item.value;
        },
      ]),
  );
});
</script>

<template>
  <ToggleGroup.Root
    v-model="modelValue"
    :orientation="orientation"
    :disabled="disabled"
    type="single"
    data-slot="root"
    :class="[$style.root, $style[`orientation-${orientation}`], disabled && $style.disabled]"
  >
    <Field.Root
      v-for="(item, index) in items"
      :key="index"
      data-slot="item"
      :class="[$style.item, item.description && $style.hasDescription]"
    >
      <Tooltip
        v-bind="tooltipOptions"
        :text="item.label ? undefined : item.tooltip"
        :shortcut="item.shortcut"
        :disabled="disabled"
        :delay-duration="delayDuration"
      >
        <ToggleGroup.Item
          :value="item.value"
          v-bind="$attrs"
          :disabled="disabled"
          :aria-label="item.label ?? item.tooltip"
          data-slot="base"
          :class="$style.base"
        >
          <Icon :name="item.icon" data-slot="icon" :class="$style.icon" />
        </ToggleGroup.Item>
      </Tooltip>

      <div v-if="item.label || item.description" data-slot="wrapper" :class="$style.wrapper">
        <Field.Label v-if="item.label" data-slot="label" :class="$style.label">
          {{ item.label }}
        </Field.Label>
        <Field.Description v-if="item.description" data-slot="description" :class="$style.description">
          {{ item.description }}
        </Field.Description>
      </div>
    </Field.Root>
  </ToggleGroup.Root>
</template>

<style module>
.root {
  display: flex;
  gap: calc(var(--spacing) * 1);

  &.orientation-vertical {
    flex-direction: column;
  }

  &.orientation-horizontal {
    flex-direction: row;
  }

  &.disabled {
    opacity: 75%;
  }
}

.item {
  display: flex;
  align-items: center;

  &.has-description {
    align-items: flex-start;
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

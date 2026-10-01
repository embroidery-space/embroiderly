<script setup lang="ts" generic="T extends ToolToggleItem">
import type { AcceptableValue } from "reka-ui";
import { Label, ToggleGroup } from "reka-ui/namespaced";
import { useId } from "vue";

import { useFormField } from "../../composables/useFormField.ts";
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
  /**
   * The size of the toggle group.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /** Whether the toggle group is disabled. */
  disabled?: boolean;

  /** Additional options for the tooltip. */
  tooltipOptions?: Omit<TooltipProps, "text" | "shortcut" | "disabled" | "delayDuration">;
}

const modelValue = defineModel<AcceptableValue>();
const props = withDefaults(defineProps<ToolToggleGroupProps<T>>(), {
  orientation: "horizontal",
  size: "md",
});

const { size, ariaAttrs } = useFormField(props);

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
    :class="[$style.root, $style[`orientation-${orientation}`], $style[`size-${size}`], disabled && $style.disabled]"
  >
    <template v-for="(item, index) in items.map((o) => ({ id: useId(), ...o }))" :key="index">
      <div data-slot="item" :class="[$style.item, item.description && $style.hasDescription]">
        <Tooltip
          v-bind="tooltipOptions"
          :text="item.label ? undefined : item.tooltip"
          :shortcut="item.shortcut"
          :disabled="disabled"
          :delay-duration="delayDuration"
        >
          <ToggleGroup.Item
            :id="item.id"
            :value="item.value"
            v-bind="ariaAttrs"
            :disabled="disabled"
            :aria-label="item.label ?? item.tooltip"
            data-slot="base"
            :class="$style.base"
          >
            <Icon :name="item.icon" data-slot="icon" :class="$style.icon" />
          </ToggleGroup.Item>
        </Tooltip>

        <div v-if="item.label || item.description" data-slot="wrapper" :class="$style.wrapper">
          <Label v-if="item.label" :for="item.id" data-slot="label" :class="$style.label">
            {{ item.label }}
          </Label>
          <p v-if="item.description" data-slot="description" :class="$style.description">
            {{ item.description }}
          </p>
        </div>
      </div>
    </template>
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

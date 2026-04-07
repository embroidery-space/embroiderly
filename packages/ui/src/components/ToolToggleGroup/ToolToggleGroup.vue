<script setup lang="ts" generic="T extends ToolToggleItem">
import type { AcceptableValue } from "reka-ui";
import { Label, ToggleGroup } from "reka-ui/namespaced";
import { computed, useId } from "vue";

import { useFormField } from "../../composables/useFormField.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";
import Tooltip from "../Tooltip/Tooltip.vue";
import type { TooltipProps } from "../Tooltip/Tooltip.vue";

import { ToolToggleGroupTheme } from "./ToolToggleGroup.theme.ts";
import type { ToolToggleGroupThemeSlots, ToolToggleGroupThemeVariants } from "./ToolToggleGroup.theme.ts";

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
   * @default "lg"
   */
  size?: ToolToggleGroupThemeVariants["size"];

  /** Whether the toggle group is disabled. */
  disabled?: boolean;

  /** Additional options for the tooltip. */
  tooltipOptions?: Omit<TooltipProps, "text" | "shortcut" | "disabled" | "delayDuration">;

  class?: any;
  ui?: ToolToggleGroupThemeSlots;
}

const modelValue = defineModel<AcceptableValue>();
const props = withDefaults(defineProps<ToolToggleGroupProps<T>>(), {
  size: "lg",
  orientation: "horizontal",
});

const { size, ariaAttrs } = useFormField(props);

const ui = computed(() => {
  return ToolToggleGroupTheme({
    orientation: props.orientation,
    size: size.value,
    disabled: props.disabled,
  });
});
</script>

<template>
  <ToggleGroup.Root
    v-model="modelValue"
    :orientation="orientation"
    :disabled="disabled"
    type="single"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <template v-for="(item, index) in items.map((o) => ({ id: useId(), ...o }))" :key="index">
      <div
        data-slot="item"
        :class="ui.item({ class: [props.ui?.item, item.description ? 'items-start' : 'items-center'] })"
      >
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
            :class="ui.base({ class: props.ui?.base })"
          >
            <Icon :name="item.icon" data-slot="icon" :class="ui.icon({ class: props.ui?.icon })" />
          </ToggleGroup.Item>
        </Tooltip>

        <div
          v-if="item.label || item.description"
          data-slot="wrapper"
          :class="ui.wrapper({ class: props.ui?.wrapper })"
        >
          <Label v-if="item.label" :for="item.id" data-slot="label" :class="ui.label({ class: props.ui?.label })">
            {{ item.label }}
          </Label>
          <p v-if="item.description" data-slot="description" :class="ui.description({ class: props.ui?.description })">
            {{ item.description }}
          </p>
        </div>
      </div>
    </template>
  </ToggleGroup.Root>
</template>

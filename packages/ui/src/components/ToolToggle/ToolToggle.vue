<script setup lang="ts">
import { Label, Toggle } from "reka-ui/namespaced";
import { computed } from "vue";

import { useFormField } from "../../composables/useFormField.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";
import Tooltip from "../Tooltip/Tooltip.vue";
import type { TooltipProps } from "../Tooltip/Tooltip.vue";

import { ToolToggleTheme } from "./ToolToggle.theme.ts";
import type { ToolToggleThemeSlots, ToolToggleThemeVariants } from "./ToolToggle.theme.ts";

export interface ToolToggleProps extends Pick<TooltipProps, "delayDuration"> {
  /** The ID of the toggle. */
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
  size?: ToolToggleThemeVariants["size"];

  /** Whether the toggle is disabled. */
  disabled?: boolean;

  class?: any;
  ui?: ToolToggleThemeSlots;
}

const modelValue = defineModel<boolean>();
const props = withDefaults(defineProps<ToolToggleProps>(), {
  size: "md",
});

const { id, size, ariaAttrs } = useFormField(props);

const ui = computed(() => {
  return ToolToggleTheme({
    size: size.value,
    disabled: props.disabled,
  });
});
</script>

<template>
  <div
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class, description ? 'items-start' : 'items-center'] })"
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
        data-slot="base"
        :class="ui.base({ class: props.ui?.base })"
      >
        <Icon :name="icon" data-slot="icon" :class="ui.icon({ class: props.ui?.icon })" />
      </Toggle>
    </Tooltip>

    <div v-if="label || description" data-slot="wrapper" :class="ui.wrapper({ class: props.ui?.wrapper })">
      <Label v-if="label" :for="id" data-slot="label" :class="ui.label({ class: props.ui?.label })">{{ label }}</Label>
      <p v-if="description" data-slot="description" :class="ui.description({ class: props.ui?.description })">
        {{ description }}
      </p>
    </div>
  </div>
</template>

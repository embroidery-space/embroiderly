<script setup lang="ts" generic="T extends ToolSelectItem">
import { unrefElement } from "@vueuse/core";
import type { DropdownMenuContentProps } from "reka-ui";
import { ref, computed, toRaw, useTemplateRef, watch } from "vue";
import type { MaybeRefOrGetter } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import type { IconValue } from "../../types/icons.ts";
import DropdownMenu from "../DropdownMenu/DropdownMenu.vue";
import type { DropdownMenuItem } from "../DropdownMenu/DropdownMenu.vue";
import Icon from "../Icon/Icon.vue";
import Tooltip from "../Tooltip/Tooltip.vue";
import type { TooltipProps } from "../Tooltip/Tooltip.vue";

import { ToolSelectTheme } from "./ToolSelect.theme.ts";
import type { ToolSelectThemeSlots, ToolSelectThemeVariants } from "./ToolSelect.theme.ts";

export interface ToolSelectItem {
  /** The icon to display. */
  icon: IconValue;
  /** The label of the item. */
  label: string;
  /** The value of the item. */
  value: unknown;
  /** Keyboard shortcut (display-only). */
  shortcut?: string;
}

export interface ToolSelectProps<T extends ToolSelectItem = ToolSelectItem> extends Pick<
  TooltipProps,
  "delayDuration"
> {
  /** The items to display. */
  items: T[];

  /**
   * The size of the tool select.
   * @default "md"
   */
  size?: ToolSelectThemeVariants["size"];

  /** Custom selection color. */
  selectionColor?: string;

  /** Additional options for the dropdown menu. */
  dropdownOptions?: Omit<DropdownMenuContentProps, "as" | "asChild">;

  /** Additional options for the tooltip. */
  tooltipOptions?: Omit<TooltipProps, "text" | "disabled" | "delayDuration">;

  /** Whether the tool select is disabled. */
  disabled?: boolean;

  class?: any;
  ui?: ToolSelectThemeSlots;
}

const model = defineModel<unknown>();
const props = withDefaults(defineProps<ToolSelectProps<T>>(), {
  size: "md",
});

const { icons } = useComponentIcons();

const dropdownItems = computed<DropdownMenuItem[]>(() => {
  return props.items.map((item) => {
    const { icon, label, value, shortcut } = item;
    return {
      icon,
      label,
      shortcut,
      onSelect() {
        model.value = value;
        dropdownMenuOpen.value = false;
      },
    };
  });
});

// Track the last selected option from this group.
const lastSelectedOption = ref<T>(props.items[0]!);

const currentOption = computed<T>(() => {
  const rawModelValue = toRaw(model.value);
  const foundOption = props.items.find(({ value }) => value === rawModelValue);
  return foundOption ?? lastSelectedOption.value;
});

watch(
  () => toRaw(model.value),
  (rawModelValue) => {
    const foundOption = props.items.find(({ value }) => value === rawModelValue);
    if (foundOption) lastSelectedOption.value = foundOption;
  },
);

const selected = computed(() => currentOption.value.value === toRaw(model.value) && !props.disabled);

const ui = computed(() => {
  return ToolSelectTheme({
    size: props.size,
    selected: selected.value,
    disabled: props.disabled,
  });
});

const mainButton = useTemplateRef("main-button");
const dropdownButton = useTemplateRef("dropdown-button") as MaybeRefOrGetter;
const dropdownButtonElement = computed(() => unrefElement(dropdownButton));
const dropdownMenuOpen = ref(false);

let timeout: ReturnType<typeof setTimeout> | undefined;
let hasLongPressed = false;

function handlePointerDown(e: PointerEvent) {
  if (props.disabled) return;
  if (props.items.length > 1) {
    timeout = setTimeout(() => {
      hasLongPressed = true;
      handleLongPress(e, hasLongPressed);
    }, 500);
  }
}

function handlePointerUp(e: PointerEvent) {
  if (props.disabled) return;
  handleLongPress(e, hasLongPressed);
  clearLongPress();
}

function clearLongPress() {
  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }
  hasLongPressed = false;
}

function handleLongPress(e: PointerEvent, isLongPress: boolean) {
  const isDropdownButtonClick = dropdownButtonElement.value && dropdownButtonElement.value.contains(e.target as Node);
  if ((e.button === 0 && (isLongPress || isDropdownButtonClick)) || e.button === 2) {
    if (props.items.length === 1) return;
    dropdownMenuOpen.value = true;
  } else model.value = currentOption.value.value;
}

function handleKeydown(e: KeyboardEvent) {
  if (props.disabled) return;
  if (e.code === "ArrowDown" || e.code === "ArrowUp") {
    if (props.items.length > 1) {
      e.preventDefault();
      dropdownMenuOpen.value = true;
    }
  } else if (e.code === "Enter" || e.code === "Space") {
    e.preventDefault();
    model.value = currentOption.value.value;
  }
}
</script>

<template>
  <div data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <Tooltip
      v-bind="tooltipOptions"
      :text="currentOption.label"
      :delay-duration="delayDuration"
      :disabled="props.disabled"
    >
      <button
        ref="main-button"
        data-testid="tool-selector-main-button"
        type="button"
        :disabled="props.disabled"
        :aria-haspopup="items.length > 1 ? 'menu' : undefined"
        :aria-expanded="items.length > 1 ? dropdownMenuOpen : undefined"
        data-slot="mainButton"
        :class="ui.mainButton({ class: props.ui?.mainButton })"
        :style="{ color: selected ? props.selectionColor : undefined }"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp"
        @keydown="handleKeydown"
        @contextmenu.prevent
      >
        <Icon
          :name="currentOption.icon"
          data-slot="mainButtonIcon"
          :class="ui.mainButtonIcon({ class: props.ui?.mainButtonIcon })"
        />
      </button>
    </Tooltip>

    <DropdownMenu
      v-model:open="dropdownMenuOpen"
      :items="dropdownItems"
      :size="size"
      :content="dropdownOptions"
      :reference="mainButton"
    >
      <button
        v-if="items.length > 1"
        ref="dropdown-button"
        data-testid="tool-selector-dropdown-button"
        type="button"
        :disabled="props.disabled"
        tabindex="-1"
        aria-hidden="true"
        data-slot="dropdownButton"
        :class="ui.dropdownButton({ class: props.ui?.dropdownButton })"
      >
        <Icon
          :name="icons.chevronDown"
          data-slot="dropdownButtonIcon"
          :class="ui.dropdownButtonIcon({ class: props.ui?.dropdownButtonIcon })"
        />
      </button>
    </DropdownMenu>
  </div>
</template>

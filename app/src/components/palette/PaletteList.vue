<template>
  <div class="flex flex-col">
    <div v-if="$slots.header" class="border-b border-default px-2 py-1">
      <slot name="header"></slot>
    </div>

    <RListboxRoot
      v-model="value as AcceptableValue"
      :disabled="disabled"
      :multiple="multiple"
      class="grow overflow-y-auto data-[disabled]:cursor-not-allowed"
    >
      <RListboxContent
        class="grid gap-1 overflow-hidden p-1 outline-none"
        :style="{
          gridTemplateColumns: `repeat(${options.length ? displaySettings.columnsNumber : 1}, minmax(0px, 1fr))`,
        }"
      >
        <template v-if="options.length">
          <RListboxItem
            v-for="(option, index) in options"
            :key="index"
            :value="optionValue(option) as AcceptableValue"
            @dblclick="handleOptionDoubleClick($event, option)"
          >
            <slot
              name="option"
              v-bind="{
                option,
                selected: optionIsSelected(option),
                displaySettings,
              }"
            >
              <PaletteListItem
                :palette-item="option"
                :selected="optionIsSelected(option)"
                :display-settings="displaySettings"
              />
            </slot>
          </RListboxItem>
        </template>
        <p v-else class="px-2">{{ $t("message-palette-empty") }}</p>
      </RListboxContent>
    </RListboxRoot>

    <div v-if="$slots.footer" class="border-t border-default px-2 py-1">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends BasePaletteItem, V">
  import { dequal } from "dequal/lite";
  import type { AcceptableValue } from "reka-ui";

  import { BasePaletteItem, PaletteSettings } from "~/core/pattern/";

  interface PaletteListProps<T> {
    options?: T[];
    optionValue?: (option: T) => unknown;
    disabled?: boolean;
    multiple?: boolean;
    displaySettings: PaletteSettings;
  }

  const value = defineModel<V>({ required: true });
  const {
    options = [],
    optionValue = (option) => option,
    disabled = false,
    multiple = false,
    displaySettings,
  } = defineProps<PaletteListProps<T>>();
  const emit = defineEmits<{
    "option-dblclick": [
      {
        /** Original event */
        originalEvent: Event;
        /** Triggered palitem */
        palitem: T;
        /** Index of the palitem in the options array */
        palindex: number;
      },
    ];
  }>();

  /**
   * Handle double-click event on an option.
   * @param originalEvent - The original event.
   * @param option - The option that was double-clicked.
   */
  function handleOptionDoubleClick(originalEvent: MouseEvent, option: T) {
    const palindex = options.indexOf(option);
    if (palindex !== -1) emit("option-dblclick", { originalEvent, palitem: option, palindex });
  }

  /**
   * Check if an option is selected.
   * @param option - The option to check.
   * @returns True if the option is selected, false otherwise.
   */
  function optionIsSelected(option: T) {
    const transformed = optionValue(option);
    if (multiple) return (value.value as V[]).find((option) => dequal(option, transformed)) !== undefined;
    return dequal(value, transformed);
  }
</script>

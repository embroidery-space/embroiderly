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
      <div v-if="$slots.filter" class="border-b border-default px-2 py-1">
        <RListboxFilter as-child>
          <slot name="filter"></slot>
        </RListboxFilter>
      </div>

      <RListboxContent
        ref="content"
        class="grid gap-1 overflow-hidden p-1 outline-none"
        :style="{
          gridTemplateColumns: `repeat(${options.length ? displaySettings.columnsNumber : 1}, minmax(0px, 1fr))`,
        }"
      >
        <template v-if="options.length">
          <RListboxItem
            v-for="(option, index) in options"
            :key="optionKey?.(option) ?? index"
            :value="optionValue?.(option) ?? option"
            as-child
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
  import { useSortable } from "@vueuse/integrations/useSortable";
  import { dequal } from "dequal/lite";
  import type { AcceptableValue } from "reka-ui";
  import { watchEffect, useTemplateRef } from "vue";

  import { BasePaletteItem, PaletteSettings } from "~/core/pattern/";

  interface PaletteListProps<T> {
    options?: T[];
    optionValue?: (option: T) => V;
    optionKey?: (option: T) => PropertyKey;
    disabled?: boolean;
    multiple?: boolean;
    draggable?: boolean;
    displaySettings: PaletteSettings;
  }

  const value = defineModel<V | V[]>({ required: true });
  const {
    options = [],
    optionValue = undefined,
    optionKey = undefined,
    disabled = false,
    multiple = false,
    draggable = false,
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
    reorder: [{ oldPosition: number; newPosition: number }];
  }>();

  const content = useTemplateRef("content");
  const { option: setSortableOption } = useSortable(content, options, {
    animation: 100,
    forceFallback: true,
    onUpdate: ({ oldIndex, newIndex }) => {
      if (oldIndex !== undefined && newIndex !== undefined) {
        emit("reorder", { oldPosition: oldIndex, newPosition: newIndex });
      }
    },
  });
  watchEffect(() => {
    setSortableOption("disabled", !draggable || disabled);
  });

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
    const transformed = optionValue?.(option) ?? option;
    if (multiple) return (value.value as V[]).find((option) => dequal(option, transformed)) !== undefined;
    return dequal(value.value, transformed);
  }
</script>

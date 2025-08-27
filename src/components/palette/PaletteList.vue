<template>
  <div class="flex flex-col">
    <div v-if="$slots.header" class="border-b border-default px-2 py-1">
      <slot name="header"></slot>
    </div>
    <Listbox
      :model-value="modelValue"
      :options="options"
      :option-value="optionValue"
      :disabled="disabled"
      :multiple="multiple"
      :meta-key-selection="metaKeySelection"
      :empty-message="$t('message-palette-empty')"
      scroll-height="100%"
      pt:root:class="grow overflow-y-auto data-[p=disabled]:cursor-not-allowed"
      pt:list:class="grid gap-1 p-1 overflow-hidden outline-none"
      :pt:list:style="{
        gridTemplateColumns: `repeat(${options.length ? displaySettings.columnsNumber : 1}, minmax(0px, 1fr))`,
      }"
      pt:option:class="rounded-md ring-neutral data-[p-focused=true]:ring-2"
      pt:empty-message:class="px-2"
      @update:model-value="(v) => emit('update:modelValue', v)"
      @option-dblclick="handleOptionDoubleClick"
    >
      <template #option="{ option, selected }">
        <slot name="option" v-bind="{ option, selected, displaySettings }">
          <PaletteListItem :palette-item="option" :selected="selected" :display-settings="displaySettings" />
        </slot>
      </template>
    </Listbox>
    <div v-if="$slots.footer" class="border-t border-default px-2 py-1">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T, V">
  import Listbox, { type ListboxOptionDblClickEvent } from "primevue/listbox";
  import type { PaletteSettings } from "#/core/pattern/";

  interface PaletteListProps<T, V> {
    modelValue: V;
    options?: T[];
    optionValue?: (option: T) => unknown;
    disabled?: boolean;
    multiple?: boolean;
    metaKeySelection?: boolean;
    displaySettings: PaletteSettings;
  }

  const {
    modelValue,
    options = [],
    optionValue = undefined,
    disabled = false,
    multiple = false,
    metaKeySelection = true,
    displaySettings,
  } = defineProps<PaletteListProps<T, V>>();
  const emit = defineEmits<{
    "update:modelValue": [V];
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

  function handleOptionDoubleClick({ originalEvent, value: palitem }: ListboxOptionDblClickEvent) {
    const palindex = options.indexOf(palitem);
    if (palindex !== -1) emit("option-dblclick", { originalEvent, palitem, palindex });
  }
</script>

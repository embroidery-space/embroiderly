<template>
  <Listbox
    unstyled
    :model-value="modelValue"
    :options="options"
    :option-value="optionValue"
    :disabled="disabled"
    :multiple="multiple"
    :meta-key-selection="metaKeySelection"
    :empty-message="$t('message-palette-empty')"
    scroll-height="100%"
    pt:root:class="flex flex-col overflow-y-auto"
    pt:list-container:class="grow"
    pt:list:class="grid gap-1 p-1 overflow-hidden outline-none"
    :pt:list:style="{
      gridTemplateColumns: `repeat(${options.length ? displaySettings.columnsNumber : 1}, minmax(0px, 1fr))`,
    }"
    pt:option:class="rounded-md ring-neutral data-[p-focused=true]:ring-2"
    @update:model-value="(v) => emit('update:modelValue', v)"
    @option-dblclick="handleOptionDoubleClick"
  >
    <template v-if="$slots.header" #header>
      <div class="px-2 py-1 border-b border-default">
        <slot name="header"></slot>
      </div>
    </template>

    <template #option="{ option, selected }">
      <slot name="option" v-bind="{ option, selected, displaySettings }">
        <PaletteListItem :palette-item="option" :selected="selected" :display-settings="displaySettings" />
      </slot>
    </template>

    <template v-if="$slots.footer" #footer>
      <div class="px-2 py-1 border-t border-default">
        <slot name="footer"></slot>
      </div>
    </template>
  </Listbox>
</template>

<script setup lang="ts" generic="T, V">
  import Listbox, { type ListboxOptionDblClickEvent } from "primevue/listbox";
  import type { PaletteSettings } from "#/schemas/";

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

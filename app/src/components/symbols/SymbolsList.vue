<script setup lang="ts">
import { Listbox } from "@embroiderly/ui";
import type { ListboxProps } from "@embroiderly/ui";

import SymbolsListItem from "./SymbolsListItem.vue";

interface SymbolsListProps extends Pick<ListboxProps, "disabled" | "scroll"> {
  assignedSymbols: number[];
  options?: number[];
  fontFamily?: string;
}

const selectedSymbol = defineModel<number>("selectedSymbol");
const { assignedSymbols, options = [], fontFamily = "" } = defineProps<SymbolsListProps>();

const emit = defineEmits<{
  "option-dblclick": [
    {
      /** Original event */
      originalEvent: Event;
      /** Code point of the symbol */
      codePoint: number;
    },
  ];
}>();
</script>

<template>
  <div class="flex min-h-0 grow flex-col">
    <div v-if="$slots.header" class="border-b border-default px-2 py-1">
      <slot name="header"></slot>
    </div>

    <Listbox
      v-model="selectedSymbol"
      :items="options"
      :disabled="disabled"
      selection-behavior="replace"
      :scroll="scroll"
      :empty-message="$t('stitch-symbols-empty')"
      class="grow"
      :ui="{
        root: 'overflow-hidden rounded-none ring-0',
        scroll: 'min-h-0 flex-1',
        content: 'min-h-full',
        group: 'grid grid-cols-8 gap-1 p-1',
        item: 'rounded-none p-0 data-highlighted:bg-transparent',
      }"
      @highlight="selectedSymbol = $event?.value as number | undefined"
      @option-contextmenu="({ item }) => (selectedSymbol = item as number)"
      @option-dblclick="
        ({ originalEvent, item }) => emit('option-dblclick', { originalEvent, codePoint: item as number })
      "
    >
      <template #option="{ item }">
        <slot
          name="option"
          v-bind="{
            option: item.value,
            fontFamily,
            assigned: assignedSymbols.includes(item.value),
            selected: selectedSymbol === item.value,
          }"
        >
          <SymbolsListItem
            :symbol="String.fromCodePoint(item.value)"
            :font-family="fontFamily"
            :assigned="assignedSymbols.includes(item.value)"
            :selected="selectedSymbol === item.value"
          />
        </slot>
      </template>
    </Listbox>

    <div v-if="$slots.footer" class="border-t border-default px-2 py-1">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

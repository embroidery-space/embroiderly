<script setup lang="ts">
import { Listbox } from "@embroiderly/ui";
import type { ListboxProps } from "@embroiderly/ui";

import SymbolsListItem from "./SymbolsListItem.vue";

interface SymbolsListProps extends Pick<ListboxProps, "disabled"> {
  assignedSymbols: number[];
  options?: number[];
  fontFamily?: string;
}

const selectedSymbol = defineModel<number | undefined>("selectedSymbol", { default: undefined });
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
  <div :class="$style.root">
    <div v-if="$slots.header" :class="$style.header">
      <slot name="header"></slot>
    </div>

    <Listbox
      v-model="selectedSymbol"
      :items="options"
      :disabled="disabled"
      selection-behavior="replace"
      :empty-message="$t('stitch-symbols-empty')"
      :class="$style.listbox"
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

    <div v-if="$slots.footer" :class="$style.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style module>
.root {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
}

.header {
  padding: calc(var(--spacing) * 1);
  border-bottom: 1px solid var(--border-color-default);
}

.listbox[data-slot="root"] {
  flex-grow: 1;
  border-radius: 0;
  box-shadow: none;

  [data-slot="group"] {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: calc(var(--spacing) * 1);
    padding: calc(var(--spacing) * 1);
  }

  [data-slot="group"] > [data-slot="item"] {
    padding: 0;
    border-radius: 0;

    &[data-highlighted] {
      background-color: transparent;
    }
  }
}

.footer {
  padding-block: calc(var(--spacing) * 1);
  padding-inline: calc(var(--spacing) * 2);
  border-top: 1px solid var(--border-color-default);
}
</style>

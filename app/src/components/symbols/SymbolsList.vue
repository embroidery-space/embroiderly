<template>
  <div class="flex flex-col">
    <div v-if="$slots.header" class="border-b border-default px-2 py-1">
      <slot name="header"></slot>
    </div>

    <RListboxRoot
      v-model="selectedSymbol"
      :disabled="disabled"
      selection-behavior="replace"
      class="flex grow flex-col overflow-hidden data-disabled:cursor-not-allowed"
      @highlight="selectedSymbol = $event?.value as number"
    >
      <RListboxContent
        class="grid gap-1 overflow-y-auto p-1 outline-none"
        :style="{
          gridTemplateColumns: `repeat(${options.length ? 8 : 1}, minmax(0px, 1fr))`,
        }"
      >
        <template v-if="options.length">
          <RListboxItem
            v-for="option in options"
            :key="option"
            :value="option"
            as-child
            @dblclick="emit('option-dblclick', { originalEvent: $event, codePoint: option })"
            @contextmenu="selectedSymbol = option"
          >
            <slot
              name="option"
              v-bind="{
                option,
                fontFamily,
                assigned: assignedSymbols.includes(option),
                selected: selectedSymbol === option,
              }"
            >
              <SymbolsListItem
                :symbol="String.fromCodePoint(option)"
                :font-family="fontFamily"
                :assigned="assignedSymbols.includes(option)"
                :selected="selectedSymbol === option"
              />
            </slot>
          </RListboxItem>
        </template>
        <p v-else class="px-2">{{ $t("message-stitch-symbols-empty") }}</p>
      </RListboxContent>
    </RListboxRoot>

    <div v-if="$slots.footer" class="border-t border-default px-2 py-1">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface SymbolsListProps {
    assignedSymbols: number[];
    options?: number[];
    fontFamily?: string;
    disabled?: boolean;
  }

  const selectedSymbol = defineModel<number>("selectedSymbol");
  const { assignedSymbols, options = [], fontFamily = "", disabled = false } = defineProps<SymbolsListProps>();

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

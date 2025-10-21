<template>
  <div class="flex flex-col">
    <div v-if="$slots.header" class="border-b border-default px-2 py-1">
      <slot name="header"></slot>
    </div>

    <RListboxRoot
      :model-value="value"
      :disabled="disabled"
      multiple
      class="flex grow flex-col overflow-hidden data-disabled:cursor-not-allowed"
    >
      <RListboxContent
        class="grid gap-1 overflow-y-auto p-1 outline-none"
        :style="{
          gridTemplateColumns: `repeat(${options.length ? 8 : 1}, minmax(0px, 1fr))`,
        }"
      >
        <template v-if="options.length">
          <RListboxItem v-for="option in options" :key="option" :value="option" as-child>
            <slot name="option" v-bind="{ option, fontFamily }">
              <SymbolsListItem
                :symbol="String.fromCodePoint(option)"
                :font-family="fontFamily"
                :selected="value.includes(option)"
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
    options?: number[];
    fontFamily?: string;
    disabled?: boolean;
  }

  const value = defineModel<number[]>({ required: true });
  const { options = [], fontFamily = "", disabled = false } = defineProps<SymbolsListProps>();
</script>

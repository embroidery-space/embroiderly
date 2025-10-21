<template>
  <div
    class="relative flex size-8 items-center justify-center rounded-md bg-white text-center outline-2 -outline-offset-4 outline-transparent outline-solid data-highlighted:outline-black"
  >
    <UIcon v-if="selected" name="i-lucide:check" class="absolute top-0.5 left-0.5 size-2.5 text-black" />
    <span :style="{ fontFamily: fontFamily, color: selected ? 'var(--color-help-700)' : 'black' }">{{ symbol }}</span>
  </div>
</template>

<script setup lang="ts">
  interface SymbolsListItemProps {
    symbol: string;
    fontFamily: string;
    selected: boolean;
  }

  const { symbol, fontFamily, selected } = defineProps<SymbolsListItemProps>();
</script>

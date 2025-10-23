<template>
  <div
    class="relative flex size-8 items-center justify-center rounded-sm bg-white text-center outline-2 -outline-offset-4 outline-solid"
    :class="{
      'outline-black': selected,
      'outline-transparent': !selected,
    }"
  >
    <UIcon v-if="assigned" name="i-lucide:check" class="absolute top-0.5 left-0.5 size-2.5 text-black" />
    <span :style="{ fontFamily: fontFamily, color: assigned ? 'var(--color-help-700)' : 'black' }">{{ symbol }}</span>
  </div>
</template>

<script setup lang="ts">
  interface SymbolsListItemProps {
    symbol: string;
    fontFamily: string;
    assigned: boolean;
    selected: boolean;
  }

  const { symbol, fontFamily, assigned, selected } = defineProps<SymbolsListItemProps>();
</script>

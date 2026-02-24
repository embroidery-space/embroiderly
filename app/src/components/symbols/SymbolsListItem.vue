<script setup lang="ts">
interface SymbolsListItemProps {
  symbol: string;
  fontFamily: string;
  assigned: boolean;
  selected: boolean;
}

const { symbol, fontFamily, assigned, selected } = defineProps<SymbolsListItemProps>();
</script>

<template>
  <div
    class="relative flex size-8 items-center justify-center rounded-sm bg-white text-center outline-2 -outline-offset-4 outline-solid"
    :class="{
      'outline-black': selected,
      'outline-transparent': !selected,
    }"
  >
    <span
      v-if="assigned"
      class="absolute top-0.5 right-0.5 size-2 rounded-xs bg-black"
      style="clip-path: polygon(0 0, 100% 0, 100% 100%)"
    ></span>
    <span :style="{ fontFamily: fontFamily, color: assigned ? 'var(--color-help-700)' : 'black' }">{{ symbol }}</span>
  </div>
</template>

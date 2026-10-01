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
  <div :class="[$style.root, { [$style.selected]: selected }]">
    <span v-if="assigned" :class="$style.assigned" style="clip-path: polygon(0 0, 100% 0, 100% 100%)"></span>
    <span :style="{ fontFamily: fontFamily, color: assigned ? 'var(--color-help-700)' : 'black' }">{{ symbol }}</span>
  </div>
</template>

<style module>
.root {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  border-radius: var(--radius-sm);

  text-align: center;

  background-color: var(--color-white);
  outline: 2px solid transparent;
  outline-offset: -4px;

  &.selected {
    outline-color: var(--color-black);
  }
}

.assigned {
  position: absolute;
  top: calc(var(--spacing) * 0.5);
  right: calc(var(--spacing) * 0.5);

  width: calc(var(--spacing) * 2);
  height: calc(var(--spacing) * 2);
  border-radius: var(--radius-xs);

  background-color: var(--color-black);
}
</style>

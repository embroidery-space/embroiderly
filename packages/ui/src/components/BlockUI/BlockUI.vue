<script lang="ts" setup>
export interface BlockUIProps {
  /** Whether the UI is blocked. */
  blocked?: boolean;
}

export interface BlockUISlots {
  default(): any;
}

defineProps<BlockUIProps>();
defineSlots<BlockUISlots>();
</script>

<template>
  <div :aria-busy="blocked" data-slot="base" :class="$style.base">
    <slot />
    <div v-if="blocked" data-slot="mask" :class="$style.mask" />
  </div>
</template>

<style module>
.base {
  position: relative;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  background-color: color-mix(in oklab, var(--color-black) 50%, transparent);
}
</style>

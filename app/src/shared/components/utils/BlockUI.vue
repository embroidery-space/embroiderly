<template>
  <div :aria-busy="blocked" class="relative">
    <div v-if="blocked" class="absolute top-0 left-0 size-full bg-black/50"></div>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
  interface BlockUIProps {
    /** Whether the UI is blocked. */
    blocked?: boolean;
  }

  defineProps<BlockUIProps>();
</script>

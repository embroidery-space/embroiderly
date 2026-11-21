<script setup lang="ts">
export interface IconProps {
  name: string;
}

defineProps<IconProps>();
</script>

<template>
  <svg :class="$style.icon">
    <use :href="`icons.svg#${name}`" />
  </svg>
</template>

<style module>
.icon {
  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
}
</style>

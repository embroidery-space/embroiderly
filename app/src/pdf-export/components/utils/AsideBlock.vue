<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.header">
      <span>{{ title }}</span>
    </div>

    <div :class="$style.body">
      <slot />
    </div>
  </div>
</template>

<style module>
.root {
  display: flex;
  flex-direction: column;
}

.header {
  height: 3rem;
  padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 2);
  border-bottom: 1px solid var(--border-color-default);
}

.body {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);

  padding: calc(var(--spacing) * 2);
}
</style>

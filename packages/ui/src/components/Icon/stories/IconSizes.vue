<script setup lang="ts">
import Icon from "../Icon.vue";
</script>

<template>
  <div id="icon-sizes">
    <Icon name="lucide:rocket" class="icon-4" />
    <Icon name="lucide:rocket" class="icon-6" />
    <Icon name="lucide:rocket" class="icon-8" />
    <Icon name="lucide:rocket" class="icon-12" />
    <Icon name="lucide:rocket" class="icon-16" />
  </div>
</template>

<style>
#icon-sizes {
  display: flex;
  gap: calc(var(--spacing) * 4);
  align-items: flex-end;

  .icon-4 {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .icon-6 {
    width: calc(var(--spacing) * 6);
    height: calc(var(--spacing) * 6);
  }

  .icon-8 {
    width: calc(var(--spacing) * 8);
    height: calc(var(--spacing) * 8);
  }

  .icon-12 {
    width: calc(var(--spacing) * 12);
    height: calc(var(--spacing) * 12);
  }

  .icon-16 {
    width: calc(var(--spacing) * 16);
    height: calc(var(--spacing) * 16);
  }
}
</style>

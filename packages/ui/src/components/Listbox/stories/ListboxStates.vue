<script setup lang="ts">
import Listbox from "../Listbox.vue";
import type { ListboxItem } from "../Listbox.vue";

defineProps<{ items: ListboxItem[] }>();
</script>

<template>
  <div id="listbox-states">
    <Listbox :items="items" />
    <Listbox :items="items" disabled />
    <Listbox :items="[]" />
  </div>
</template>

<style>
#listbox-states {
  display: flex;
  gap: calc(var(--spacing) * 4);

  & > [data-slot="root"] {
    width: calc(var(--spacing) * 40);
  }
}
</style>

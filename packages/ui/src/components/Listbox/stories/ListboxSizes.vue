<script setup lang="ts">
import Listbox from "../Listbox.vue";
import type { ListboxItem } from "../Listbox.vue";

defineProps<{ items: ListboxItem[] }>();

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div id="listbox-sizes">
    <Listbox v-for="size in sizes" :key="size" :items="items" :size="size" />
  </div>
</template>

<style>
#listbox-sizes {
  display: flex;
  gap: calc(var(--spacing) * 4);

  & > [data-slot="root"] {
    width: calc(var(--spacing) * 40);
  }
}
</style>

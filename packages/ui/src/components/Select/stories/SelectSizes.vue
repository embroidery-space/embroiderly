<script setup lang="ts">
import Select from "../Select.vue";
import type { SelectItem } from "../Select.vue";

defineProps<{ items: SelectItem[] }>();

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div id="select-sizes">
    <template v-for="size in sizes" :key="size">
      <Select :items="items" :size="size" :model-value="'todo'" />
    </template>
  </div>
</template>

<style>
#select-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);

  & > [data-slot="root"] {
    width: calc(var(--spacing) * 40);
  }
}
</style>

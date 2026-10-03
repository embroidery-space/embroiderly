<script setup lang="ts">
import Select from "../Select.vue";
import type { SelectItem } from "../Select.vue";

defineProps<{ items: SelectItem[] }>();

const variants = ["subtle", "outline"] as const;
</script>

<template>
  <div id="select-variants">
    <template v-for="variant in variants" :key="variant">
      <Select :items="items" :variant="variant" :model-value="'todo'" />
    </template>
  </div>
</template>

<style>
#select-variants {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);

  & > [data-slot="root"] {
    width: calc(var(--spacing) * 40);
  }
}
</style>

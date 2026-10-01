<script setup lang="ts">
import Select from "../Select.vue";
import type { SelectItem } from "../Select.vue";

defineProps<{ items: SelectItem[] }>();
</script>

<template>
  <div id="select-states">
    <Select :items="items" placeholder="Default" />
    <Select :items="items" placeholder="Loading" loading />
    <Select :items="items" placeholder="Disabled" disabled />
  </div>
</template>

<style>
#select-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);

  & > [data-slot="root"] {
    width: calc(var(--spacing) * 40);
  }
}
</style>

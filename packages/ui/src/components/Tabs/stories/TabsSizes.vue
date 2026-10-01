<script setup lang="ts">
import Tabs from "../Tabs.vue";
import type { TabsItem } from "../Tabs.vue";

defineProps<{ items: TabsItem[] }>();

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div id="tabs-sizes">
    <Tabs v-for="size in sizes" :key="size" :items="items" :size="size" />
  </div>
</template>

<style>
#tabs-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
}
</style>

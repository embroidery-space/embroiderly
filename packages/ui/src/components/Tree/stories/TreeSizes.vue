<script setup lang="ts">
import Tree from "../Tree.vue";
import type { TreeItem } from "../Tree.vue";

defineProps<{ items: TreeItem[] }>();

const sizes = ["sm", "md", "lg"] as const;
</script>

<template>
  <div id="tree-sizes">
    <Tree v-for="size in sizes" :key="size" :items="items" :size="size" />
  </div>
</template>

<style>
#tree-sizes {
  display: flex;
  gap: calc(var(--spacing) * 4);
}
</style>

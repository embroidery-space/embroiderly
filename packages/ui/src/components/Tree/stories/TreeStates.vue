<script setup lang="ts">
import Tree from "../Tree.vue";
import type { TreeItem } from "../Tree.vue";

defineProps<{ items: TreeItem[] }>();
</script>

<template>
  <div id="tree-states">
    <Tree :items="items" />
    <Tree :items="items" disabled />
  </div>
</template>

<style>
#tree-states {
  display: flex;
  gap: calc(var(--spacing) * 4);
}
</style>

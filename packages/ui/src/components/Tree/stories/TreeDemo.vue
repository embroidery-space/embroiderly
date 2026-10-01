<script setup lang="ts">
import Tree from "../Tree.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Tree v-bind="$attrs" />
</template>

<script setup lang="ts">
import ContextMenu from "../ContextMenu.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <ContextMenu v-bind="$attrs">
    <Placeholder class="context-menu-demo-placeholder">Right-click here</Placeholder>
  </ContextMenu>
</template>

<style>
.context-menu-demo-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: calc(var(--spacing) * 48);
  height: calc(var(--spacing) * 48);
}
</style>

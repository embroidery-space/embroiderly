<script setup lang="ts">
import ContextMenu from "../ContextMenu.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div id="context-menu-open">
    <ContextMenu v-bind="$attrs">
      <Placeholder class="context-menu-open-placeholder">Right-click here</Placeholder>
    </ContextMenu>
  </div>
</template>

<style>
#context-menu-open {
  min-width: calc(var(--spacing) * 96);
  min-height: calc(var(--spacing) * 96);
}

.context-menu-open-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: calc(var(--spacing) * 48);
  height: calc(var(--spacing) * 48);
}
</style>

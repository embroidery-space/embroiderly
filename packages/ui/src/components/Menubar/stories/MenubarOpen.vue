<script setup lang="ts">
import Menubar from "../Menubar.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div id="menubar-open">
    <Menubar v-bind="$attrs" />
  </div>
</template>

<style>
#menubar-open {
  min-width: var(--container-xs);
  min-height: calc(var(--spacing) * 56);
}
</style>

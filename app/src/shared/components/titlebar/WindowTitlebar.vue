<script setup lang="ts">
import WindowControls from "./WindowControls.vue";
import WindowMenu from "./WindowMenu.vue";
import type { WindowMenuItem } from "./WindowMenu.vue";

interface Props {
  /** Array of root menu items */
  items: WindowMenuItem[];
}

defineProps<Props>();
</script>

<template>
  <div class="flex border-b border-default">
    <div data-tauri-drag-region class="flex grow items-center gap-x-2 px-2">
      <slot name="start" />
      <WindowMenu :items="items" />
      <slot name="end" />
    </div>

    <WindowControls />
  </div>
</template>

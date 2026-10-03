<script setup lang="ts">
import { parseShortcutDisplay } from "../../../utils/shortcut.ts";
import Kbd from "../Kbd.vue";
import type { KbdProps } from "../Kbd.vue";

defineProps<KbdProps>();
</script>

<template>
  <div id="kbd-demo">
    <Kbd v-for="(key, i) in parseShortcutDisplay(value ?? '')" :key="i" :size="size" :value="key" />
  </div>
</template>

<style>
#kbd-demo {
  display: flex;
  gap: calc(var(--spacing) * 1);
  align-items: center;
}
</style>

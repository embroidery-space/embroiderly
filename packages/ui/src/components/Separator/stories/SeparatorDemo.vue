<script setup lang="ts">
import Separator from "../Separator.vue";
import type { SeparatorProps } from "../Separator.vue";

defineProps<SeparatorProps>();
</script>

<template>
  <div id="separator-demo">
    <Separator :orientation="orientation" :size="size" :decorative="decorative" />
  </div>
</template>

<style>
#separator-demo {
  width: calc(var(--spacing) * 96);
  height: calc(var(--spacing) * 96);
}
</style>

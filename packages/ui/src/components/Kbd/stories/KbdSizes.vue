<script setup lang="ts">
import Kbd from "../Kbd.vue";
import type { KbdProps } from "../Kbd.vue";

const sizes: NonNullable<KbdProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="kbd-sizes">
    <Kbd v-for="size in sizes" :key="size" :value="size.toUpperCase()" :size="size" />
  </div>
</template>

<style>
#kbd-sizes {
  display: flex;
  gap: calc(var(--spacing) * 1);
  align-items: center;
}
</style>

<script setup lang="ts">
import { Icon as IconifyIcon } from "@iconify/vue";
import type { Component } from "vue";

export interface IconProps {
  /** The icon name from Iconify (e.g., "lucide:settings") or a Vue component. */
  name: string | Component;
}

defineProps<IconProps>();
</script>

<template>
  <IconifyIcon v-if="typeof name === 'string'" :icon="name" mode="svg" />
  <component :is="name" v-else />
</template>

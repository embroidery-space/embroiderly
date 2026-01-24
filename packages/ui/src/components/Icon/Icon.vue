<script setup lang="ts">
  import { Icon as IconifyIcon } from "@iconify/vue";

  export interface IconProps {
    /** The icon name from Iconify (e.g., "lucide:settings"). */
    name: string;
  }

  defineProps<IconProps>();
</script>

<template>
  <IconifyIcon :icon="name" />
</template>

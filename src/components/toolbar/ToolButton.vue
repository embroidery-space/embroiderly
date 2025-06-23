<template>
  <NuxtTooltip arrow :text="label" :kbds="kbds" :delay-duration="200" :disabled="disabled" :content="{ side: 'left' }">
    <NuxtButton color="neutral" variant="ghost" :disabled="disabled" class="p-1.5" @click="onClick">
      <NuxtIcon v-if="typeof icon === 'string'" :name="icon" />
      <div v-else class="size-6">
        <component :is="icon"></component></div
    ></NuxtButton>
  </NuxtTooltip>
</template>

<script lang="ts" setup>
  import type { KbdProps } from "@nuxt/ui";

  const props = defineProps<{
    label: string;
    icon: unknown;
    kbds?: KbdProps["value"][];
    disabled?: boolean;
    onClick: () => void; // We use the `onClick` prop to automatically bind a shortcut based on the `kbds` prop.
  }>();

  if (props.kbds) {
    defineShortcuts(extractShortcuts([props]));
  }
</script>

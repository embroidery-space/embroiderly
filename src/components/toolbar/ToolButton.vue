<template>
  <NuxtTooltip arrow :text="label" :kbds="kbds" :delay-duration="200" :disabled="disabled" :content="{ side: 'left' }">
    <NuxtButton
      color="neutral"
      variant="ghost"
      :icon="icon"
      :disabled="disabled"
      class="p-1.5"
      :ui="{ leadingIcon: 'size-5' }"
      @click="onClick"
    />
  </NuxtTooltip>
</template>

<script lang="ts" setup>
  import type { KbdProps } from "@nuxt/ui";

  const props = defineProps<{
    label: string;
    icon: string;
    kbds?: KbdProps["value"][];
    disabled?: boolean;
    onClick: () => void; // We use the `onClick` prop to automatically bind a shortcut based on the `kbds` prop.
  }>();

  if (props.kbds) {
    defineShortcuts(extractShortcuts([props]));
  }
</script>

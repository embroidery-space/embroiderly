<template>
  <UTooltip
    :arrow="tooltipArrow"
    :text="label"
    :kbds="kbds"
    :delay-duration="200"
    :disabled="disabled"
    :content="{ side: tooltipSide }"
  >
    <UButton
      v-bind="$attrs"
      color="neutral"
      variant="ghost"
      :icon="icon"
      :disabled="disabled"
      class="p-1.5"
      :ui="{ leadingIcon: 'size-5' }"
      @click="onClick"
    />
  </UTooltip>
</template>

<script lang="ts" setup>
  import { useShortcuts, extractShortcuts } from "@embroiderly/shortcuts";

  import type { KbdProps } from "@nuxt/ui";

  interface ToolButtonProps {
    label: string;
    icon: string;

    disabled?: boolean;

    kbds?: KbdProps["value"][];
    onClick: () => void; // We use the `onClick` prop to automatically bind a shortcut based on the `kbds` prop.

    tooltipArrow?: boolean;
    tooltipSide?: "top" | "right" | "bottom" | "left";
  }

  defineOptions({
    inheritAttrs: false,
  });

  const {
    label,
    icon,
    disabled = false,
    kbds = [],
    onClick,
    tooltipArrow = true,
    tooltipSide = "left",
  } = defineProps<ToolButtonProps>();

  useShortcuts(extractShortcuts([{ kbds, onClick }]));
</script>

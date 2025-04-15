<template>
  <div
    v-tooltip="{ value: paletteItemTitle(paletteItem), showDelay: 200, pt: { root: { class: 'max-w-fit' } } }"
    class="h-8 w-full px-2 py-1"
    :style="{
      backgroundColor,
      color: `${foregroundColor} !important`,
      boxShadow: selected ? `inset 0 0 0 2px ${backgroundColor}, inset 0 0 0 4px ${foregroundColor}` : '',
    }"
  >
    <p v-show="!displaySettings.colorOnly" class="overflow-hidden text-ellipsis whitespace-nowrap">
      {{ paletteItemTitle(paletteItem, displaySettings) }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { Color } from "pixi.js";
  import { contrastColor } from "#/utils/color";
  import { paletteItemTitle } from "#/utils/paletteItem";
  import type { PaletteItem, PaletteSettings } from "#/schemas/index.ts";

  interface PaletteItemProps {
    paletteItem: PaletteItem & { color: Color | string };
    displaySettings: PaletteSettings;
    selected: boolean;
  }

  const { paletteItem, displaySettings, selected } = defineProps<PaletteItemProps>();

  const palitemColor = computed(() => new Color(paletteItem.color));
  const backgroundColor = computed(() => palitemColor.value.toHex());
  const foregroundColor = computed(() => contrastColor(palitemColor.value));
</script>

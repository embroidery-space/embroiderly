<template>
  <div
    v-tooltip="{ value: paletteItemTitle(paletteItem), showDelay: 200, pt: { root: { class: 'max-w-fit' } } }"
    class="h-8 w-full px-2 py-1"
    :style="{
      backgroundColor: paletteItem.hex,
      color: `${paletteItem.contrastColor} !important`,
      boxShadow: selected ? `inset 0 0 0 2px ${paletteItem.hex}, inset 0 0 0 4px ${paletteItem.contrastColor}` : '',
    }"
  >
    <p v-show="!displaySettings.colorOnly" class="overflow-hidden text-ellipsis whitespace-nowrap">
      {{ paletteItemTitle(paletteItem, displaySettings) }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { paletteItemTitle } from "#/utils/paletteItem";
  import type { PaletteItem, PaletteSettings } from "#/schemas/index.ts";

  interface PaletteItemProps {
    paletteItem: PaletteItem;
    displaySettings: PaletteSettings;
    selected: boolean;
  }

  const { paletteItem, displaySettings, selected } = defineProps<PaletteItemProps>();
</script>

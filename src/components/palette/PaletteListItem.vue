<template>
  <NuxtTooltip
    arrow
    :text="paletteItem.getTitle()"
    :delay-duration="200"
    :content="{ side: 'left' }"
    :ui="{ content: 'text-base' }"
  >
    <div
      class="min-h-8 px-2 py-1 rounded-md"
      :class="{ [`palette-list-item-shadow-${paletteItem.contrastColor}`]: selected }"
      :style="{
        backgroundColor: paletteItem.hex,
        color: `${paletteItem.contrastColor} !important`,
      }"
    >
      <p v-show="!displaySettings.colorOnly" class="truncate">
        {{ paletteItem.getTitle(displaySettings) }}
      </p>
    </div>
  </NuxtTooltip>
</template>

<script setup lang="ts">
  import type { PaletteItem, PaletteSettings } from "#/schemas/";

  interface PaletteItemProps {
    paletteItem: PaletteItem;
    selected: boolean;
    displaySettings: PaletteSettings;
  }

  const { paletteItem, selected, displaySettings } = defineProps<PaletteItemProps>();
</script>

<style scoped>
  .palette-list-item-shadow-white {
    outline: 2px solid white;
    outline-offset: -4px;
  }

  .palette-list-item-shadow-black {
    outline: 2px solid black;
    outline-offset: -4px;
  }
</style>

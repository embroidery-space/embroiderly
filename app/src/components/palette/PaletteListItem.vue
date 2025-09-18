<template>
  <UTooltip
    arrow
    :text="paletteItem.getTitle()"
    :delay-duration="200"
    :content="{ side: 'left' }"
    :ui="{ content: 'text-base' }"
  >
    <div
      class="min-h-8 rounded-md px-2 py-1 outline-2 -outline-offset-4 outline-solid"
      :style="{
        backgroundColor: paletteItem.hex,
        color: `${paletteItem.contrastColor} !important`,
        outlineColor: selected ? paletteItem.contrastColor : 'transparent',
      }"
    >
      <p v-show="!displaySettings.colorOnly" class="truncate">
        {{ paletteItem.getTitle(displaySettings) }}
      </p>
    </div>
  </UTooltip>
</template>

<script setup lang="ts">
  import type { BasePaletteItem, PaletteSettings } from "~/core/pattern/";

  interface PaletteItemProps {
    paletteItem: BasePaletteItem;
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

<script setup lang="ts">
import { Tooltip } from "@embroiderly/ui";

import type { BasePaletteItem, PaletteSettings } from "~/lib/pattern/";

interface PaletteItemProps {
  paletteItem: BasePaletteItem;
  selected: boolean;
  displaySettings: PaletteSettings;
}

const { paletteItem, selected, displaySettings } = defineProps<PaletteItemProps>();
</script>

<template>
  <Tooltip :text="paletteItem.getTitle()" :delay-duration="200" side="left" :ui="{ content: 'text-base' }">
    <div
      class="flex min-h-8 items-center rounded-md px-2 py-1 outline-2 -outline-offset-4 outline-solid data-highlighted:ring-2 data-highlighted:ring-primary"
      :style="{
        backgroundColor: paletteItem.hex,
        color: `${paletteItem.contrastColor} !important`,
        outlineColor: selected ? paletteItem.contrastColor : 'transparent',
      }"
    >
      <slot />
      <span v-show="!displaySettings.colorOnly" class="truncate">
        {{ paletteItem.getTitle(displaySettings) }}
      </span>
    </div>
  </Tooltip>
</template>

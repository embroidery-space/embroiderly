<script setup lang="ts">
import { Tooltip } from "@embroiderly/ui";

import type { BasePaletteItem, PaletteSettings } from "~/lib/pattern/";

interface PaletteItemProps {
  paletteItem: BasePaletteItem;
  selected: boolean;
  displaySettings: PaletteSettings;
}

defineOptions({ inheritAttrs: false });

const { paletteItem, selected, displaySettings } = defineProps<PaletteItemProps>();
</script>

<template>
  <Tooltip :text="paletteItem.getTitle()" :delay-duration="200" side="left" :ui="{ content: 'text-base' }">
    <div
      v-bind="$attrs"
      class="flex min-h-7 w-full min-w-0 items-center gap-2 rounded-md px-1.5 outline-2 -outline-offset-4 outline-solid data-highlighted:ring-2 data-highlighted:ring-primary"
      :style="{
        '--palitem-color': paletteItem.hex,

        backgroundColor: 'var(--palitem-color)',
        color: `contrast-color(var(--palitem-color)) !important`,
        outlineColor: selected ? `contrast-color(var(--palitem-color))` : 'transparent',
      }"
    >
      <slot />
      <span v-show="!displaySettings.colorOnly" class="truncate">
        {{ paletteItem.getTitle(displaySettings) }}
      </span>
    </div>
  </Tooltip>
</template>

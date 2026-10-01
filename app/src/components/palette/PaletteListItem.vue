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
  <Tooltip :text="paletteItem.getTitle()" :delay-duration="200" side="left">
    <div
      v-bind="$attrs"
      :class="$style.root"
      :style="{
        '--palitem-color': paletteItem.hex,

        backgroundColor: 'var(--palitem-color)',
        color: `contrast-color(var(--palitem-color)) !important`,
        outlineColor: selected ? `contrast-color(var(--palitem-color))` : 'transparent',
      }"
    >
      <slot />
      <span v-show="!displaySettings.colorOnly" :class="$style.title">
        {{ paletteItem.getTitle(displaySettings) }}
      </span>
    </div>
  </Tooltip>
</template>

<style module>
.root {
  display: flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;

  width: 100%;
  min-width: 0;
  min-height: calc(var(--spacing) * 7);
  padding-inline: calc(var(--spacing) * 1.5);
  border-radius: var(--radius-md);

  outline-style: solid;
  outline-width: 2px;
  outline-offset: -4px;

  &[data-highlighted] {
    box-shadow: 0 0 0 2px var(--color-primary);
  }
}

.title {
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

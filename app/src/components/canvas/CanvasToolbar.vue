<script setup lang="ts">
import { ButtonIcon, Popover, Separator, ToolToggle, ToolToggleGroup } from "@embroiderly/ui";
import type { ToolToggleItem } from "@embroiderly/ui";

import { computed, ref, watch } from "vue";

import { IconLayers, IconStitchFull, IconStitchMix, IconStitchSquare, IconStitchSymbol } from "~/assets/icons/";
import { useI18n } from "~/composables/";
import { DisplayMode, LayersVisibility } from "~/lib/pattern/";
import { usePatternStore } from "~/stores/";

import CanvasLayers from "./CanvasLayers.vue";

const { fluent } = useI18n();

const patternStore = usePatternStore();

const disabled = computed(() => patternStore.pattern === undefined);

const layers = ref(new LayersVisibility(patternStore.pattern?.layersVisibility || LayersVisibility.default()));
watch(layers, (newLayers) => patternStore.setLayersVisibility(newLayers), { deep: true });

const displayModeOptions = computed<ToolToggleItem[]>(() => [
  { icon: IconStitchMix, tooltip: fluent.$t("canvas-toolbar-view-as-mix"), value: DisplayMode.Mixed },
  { icon: IconStitchSquare, tooltip: fluent.$t("canvas-toolbar-view-as-solid"), value: DisplayMode.Solid },
  { icon: IconStitchFull, tooltip: fluent.$t("canvas-toolbar-view-as-stitches"), value: DisplayMode.Stitches },
]);

const showSymbols = computed({
  get: () => patternStore.pattern?.showSymbols ?? false,
  set: patternStore.showSymbols,
});
</script>

<template>
  <div class="flex flex-col gap-1 p-1">
    <Popover arrow :content="{ side: 'left', align: 'start' }" :ui="{ content: 'p-2' }">
      <ButtonIcon
        color="neutral"
        variant="ghost"
        :icon="IconLayers"
        :disabled="disabled"
        :tooltip="$t('canvas-toolbar-layers')"
        :delay-duration="200"
        :content="{ side: 'left' }"
      />

      <template #content>
        <CanvasLayers v-model="layers" />
      </template>
    </Popover>

    <Separator />

    <ToolToggleGroup
      :model-value="patternStore.pattern?.displayMode"
      :items="displayModeOptions"
      :disabled="disabled"
      :delay-duration="200"
      :tooltip-options="{ content: { side: 'left' } }"
      orientation="vertical"
      class="flex flex-col gap-1"
      @update:model-value="patternStore.setDisplayMode($event as DisplayMode)"
    />

    <Separator />

    <ToolToggle
      v-model="showSymbols"
      :icon="IconStitchSymbol"
      :tooltip="showSymbols ? fluent.$t('canvas-toolbar-hide-symbols') : fluent.$t('canvas-toolbar-show-symbols')"
      :disabled="disabled"
      :delay-duration="200"
      :tooltip-options="{ content: { side: 'left' } }"
    />
  </div>
</template>

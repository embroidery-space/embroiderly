<script setup lang="ts">
import { Separator, SplitterPanel, ToolToggle, ToolToggleGroup, useConfirm } from "@embroiderly/ui";
import type { SplitterPanelProps, SplitterPanelEmits, ToolToggleItem } from "@embroiderly/ui";

import { useForwardPropsEmits } from "reka-ui";
import { computed, ref, useTemplateRef, watch } from "vue";

import type { LayerVisibility } from "~/api/endpoints/pattern.ts";
import { IconSymbols, IconGrid, IconRulers, IconStitchFull, IconStitchSquare, IconStitchMix } from "~/assets/icons/";
import { CanvasLayers } from "~/components/canvas/";
import { useI18n } from "~/composables/";
import { DisplayMode } from "~/lib/pattern/";
import { useEditorStateStore, usePatternStore } from "~/stores/";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WorkspaceCanvasToolbarPanel extends SplitterPanelProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WorkspaceCanvasToolbarPanelEmits extends SplitterPanelEmits {}

const props = defineProps<WorkspaceCanvasToolbarPanel>();
const emits = defineEmits<WorkspaceCanvasToolbarPanelEmits>();

const splitterPanelProps = useForwardPropsEmits(props, emits);

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();

const { fluent } = useI18n();
const confirm = useConfirm();

const panel = useTemplateRef("panel");

const collapsed = ref(false);
const disabled = computed(() => patternStore.pattern === undefined);

const displayModeOptions = computed<ToolToggleItem[]>(() => [
  {
    icon: IconStitchMix,
    tooltip: collapsed.value ? fluent.$t("canvas-view-mix") : undefined,
    label: collapsed.value ? undefined : fluent.$t("canvas-view-mix"),
    value: DisplayMode.Mixed,
  },
  {
    icon: IconStitchSquare,
    tooltip: collapsed.value ? fluent.$t("canvas-view-solid") : undefined,
    label: collapsed.value ? undefined : fluent.$t("canvas-view-solid"),
    value: DisplayMode.Solid,
  },
  {
    icon: IconStitchFull,
    tooltip: collapsed.value ? fluent.$t("canvas-view-stitches") : undefined,
    label: collapsed.value ? undefined : fluent.$t("canvas-view-stitches"),
    value: DisplayMode.Stitches,
  },
]);

const showSymbols = computed({
  get: () => patternStore.pattern?.showSymbols ?? false,
  set: patternStore.showSymbols,
});

const showGrid = computed({
  get: () => patternStore.pattern?.showGrid ?? true,
  set: patternStore.showGrid,
});

const showRulers = computed({
  get: () => patternStore.pattern?.showRulers ?? true,
  set: patternStore.showRulers,
});

function handleAddLayer() {
  const layerCount = patternStore.pattern?.layers.length ?? 0;
  patternStore.addLayer(`Layer ${layerCount + 1}`);
}

function handleToggleLayerVisibility(layerIndex: number, visibility: LayerVisibility) {
  patternStore.updateLayerVisibility(layerIndex, visibility);
}

async function handleRemoveLayer(index: number) {
  const layer = patternStore.pattern?.layers[index];

  const accepted = await confirm.open(fluent.$ta("canvas-layers-remove-confirm", { name: layer!.name })).result;
  if (!accepted) return;

  patternStore.removeLayer(index);
  if (editorStateStore.selectedLayerIndex >= index && editorStateStore.selectedLayerIndex > 0) {
    editorStateStore.selectedLayerIndex -= 1;
  }
}

watch(
  () => editorStateStore.canvasPanelCollapsed,
  (value) => {
    if (value) panel.value?.collapse();
    else panel.value?.expand();
  },
);

function handlePanelCollapse() {
  collapsed.value = true;
  editorStateStore.canvasPanelCollapsed = true;
}

function handlePanelExpand() {
  collapsed.value = false;
  editorStateStore.canvasPanelCollapsed = false;
}
</script>

<template>
  <SplitterPanel
    ref="panel"
    v-bind="splitterPanelProps"
    class="flex h-full flex-col gap-1 p-1"
    @collapse="handlePanelCollapse"
    @expand="handlePanelExpand"
    @resize="editorStateStore.canvasPanelSize = $event"
  >
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
      :icon="IconSymbols"
      :tooltip="collapsed ? $t('canvas-symbols') : undefined"
      :label="collapsed ? undefined : fluent.$t('canvas-symbols')"
      :disabled="disabled"
      :delay-duration="200"
      :tooltip-options="{ content: { side: 'left' } }"
    />
    <ToolToggle
      v-model="showGrid"
      :icon="IconGrid"
      :tooltip="collapsed ? $t('canvas-grid') : undefined"
      :label="collapsed ? undefined : $t('canvas-grid')"
      :disabled="disabled"
      :delay-duration="200"
      :tooltip-options="{ content: { side: 'left' } }"
    />
    <ToolToggle
      v-model="showRulers"
      :icon="IconRulers"
      :tooltip="collapsed ? $t('canvas-rulers') : undefined"
      :label="collapsed ? undefined : $t('canvas-rulers')"
      :disabled="disabled"
      :delay-duration="200"
      :tooltip-options="{ content: { side: 'left' } }"
    />

    <template v-if="!collapsed && patternStore.pattern?.layers.length">
      <Separator />
      <CanvasLayers
        v-model="editorStateStore.selectedLayerIndex"
        :layers="patternStore.pattern.layers"
        class="grow"
        @add-layer="handleAddLayer"
        @remove-layer="handleRemoveLayer"
        @toggle-layer-visibility="handleToggleLayerVisibility"
      />
    </template>
  </SplitterPanel>
</template>

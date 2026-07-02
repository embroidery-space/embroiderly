<script setup lang="ts">
import {
  ButtonIcon,
  Popover,
  ScrollArea,
  Separator,
  SplitterPanel,
  ToolToggle,
  ToolToggleGroup,
  useConfirm,
  useForwardPropsEmits,
} from "@embroiderly/ui";
import type { SplitterPanelProps, SplitterPanelEmits, ToolToggleItem } from "@embroiderly/ui";

import { computed, useTemplateRef, watch } from "vue";

import {
  IconClose,
  IconGrid,
  IconLayers,
  IconRulers,
  IconStitchFull,
  IconStitchMix,
  IconStitchSquare,
  IconSymbols,
} from "~/assets/icons/";
import { CanvasLayers } from "~/components/canvas/";
import { useI18n } from "~/composables/";
import { DisplayMode } from "~/lib/pattern/";
import { useEditorStateStore, usePatternStore } from "~/stores/";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WorkspaceCanvasPanelProps extends SplitterPanelProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WorkspaceCanvasPanelEmits extends SplitterPanelEmits {}

const props = defineProps<WorkspaceCanvasPanelProps>();
const emits = defineEmits<WorkspaceCanvasPanelEmits>();

const splitterPanelProps = useForwardPropsEmits(props, emits);

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();

const { fluent } = useI18n();
const confirm = useConfirm();

const panel = useTemplateRef("panel");

const collapsed = computed(() => editorStateStore.canvasPanelCollapsed);
const disabled = computed(() => patternStore.pattern.isNil);

const displayMode = computed({
  get: () => (disabled.value ? undefined : patternStore.pattern.displayMode),
  set: patternStore.setDisplayMode,
});
const displayModeOptions = computed<ToolToggleItem[]>(() => [
  {
    icon: IconStitchMix,
    tooltip: collapsed.value ? fluent.$t("canvas-view-mix") : undefined,
    label: collapsed.value ? undefined : fluent.$t("canvas-view-mix"),
    value: DisplayMode.Mixed,
    shortcut: "Shift+V-M",
  },
  {
    icon: IconStitchSquare,
    tooltip: collapsed.value ? fluent.$t("canvas-view-solid") : undefined,
    label: collapsed.value ? undefined : fluent.$t("canvas-view-solid"),
    value: DisplayMode.Solid,
    shortcut: "Shift+V-S",
  },
  {
    icon: IconStitchFull,
    tooltip: collapsed.value ? fluent.$t("canvas-view-stitches") : undefined,
    label: collapsed.value ? undefined : fluent.$t("canvas-view-stitches"),
    value: DisplayMode.Stitches,
    shortcut: "Shift+V-X",
  },
]);

const showSymbols = computed({
  get: () => (disabled.value ? undefined : patternStore.pattern.showSymbols),
  set: patternStore.showSymbols,
});
const showGrid = computed({
  get: () => (disabled.value ? undefined : patternStore.pattern.showGrid),
  set: patternStore.showGrid,
});
const showRulers = computed({
  get: () => (disabled.value ? undefined : patternStore.pattern.showRulers),
  set: patternStore.showRulers,
});

async function handleRemoveLayer(index: number) {
  const layer = patternStore.pattern.layers.get(index);
  const layerName = layer!.name || fluent.$t("canvas-layers-placeholder", { index: layer!.index + 1 });

  const accepted = await confirm.open(fluent.$ta("canvas-layers-remove-confirm", { name: layerName })).result;
  if (!accepted) return;

  patternStore.removeLayer(index);
  if (editorStateStore.selectedLayerIndex === index) {
    editorStateStore.selectedLayerIndex = patternStore.pattern.layers.positions[0]!;
  }
}

watch(collapsed, (value) => {
  if (value) panel.value?.collapse();
  else panel.value?.expand();
});
</script>

<template>
  <SplitterPanel ref="panel" v-bind="splitterPanelProps" class="h-full min-w-min">
    <ScrollArea
      class="h-full"
      orientation="vertical"
      size="sm"
      type="hover"
      :ui="{ viewport: 'flex flex-col gap-1 p-1' }"
    >
      <ToolToggleGroup
        v-model="displayMode"
        :items="displayModeOptions"
        :disabled="disabled"
        :delay-duration="200"
        :tooltip-options="{ side: 'left' }"
        orientation="vertical"
      />

      <Separator />

      <ToolToggle
        v-model="showSymbols"
        shortcut="Shift+S"
        :icon="IconSymbols"
        :tooltip="collapsed ? $t('canvas-symbols') : undefined"
        :label="collapsed ? undefined : fluent.$t('canvas-symbols')"
        :disabled="disabled"
        :delay-duration="200"
        :tooltip-options="{ side: 'left' }"
      />
      <ToolToggle
        v-model="showGrid"
        shortcut="Shift+G"
        :icon="IconGrid"
        :tooltip="collapsed ? $t('canvas-grid') : undefined"
        :label="collapsed ? undefined : $t('canvas-grid')"
        :disabled="disabled"
        :delay-duration="200"
        :tooltip-options="{ side: 'left' }"
      />
      <ToolToggle
        v-model="showRulers"
        shortcut="Shift+R"
        :icon="IconRulers"
        :tooltip="collapsed ? $t('canvas-rulers') : undefined"
        :label="collapsed ? undefined : $t('canvas-rulers')"
        :disabled="disabled"
        :delay-duration="200"
        :tooltip-options="{ side: 'left' }"
      />

      <Separator />

      <CanvasLayers
        v-if="!collapsed"
        v-model="editorStateStore.selectedLayerIndex"
        :layers="patternStore.pattern.layers.itemsInVisualOrder"
        :disabled="disabled"
        class="grow"
        @add-layer="patternStore.addLayer"
        @remove-layer="handleRemoveLayer"
        @rename-layer="patternStore.renameLayer"
        @toggle-layer-visibility="patternStore.updateLayerVisibility"
        @move-layer="patternStore.moveLayer"
      />
      <Popover v-else pinned side="left" align="start" class="flex h-[41.5vh] w-64 p-1">
        <template #default="{ open }">
          <ButtonIcon
            color="neutral"
            :variant="open ? 'soft' : 'ghost'"
            :icon="open ? IconClose : IconLayers"
            :disabled="disabled"
            :tooltip="$t('canvas-layers')"
            side="left"
          />
        </template>

        <template #content>
          <CanvasLayers
            v-model="editorStateStore.selectedLayerIndex"
            :layers="patternStore.pattern.layers.itemsInVisualOrder"
            :disabled="disabled"
            class="w-full"
            @add-layer="patternStore.addLayer"
            @remove-layer="handleRemoveLayer"
            @rename-layer="patternStore.renameLayer"
            @toggle-layer-visibility="patternStore.updateLayerVisibility"
            @move-layer="patternStore.moveLayer"
          />
        </template>
      </Popover>
    </ScrollArea>
  </SplitterPanel>
</template>

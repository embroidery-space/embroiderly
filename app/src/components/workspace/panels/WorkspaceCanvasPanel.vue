<script setup lang="ts">
import { ButtonIcon, Popover, Separator, SplitterPanel, ToolToggle, ToolToggleGroup } from "@embroiderly/ui";
import type { SplitterPanelProps, SplitterPanelEmits, ToolToggleItem } from "@embroiderly/ui";

import { useForwardPropsEmits } from "reka-ui";
import { computed, ref, useTemplateRef, watch } from "vue";

import {
  IconGrid,
  IconLayers,
  IconRulers,
  IconStitchFull,
  IconStitchMix,
  IconStitchSquare,
  IconSymbols,
} from "~/assets/icons/";
import { CanvasLayers } from "~/components/canvas";
import { useI18n } from "~/composables/";
import { DisplayMode, LayersVisibility } from "~/lib/pattern/";
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

const panel = useTemplateRef("panel");

const collapsed = ref(false);
const disabled = computed(() => patternStore.pattern === undefined);

const displayModeOptions = computed<ToolToggleItem[]>(() => [
  {
    icon: IconStitchMix,
    tooltip: fluent.$t("canvas-toolbar-view-as-mix"),
    label: collapsed.value ? undefined : fluent.$t("canvas-toolbar-view-as-mix"),
    value: DisplayMode.Mixed,
  },
  {
    icon: IconStitchSquare,
    tooltip: fluent.$t("canvas-toolbar-view-as-solid"),
    label: collapsed.value ? undefined : fluent.$t("canvas-toolbar-view-as-solid"),
    value: DisplayMode.Solid,
  },
  {
    icon: IconStitchFull,
    tooltip: fluent.$t("canvas-toolbar-view-as-stitches"),
    label: collapsed.value ? undefined : fluent.$t("canvas-toolbar-view-as-stitches"),
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

const layers = ref(new LayersVisibility(patternStore.pattern?.layersVisibility || LayersVisibility.default()));
watch(layers, (newLayers) => patternStore.setLayersVisibility(newLayers), { deep: true });

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
      :icon="IconSymbols"
      :tooltip="showSymbols ? fluent.$t('canvas-toolbar-hide-symbols') : fluent.$t('canvas-toolbar-show-symbols')"
      :label="
        collapsed
          ? undefined
          : showSymbols
            ? fluent.$t('canvas-toolbar-hide-symbols')
            : fluent.$t('canvas-toolbar-show-symbols')
      "
      :disabled="disabled"
      :delay-duration="200"
      :tooltip-options="{ content: { side: 'left' } }"
    />

    <ToolToggle
      v-model="showGrid"
      :icon="IconGrid"
      :tooltip="showGrid ? fluent.$t('canvas-toolbar-hide-grid') : fluent.$t('canvas-toolbar-show-grid')"
      :label="
        collapsed ? undefined : showGrid ? fluent.$t('canvas-toolbar-hide-grid') : fluent.$t('canvas-toolbar-show-grid')
      "
      :disabled="disabled"
      :delay-duration="200"
      :tooltip-options="{ content: { side: 'left' } }"
    />

    <ToolToggle
      v-model="showRulers"
      :icon="IconRulers"
      :tooltip="showRulers ? fluent.$t('canvas-toolbar-hide-rulers') : fluent.$t('canvas-toolbar-show-rulers')"
      :label="
        collapsed
          ? undefined
          : showRulers
            ? fluent.$t('canvas-toolbar-hide-rulers')
            : fluent.$t('canvas-toolbar-show-rulers')
      "
      :disabled="disabled"
      :delay-duration="200"
      :tooltip-options="{ content: { side: 'left' } }"
    />
  </SplitterPanel>
</template>

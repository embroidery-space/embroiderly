<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { onMounted, onUnmounted, useTemplateRef, watch } from "vue";

import { PatternEvent } from "~/lib/pattern/";
import type { DisplaySettings, LineStitch, NodeStitch, Pattern } from "~/lib/pattern/";
import { PatternApplication } from "~/lib/pixi/";
import { ToolEvent } from "~/lib/types/";
import type {
  PatternOptions,
  RenderOptions,
  TextureManagerOptions,
  ToolEventDetail,
  TransformEventDetail,
  ViewportOptions,
} from "~/lib/types/";

export interface PatternCanvasProps {
  pattern?: Pattern;
  renderOptions?: RenderOptions;
  viewportOptions?: ViewportOptions;
  textureManagerOptions?: TextureManagerOptions;
  patternOptions?: PatternOptions;
}

export interface PatternCanvasEmits {
  (event: "tool-main-action", detail: ToolEventDetail): void;
  (event: "tool-anti-action", detail: ToolEventDetail): void;
  (event: "tool-release", detail: ToolEventDetail): void;
  (event: "transform", detail: TransformEventDetail): void;
}

const props = defineProps<PatternCanvasProps>();
const emit = defineEmits<PatternCanvasEmits>();

const canvas = useTemplateRef("canvas");

const patternApplication = new PatternApplication();

let patternAbortController: AbortController | undefined;
function updatePatternView(pattern: Pattern) {
  if (!patternApplication.initialized) return;

  patternAbortController?.abort();
  patternAbortController = new AbortController();

  const patternView = patternApplication.setView(pattern);
  if (props.patternOptions?.layerLayout) patternView.layerLayout = props.patternOptions.layerLayout;

  const { signal } = patternAbortController;

  pattern.addEventListener(
    PatternEvent.UpdateReferenceImage,
    (e) => {
      const image = (e as CustomEvent).detail;
      if (image) patternView.setReferenceImage(image);
      else patternView.removeReferenceImage();
    },
    { signal },
  );
  pattern.addEventListener(
    PatternEvent.UpdateReferenceImageSettings,
    (e) => (patternView.referenceImageSettings = (e as CustomEvent).detail),
    { signal },
  );

  pattern.addEventListener(PatternEvent.UpdateFabric, (e) => patternView.setFabric((e as CustomEvent).detail), {
    signal,
  });
  pattern.addEventListener(PatternEvent.UpdateGrid, (e) => patternView.setGrid((e as CustomEvent).detail), {
    signal,
  });

  pattern.addEventListener(
    PatternEvent.AddStitch,
    (e) => {
      const { layerIndex, stitch } = (e as CustomEvent).detail;
      patternView.addStitch(stitch, layerIndex);
    },
    { signal },
  );
  pattern.addEventListener(
    PatternEvent.RemoveStitch,
    (e) => {
      const { layerIndex, stitch } = (e as CustomEvent).detail;
      patternView.removeStitch(stitch, layerIndex);
    },
    { signal },
  );

  pattern.addEventListener(
    PatternEvent.AddLayer,
    (e) => {
      patternView.addLayer((e as CustomEvent).detail.index);
    },
    { signal },
  );
  pattern.addEventListener(
    PatternEvent.RemoveLayer,
    (e) => {
      patternView.removeLayer((e as CustomEvent).detail);
    },
    { signal },
  );
  pattern.addEventListener(
    PatternEvent.UpdateLayerVisibility,
    (e) => {
      const { layerIndex } = (e as CustomEvent).detail;
      patternView.updateLayerVisibility(layerIndex);
    },
    { signal },
  );
  pattern.addEventListener(
    PatternEvent.MoveLayer,
    () => {
      patternView.reorderLayers();
    },
    { signal },
  );

  pattern.addEventListener(
    PatternEvent.UpdateDisplayMode,
    (e) => patternView.setDisplayMode((e as CustomEvent).detail),
    { signal },
  );
  pattern.addEventListener(
    PatternEvent.UpdateDisplaySettings,
    (e) => patternView.setDisplaySettings((e as CustomEvent).detail),
    { signal },
  );
}

watch(
  () => props.pattern,
  (pattern, oldPattern) => {
    if (!pattern || pattern.id === oldPattern?.id) return;
    updatePatternView(pattern);
  },
);

watch(
  () => props.patternOptions?.layerLayout,
  (layerLayout) => {
    if (!patternApplication.view) return;
    if (layerLayout) patternApplication.view.layerLayout = layerLayout;
  },
);

useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolMainAction, (e) => {
  emit("tool-main-action", e.detail);
});
useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolAntiAction, (e) => {
  emit("tool-anti-action", e.detail);
});
useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolRelease, (e) => {
  emit("tool-release", e.detail);
});
useEventListener<CustomEvent<TransformEventDetail>>(patternApplication, ToolEvent.Transform, (e) => {
  patternApplication.view?.adjustZoom(e.detail.scale, e.detail.bounds);
  emit("transform", e.detail);
});

defineExpose({
  setCanvasZoom: patternApplication.setZoom.bind(patternApplication),

  setDisplaySettings: (value: DisplaySettings) => patternApplication.view?.setDisplaySettings(value),

  getReferenceImageSettings: () => patternApplication.view?.referenceImageSettings,
  blurReferenceImage: () => patternApplication.view?.blurReferenceImage(),
  focusReferenceImage: () => patternApplication.view?.focusReferenceImage(),

  drawLineHint: (stitch: LineStitch) => patternApplication.view?.drawLineHint(stitch),
  drawNodeHint: (stitch: NodeStitch) => patternApplication.view?.drawNodeHint(stitch),
});

onMounted(async () => {
  await patternApplication.init(canvas.value!, {
    render: props.renderOptions,
    viewport: props.viewportOptions,
    textureManager: props.textureManagerOptions,
  });
  if (props.pattern) updatePatternView(props.pattern);
});

onUnmounted(() => {
  patternAbortController?.abort();
  patternApplication.destroy();
});
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>

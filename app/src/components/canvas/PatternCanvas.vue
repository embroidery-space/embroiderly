<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { onMounted, onUnmounted, useTemplateRef, watch } from "vue";

import { PatternEvent } from "~/lib/pattern/";
import type { DisplaySettings, LineStitch, NodeStitch, Pattern } from "~/lib/pattern/";
import { PatternApplication, ToolEvent } from "~/lib/pixi/";
import type { PatternApplicationOptions, ToolEventDetail, TransformEventDetail } from "~/lib/pixi/";

interface PatternCanvasProps {
  pattern?: Pattern;
  options?: PatternApplicationOptions;
  enableToolEvents?: boolean;
}

interface PatternCanvasEmits {
  (event: "tool-main-action", detail: ToolEventDetail): void;
  (event: "tool-anti-action", detail: ToolEventDetail): void;
  (event: "tool-release", detail: ToolEventDetail): void;
  (event: "transform", detail: TransformEventDetail): void;
}

const props = withDefaults(defineProps<PatternCanvasProps>(), {
  pattern: undefined,
  options: undefined,
  enableToolEvents: false,
});
const emit = defineEmits<PatternCanvasEmits>();

const canvas = useTemplateRef("canvas");

const patternApplication = new PatternApplication();

let patternAbortController: AbortController | undefined;
function updatePatternView(pattern: Pattern) {
  if (!patternApplication.initialized) return;

  patternAbortController?.abort();
  patternAbortController = new AbortController();

  const patternView = patternApplication.setView(pattern);

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

useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolMainAction, (e) => {
  if (props.enableToolEvents) emit("tool-main-action", e.detail);
});
useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolAntiAction, (e) => {
  if (props.enableToolEvents) emit("tool-anti-action", e.detail);
});
useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolRelease, (e) => {
  if (props.enableToolEvents) emit("tool-release", e.detail);
});
useEventListener<CustomEvent<TransformEventDetail>>(patternApplication, ToolEvent.Transform, (e) => {
  patternApplication.view?.adjustZoom(e.detail.scale, e.detail.bounds);
  if (props.enableToolEvents) emit("transform", e.detail);
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
  await patternApplication.init(canvas.value!, props.options);
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

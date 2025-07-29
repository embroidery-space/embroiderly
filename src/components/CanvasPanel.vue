<template>
  <div class="size-full flex flex-col">
    <div class="relative">
      <NuxtTabs
        :model-value="appStateStore.currentPattern?.id"
        :items="appStateStore.openedPatterns.map(({ id, title }) => ({ label: title, value: id }))"
        :content="false"
        color="neutral"
        activation-mode="manual"
        :ui="{
          root: 'block border-b border-default',
          list: 'bg-transparent p-0',
          indicator: 'h-full inset-0 rounded-b-none rounded-tl-none shadow-none z-0',
          trigger: [
            'grow-0 min-w-20 hover:data-[state=inactive]:bg-accented hover:cursor-pointer',
            'data-[state=inactive]:border-r border-default rounded-b-none rounded-tl-none',
          ],
        }"
        @update:model-value="switchPattern($event as string)"
      >
        <template #trailing="{ item }">
          <NuxtButton
            size="xs"
            variant="ghost"
            icon="i-lucide:x"
            class="p-0"
            :class="{
              'text-inverted': appStateStore.currentPattern!.id === item.value,
              'text-default': appStateStore.currentPattern!.id !== item.value,
            }"
            @click.stop="patternsStore.closePattern(item.value)"
          />
        </template>
      </NuxtTabs>
      <NuxtProgress v-if="patternsStore.loading" size="sm" :ui="{ root: 'absolute top-full', base: 'rounded-none' }" />
    </div>

    <div class="w-full grow overflow-hidden">
      <NuxtContextMenu :items="canvasContextMenuOptions">
        <canvas
          ref="canvas"
          v-element-size="useDebounceFn(({ width, height }) => patternCanvas.resize(width, height), 100)"
          class="size-full"
        ></canvas>
      </NuxtContextMenu>
    </div>

    <div class="w-full flex items-center justify-between border-t border-default px-2 py-1">
      <div class="grow"></div>
      <ZoomControls
        :model-value="zoom"
        :min="MIN_SCALE"
        :max="MAX_SCALE"
        class="max-w-3xs w-full"
        @update:model-value="(value) => patternCanvas.setZoom(value)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue";
  import type { ContextMenuItem } from "@nuxt/ui";
  import { useDebounceFn, useEventListener } from "@vueuse/core";
  import { vElementSize } from "@vueuse/components";
  import { Assets } from "pixi.js";

  import { PatternCanvas, EventType, TextureManager, STITCH_FONT_PREFIX, MAX_SCALE, MIN_SCALE } from "#/core/pixi/";
  import type { PatternCanvasOptions, ToolEventDetail, TransformEventDetail } from "#/core/pixi/";
  import { StitchTool } from "#/core/tools/";
  import { PatternEventBus } from "#/core/services/";

  const fluent = useFluent();

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();

  const canvas = useTemplateRef("canvas");
  const patternCanvas = new PatternCanvas();
  const canvasContextMenuOptions = computed<ContextMenuItem[][]>(() => [
    [
      {
        icon: "i-lucide:image",
        label: fluent.$t("label-set-reference-image"),
        onSelect: () => patternsStore.setReferenceImage(),
      },
    ],
  ]);

  /**
   * Initialize the pattern canvas.
   * It sets up the Pixi application, configures stages, and prepares the texture manager.
   */
  async function initPatternCanvas(options?: PatternCanvasOptions) {
    await patternCanvas.init(canvas.value!, options);
  }

  const zoom = ref(1);

  async function switchPattern(id: string) {
    if (appStateStore.currentPattern!.id !== id) {
      patternsStore.loadPattern(id);
    }
  }

  watch(
    () => patternsStore.pattern,
    async (pattern) => {
      if (!pattern) return;
      await Assets.load(pattern.allStitchFonts.map((font) => `${STITCH_FONT_PREFIX}${font}`));
      patternCanvas.setPattern(pattern);
    },
  );

  useEventListener<CustomEvent<ToolEventDetail>>(patternCanvas, EventType.ToolMainAction, async (e) => {
    const tool = appStateStore.selectedTool;
    const pattern = patternsStore.pattern;
    if (!tool || !pattern) return;

    if (tool instanceof StitchTool && tool.isFirstRun) {
      // Start a transaction for the first run of the stitch tool.
      await patternsStore.startTransaction();
    }

    await tool.main(pattern, e.detail, appStateStore.selectedPaletteItemIndexes[0]);
  });

  useEventListener<CustomEvent<ToolEventDetail>>(patternCanvas, EventType.ToolAntiAction, async (e) => {
    const tool = appStateStore.selectedTool;
    const pattern = patternsStore.pattern;
    if (!tool || !pattern) return;

    await tool.anti?.(pattern, e.detail, appStateStore.selectedPaletteItemIndexes[0]);
  });

  useEventListener<CustomEvent<ToolEventDetail>>(patternCanvas, EventType.ToolRelease, async (e) => {
    const tool = appStateStore.selectedTool;
    const pattern = patternsStore.pattern;
    if (!tool || !pattern) return;

    if (tool instanceof StitchTool) {
      // End a transaction on the stitch tool release.
      await patternsStore.endTransaction();
    }

    await tool.release?.(pattern, e.detail, appStateStore.selectedPaletteItemIndexes[0]);
  });

  useEventListener<CustomEvent<TransformEventDetail>>(patternCanvas, EventType.Transform, async ({ detail }) => {
    zoom.value = Math.round(detail.scale);
    patternsStore.pattern!.adjustZoom(detail.scale, detail.bounds);
  });

  PatternEventBus.on("draw-line-hint", (line) => {
    const pattern = patternsStore.pattern;
    if (!pattern) return;

    const palitem = pattern.palette[line.palindex]!;
    patternCanvas.drawLineHint(line, palitem.color);
  });

  PatternEventBus.on("draw-node-hint", (node) => {
    const pattern = patternsStore.pattern;
    if (!pattern) return;

    const palitem = pattern.palette[node.palindex]!;
    patternCanvas.drawNodeHint(node, palitem.color);
  });

  defineExpose({ initPatternCanvas });

  onMounted(async () => {
    const pattern = patternsStore.pattern;
    if (!pattern) return;
    await Assets.load(pattern.allStitchFonts.map((font) => `${STITCH_FONT_PREFIX}${font}`));
    patternCanvas.setPattern(pattern);
  });

  onUnmounted(async () => {
    patternCanvas.clear();
    TextureManager.shared.clear();
  });
</script>

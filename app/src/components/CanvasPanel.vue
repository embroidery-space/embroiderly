<template>
  <div class="flex size-full flex-col">
    <div class="relative">
      <UTabs
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
          <UButton
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
      </UTabs>
      <UProgress v-if="patternsStore.loading" size="sm" :ui="{ root: 'absolute top-full', base: 'rounded-none' }" />
    </div>

    <div class="w-full grow overflow-hidden">
      <UContextMenu :items="canvasContextMenuOptions">
        <canvas
          ref="canvas"
          v-element-size="useDebounceFn(({ width, height }) => patternApplication.resize(width, height), 100)"
          class="size-full"
        ></canvas>
      </UContextMenu>
    </div>

    <div class="flex w-full items-center justify-between border-t border-default px-2 py-1">
      <div class="grow"></div>
      <ZoomControls
        :model-value="zoom"
        :min="MIN_SCALE"
        :max="MAX_SCALE"
        class="w-full max-w-3xs"
        @update:model-value="(value) => patternApplication.setZoom(value)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onUnmounted, ref, useTemplateRef, watch } from "vue";
  import type { ContextMenuItem } from "@nuxt/ui";
  import { useDebounceFn, useEventListener } from "@vueuse/core";
  import { vElementSize } from "@vueuse/components";
  import { Assets } from "pixi.js";

  import { PatternEvent } from "~/core/pattern/";
  import { PatternApplication, ToolEvent, STITCH_FONT_PREFIX, MAX_SCALE, MIN_SCALE, PatternView } from "~/core/pixi/";
  import type { PatternApplicationOptions, ToolEventDetail, TransformEventDetail } from "~/core/pixi/";
  import { CursorTool, type PatternEditorToolContext } from "~/core/tools/";

  const fluent = useFluent();

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();

  const patternApplication = new PatternApplication();

  const canvas = useTemplateRef("canvas");
  const canvasContextMenuOptions = computed<ContextMenuItem[][]>(() => [
    [
      {
        icon: "i-lucide:image",
        label: fluent.$t("label-set-reference-image"),
        onSelect: () => patternsStore.setReferenceImage(),
      },
      {
        icon: "i-lucide:image-off",
        label: fluent.$t("label-remove-reference-image"),
        color: "error",
        disabled: !patternsStore.pattern?.referenceImage,
        onSelect: () => patternsStore.removeReferenceImage(),
      },
    ],
  ]);

  const zoom = ref(1);

  async function switchPattern(id: string) {
    if (appStateStore.currentPattern!.id !== id) {
      patternsStore.loadPattern(id);
    }
  }

  watch(
    () => patternsStore.pattern,
    async (pattern, oldPattern) => {
      if (!pattern || pattern.id === oldPattern?.id) return;

      await Assets.load(pattern.allSymbolFonts.map((font) => `${STITCH_FONT_PREFIX}${font}`));

      const patternView = new PatternView(pattern);
      patternApplication.view = patternView;

      pattern.addEventListener(PatternEvent.UpdateReferenceImage, (e) => {
        const image = (e as CustomEvent).detail;
        if (image) patternView.setReferenceImage(image);
        else patternView.removeReferenceImage();
      });
      pattern.addEventListener(PatternEvent.UpdateReferenceImageSettings, (e) => (patternView.referenceImageSettings = (e as CustomEvent).detail)); // prettier-ignore
      pattern.addEventListener(PatternEvent.UpdateFabric, (e) => patternView.setFabric((e as CustomEvent).detail)); // prettier-ignore
      pattern.addEventListener(PatternEvent.UpdateGrid, (e) => patternView.setGrid((e as CustomEvent).detail)); // prettier-ignore
      pattern.addEventListener(PatternEvent.AddStitch, (e) => patternView.addStitch((e as CustomEvent).detail)); // prettier-ignore
      pattern.addEventListener(PatternEvent.RemoveStitch, (e) => patternView.removeStitch((e as CustomEvent).detail)); // prettier-ignore
      pattern.addEventListener(PatternEvent.UpdateDisplayMode, (e) => patternView.setDisplayMode((e as CustomEvent).detail)); // prettier-ignore
      pattern.addEventListener(PatternEvent.UpdateShowSymbols, (e) => patternView.setShowSymbols((e as CustomEvent).detail)); // prettier-ignore
      pattern.addEventListener(PatternEvent.UpdateLayersVisibility, (e) => patternView.setLayersVisibility((e as CustomEvent).detail)); // prettier-ignore
    },
  );

  watch(
    () => appStateStore.selectedTool,
    (_tool, prevTool) => {
      if (!patternsStore.pattern) return;

      if (prevTool instanceof CursorTool) {
        // Blur the reference image when the cursor tool is deselected.
        patternApplication.view?.blurReferenceImage();
      }
    },
    { immediate: true },
  );

  /**
   * Initialize the pattern application.
   * It sets up the Pixi.js `Application`, configures stages, and prepares the texture manager.
   */
  async function initPatternApplication(options?: PatternApplicationOptions) {
    await patternApplication.init(canvas.value!, options);
  }

  useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolMainAction, async (e) => {
    const pattern = patternsStore.pattern;
    if (!pattern) return;

    await appStateStore.selectedTool.main(createPatternEditorToolContext(e.detail));
  });

  useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolAntiAction, async (e) => {
    const pattern = patternsStore.pattern;
    if (!pattern) return;

    await appStateStore.selectedTool.anti?.(createPatternEditorToolContext(e.detail));
  });

  useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolRelease, async (e) => {
    const pattern = patternsStore.pattern;
    if (!pattern) return;

    if (e.detail.event.type !== "pointerupoutside") {
      // Call the `release` method only if the pointer is not released outside.
      await appStateStore.selectedTool.release?.(createPatternEditorToolContext(e.detail));
    }
  });

  useEventListener<CustomEvent<TransformEventDetail>>(patternApplication, ToolEvent.Transform, async ({ detail }) => {
    if (!patternApplication.view) return;

    zoom.value = Math.round(detail.scale);
    patternApplication.view.adjustZoom(detail.scale, detail.bounds);
  });

  function createPatternEditorToolContext(detail: ToolEventDetail): PatternEditorToolContext {
    return {
      ...detail,
      pattern: patternsStore.pattern!,
      api: {
        async addStitch(stitch) {
          const palindex = appStateStore.selectedPaletteItemIndexes[0];
          if (palindex !== undefined) {
            stitch.palindex = palindex;
            await patternsStore.addStitch(stitch);
          }
        },
        async removeStitch(stitch) {
          const palindex = appStateStore.selectedPaletteItemIndexes[0];
          if (palindex !== undefined) {
            stitch.palindex = palindex;
            await patternsStore.removeStitch(stitch);
          }
        },

        async updateReferenceImageSettings(settings) {
          await patternsStore.updateReferenceImageSettings(settings);
        },

        startTransaction: patternsStore.startTransaction,
        endTransaction: patternsStore.endTransaction,
      },
      ui: {
        referenceImage: {
          getSettings: () => patternApplication.view?.referenceImageSettings,
          focus: () => patternApplication.view?.focusReferenceImage(),
          blur: () => patternApplication.view?.blurReferenceImage(),
        },

        hint: {
          drawLine(stitch) {
            const palindex = appStateStore.selectedPaletteItemIndexes[0];
            if (palindex !== undefined) {
              stitch.palindex = palindex;
              patternApplication.view!.drawLineHint(stitch);
            }
          },
          drawNode(stitch) {
            const palindex = appStateStore.selectedPaletteItemIndexes[0];
            if (palindex !== undefined) {
              stitch.palindex = palindex;
              patternApplication.view!.drawNodeHint(stitch);
            }
          },
        },
      },
    };
  }

  defineExpose({ initPatternApplication });

  onUnmounted(() => {
    patternApplication.destroy();
  });
</script>

<template>
  <div class="flex size-full flex-col">
    <div class="relative">
      <UTabs
        :model-value="patternStore.pattern?.id"
        :items="patternFileStore.openedPatterns.map(({ id, title }) => ({ label: title, value: id }))"
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
              'text-inverted': patternStore.pattern?.id === item.value,
              'text-default': patternStore.pattern?.id !== item.value,
            }"
            @click.stop="closePattern(item.value)"
          />
        </template>
      </UTabs>
      <UProgress v-if="patternFileStore.loading" size="sm" :ui="{ root: 'absolute top-full', base: 'rounded-none' }" />
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
      <CanvasZoomControls
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
  import type { ContextMenuItem } from "@nuxt/ui";
  import { vElementSize } from "@vueuse/components";
  import { useDebounceFn, useEventListener } from "@vueuse/core";
  import { computed, onUnmounted, ref, useTemplateRef, watch } from "vue";
  import { useRouter } from "vue-router";

  import { FilesApi } from "~/modules/pattern-editor/api/";
  import { CanvasZoomControls } from "~/modules/pattern-editor/components/canvas/";
  import { PatternEvent } from "~/modules/pattern-editor/lib/pattern/";
  import { PatternApplication, ToolEvent, MAX_SCALE, MIN_SCALE, PatternView } from "~/modules/pattern-editor/lib/pixi/";
  import type {
    PatternApplicationOptions,
    ToolEventDetail,
    TransformEventDetail,
  } from "~/modules/pattern-editor/lib/pixi/";
  import { CursorTool } from "~/modules/pattern-editor/lib/tools/";
  import type { PatternEditorToolContext } from "~/modules/pattern-editor/lib/tools/";
  import { useEditorStateStore, usePatternStore, usePatternFileStore } from "~/modules/pattern-editor/stores/";
  import { useFilePicker, useI18n } from "~/shared/composables/";
  import { ANY_IMAGE_FILTER } from "~/shared/constants";
  import { LoggerService } from "~/shared/services/";
  import { addSymbolFonts } from "~/shared/utils/";

  const router = useRouter();

  const filePicker = useFilePicker();
  const { fluent } = useI18n();
  const toast = useToast();

  const editorStateStore = useEditorStateStore();
  const patternStore = usePatternStore();
  const patternFileStore = usePatternFileStore();

  const patternApplication = new PatternApplication();

  const canvas = useTemplateRef("canvas");
  const canvasContextMenuOptions = computed<ContextMenuItem[][]>(() => [
    [
      {
        icon: "i-lucide:image",
        label: fluent.$t("canvas-ctx-menu-set-image"),
        async onSelect() {
          const selectedPath = await filePicker.open({ filters: ANY_IMAGE_FILTER });
          if (selectedPath) patternStore.setReferenceImage(selectedPath);
        },
      },
      {
        icon: "i-lucide:image-off",
        label: fluent.$t("canvas-ctx-menu-remove-image"),
        color: "error",
        disabled: !patternStore.pattern?.referenceImage,
        onSelect: () => patternStore.removeReferenceImage(),
      },
    ],
  ]);

  const zoom = ref(1);

  function switchPattern(patternId: string) {
    router.push({ name: "pattern-editor", params: { patternId } });
  }
  async function closePattern(patternId: string) {
    await patternFileStore.closePattern(patternId);

    const openedPatternsNumber = patternFileStore.openedPatterns.length;
    const lastPatternId = patternFileStore.openedPatterns[openedPatternsNumber - 1]?.id;

    router.push({ name: "pattern-editor", params: { patternId: lastPatternId } });
  }

  watch(
    () => patternStore.pattern,
    async (pattern, oldPattern) => {
      if (!pattern || pattern.id === oldPattern?.id) return;

      await loadSymbolFonts(pattern.allSymbolFonts);

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
    () => editorStateStore.selectedTool,
    (_tool, prevTool) => {
      if (!patternStore.pattern) return;

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
    const pattern = patternStore.pattern;
    if (!pattern) return;

    await editorStateStore.selectedTool.main(createPatternEditorToolContext(e.detail));
  });

  useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolAntiAction, async (e) => {
    const pattern = patternStore.pattern;
    if (!pattern) return;

    await editorStateStore.selectedTool.anti?.(createPatternEditorToolContext(e.detail));
  });

  useEventListener<CustomEvent<ToolEventDetail>>(patternApplication, ToolEvent.ToolRelease, async (e) => {
    const pattern = patternStore.pattern;
    if (!pattern) return;

    if (e.detail.event.type !== "pointerupoutside") {
      // Call the `release` method only if the pointer is not released outside.
      await editorStateStore.selectedTool.release?.(createPatternEditorToolContext(e.detail));
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
      pattern: patternStore.pattern!,
      api: {
        async addStitch(stitch) {
          const palindex = editorStateStore.selectedPaletteItemIndex;
          if (palindex !== undefined) {
            stitch.palindex = palindex;
            await patternStore.addStitch(stitch);
          }
        },
        async removeStitch(stitch) {
          const palindex = editorStateStore.selectedPaletteItemIndex;
          if (palindex !== undefined) {
            stitch.palindex = palindex;
            await patternStore.removeStitch(stitch);
          }
        },

        async updateReferenceImageSettings(settings) {
          await patternStore.updateReferenceImageSettings(settings);
        },

        startTransaction: patternStore.startTransaction,
        endTransaction: patternStore.endTransaction,
      },
      ui: {
        referenceImage: {
          getSettings: () => patternApplication.view?.referenceImageSettings,
          focus: () => patternApplication.view?.focusReferenceImage(),
          blur: () => patternApplication.view?.blurReferenceImage(),
        },

        hint: {
          drawLine(stitch) {
            const palindex = editorStateStore.selectedPaletteItemIndex;
            if (palindex !== undefined) {
              stitch.palindex = palindex;
              patternApplication.view!.drawLineHint(stitch);
            }
          },
          drawNode(stitch) {
            const palindex = editorStateStore.selectedPaletteItemIndex;
            if (palindex !== undefined) {
              stitch.palindex = palindex;
              patternApplication.view!.drawNodeHint(stitch);
            }
          },
        },
      },
    };
  }

  async function loadSymbolFonts(fonts: string[]) {
    const results = await Promise.allSettled(fonts.map((font) => FilesApi.loadSymbolFont(font)));
    const failedFonts: string[] = [];
    const fontFaces = results
      .map((result, index) => {
        if (result.status === "fulfilled") return result.value;
        else {
          const fontName = fonts[index]!;
          failedFonts.push(fontName);
          LoggerService.error(`Failed to load symbol font "${fontName}": ${result.reason}`);
          return undefined;
        }
      })
      .filter((fontFace) => fontFace !== undefined);
    addSymbolFonts(fontFaces);

    if (failedFonts.length) {
      const failedFontsMessage = fluent.$ta("canvas-symbol-fonts-load-failure", { fonts: failedFonts.join(", ") });
      const { title, description } = failedFontsMessage as { title: string; description: string };
      toast.add({ title, description, color: "error" });
    }
  }

  defineExpose({ initPatternApplication });

  onUnmounted(() => {
    patternApplication.destroy();
  });
</script>

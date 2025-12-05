<template>
  <EditorWorkspaceLayout>
    <template #header>
      <EditorWorkspaceTabs />
    </template>

    <UContextMenu :items="canvasContextMenuOptions">
      <PatternCanvas
        ref="patternCanvas"
        v-element-size="useDebounceFn(({ width, height }) => patternCanvas?.resizeCanvas(width, height), 100)"
        :pattern="patternStore.pattern!"
        :options="props.options"
        enable-tool-events
        class="size-full"
        @tool-main-action="handleToolMainAction"
        @tool-anti-action="handleToolAntiAction"
        @tool-release="handleToolRelease"
        @transform="handleTransform"
      />
    </UContextMenu>

    <template #footer>
      <div class="flex items-center justify-between border-t border-default px-2 py-1">
        <div class="grow"></div>
        <CanvasZoomControls
          :model-value="editorStateStore.canvasZoom"
          :min="MIN_SCALE"
          :max="MAX_SCALE"
          class="w-full max-w-3xs"
          @update:model-value="(value) => patternCanvas?.setCanvasZoom(value)"
        />
      </div>
    </template>
  </EditorWorkspaceLayout>
</template>

<script lang="ts" setup>
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

  import type { ContextMenuItem } from "@nuxt/ui";
  import { vElementSize } from "@vueuse/components";
  import { useDebounceFn } from "@vueuse/core";
  import { computed, useTemplateRef, watch } from "vue";

  import { FilesApi } from "~/pattern-editor/api/";
  import { CanvasZoomControls, PatternCanvas } from "~/pattern-editor/components/canvas/";
  import { PatternEvent, PatternInfo } from "~/pattern-editor/lib/pattern/";
  import { MAX_SCALE, MIN_SCALE } from "~/pattern-editor/lib/pixi/";
  import type { PatternApplicationOptions, ToolEventDetail, TransformEventDetail } from "~/pattern-editor/lib/pixi/";
  import { CursorTool } from "~/pattern-editor/lib/tools/";
  import type { PatternEditorToolContext } from "~/pattern-editor/lib/tools/";
  import { useEditorStateStore, usePatternStore, usePatternFileStore } from "~/pattern-editor/stores/";
  import { useFilePicker, useI18n } from "~/shared/composables/";
  import { ANY_IMAGE_FILTER } from "~/shared/constants";
  import { LoggerService } from "~/shared/services/";
  import { addSymbolFonts } from "~/shared/utils/";

  import { EditorWorkspaceLayout, EditorWorkspaceTabs } from "./layout/";

  const props = defineProps<{ options?: PatternApplicationOptions }>();

  const appWindow = getCurrentWebviewWindow();

  const filePicker = useFilePicker();
  const { fluent } = useI18n();
  const toast = useToast();

  const editorStateStore = useEditorStateStore();
  const patternStore = usePatternStore();
  const patternFileStore = usePatternFileStore();

  const patternCanvas = useTemplateRef<InstanceType<typeof PatternCanvas>>("patternCanvas");
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

  appWindow.listen<string>(PatternEvent.UpdatePatternInfo, ({ payload }) => {
    if (!patternStore.pattern) return;
    const patternInfo = PatternInfo.deserialize(payload);
    patternFileStore.updateOpenedPattern(patternStore.pattern.id, patternInfo.title);
  });

  watch(
    () => patternStore.pattern,
    async (pattern, oldPattern) => {
      if (!pattern || pattern.id === oldPattern?.id) return;

      await loadSymbolFonts(pattern.allSymbolFonts);
    },
  );

  watch(
    () => editorStateStore.selectedTool,
    (_tool, prevTool) => {
      if (!patternStore.pattern) return;

      if (prevTool instanceof CursorTool) {
        // Blur the reference image when the cursor tool is deselected.
        patternCanvas.value?.blurReferenceImage();
      }
    },
    { immediate: true },
  );

  async function handleToolMainAction(detail: ToolEventDetail) {
    const pattern = patternStore.pattern;
    if (!pattern) return;

    await editorStateStore.selectedTool.main(createPatternEditorToolContext(detail));
  }

  async function handleToolAntiAction(detail: ToolEventDetail) {
    const pattern = patternStore.pattern;
    if (!pattern) return;

    await editorStateStore.selectedTool.anti?.(createPatternEditorToolContext(detail));
  }

  async function handleToolRelease(detail: ToolEventDetail) {
    const pattern = patternStore.pattern;
    if (!pattern) return;

    if (detail.event.type !== "pointerupoutside") {
      // Call the `release` method only if the pointer is not released outside.
      await editorStateStore.selectedTool.release?.(createPatternEditorToolContext(detail));
    }
  }

  function handleTransform(detail: TransformEventDetail) {
    editorStateStore.canvasZoom = Math.round(detail.scale);
  }

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
          getSettings: () => patternCanvas.value?.getReferenceImageSettings(),
          focus: () => patternCanvas.value?.focusReferenceImage(),
          blur: () => patternCanvas.value?.blurReferenceImage(),
        },

        hint: {
          drawLine(stitch) {
            const palindex = editorStateStore.selectedPaletteItemIndex;
            if (palindex !== undefined) {
              stitch.palindex = palindex;
              patternCanvas.value?.drawLineHint(stitch);
            }
          },
          drawNode(stitch) {
            const palindex = editorStateStore.selectedPaletteItemIndex;
            if (palindex !== undefined) {
              stitch.palindex = palindex;
              patternCanvas.value?.drawNodeHint(stitch);
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
</script>

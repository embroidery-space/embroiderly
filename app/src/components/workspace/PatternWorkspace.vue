<script lang="ts" setup>
import { ContextMenu, useToast } from "@embroiderly/ui";
import type { ContextMenuItem } from "@embroiderly/ui";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { vElementSize } from "@vueuse/components";
import { useDebounceFn } from "@vueuse/core";
import { computed, useTemplateRef, watch } from "vue";

import { FilesApi } from "~/api/";
import { IconImage, IconImageOff } from "~/assets/icons/";
import { CanvasZoomControls, PatternCanvas } from "~/components/canvas/";
import { useFilePicker, useI18n } from "~/composables/";
import { ANY_IMAGE_FILTER } from "~/constants/";
import { PatternEvent, PatternInfo } from "~/lib/pattern/";
import { MAX_SCALE, MIN_SCALE } from "~/lib/pixi/";
import type { PatternApplicationOptions, ToolEventDetail, TransformEventDetail } from "~/lib/pixi/";
import { CursorTool } from "~/lib/tools/";
import type { PatternEditorToolContext } from "~/lib/tools/";
import { LoggerService } from "~/services/";
import { PaletteMode, useEditorStateStore, usePatternStore, usePatternFileStore } from "~/stores/";
import { addSymbolFonts } from "~/utils/font-face.ts";

import { EditorWorkspaceTabs, EditorWorkspaceToolbar } from "./layout/";

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
      icon: IconImage,
      label: fluent.$t("canvas-ctx-menu-set-image"),
      async onSelect() {
        const selectedPath = await filePicker.open({ filters: ANY_IMAGE_FILTER });
        if (selectedPath) patternStore.setReferenceImage(selectedPath);
      },
    },
    {
      icon: IconImageOff,
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

  if (editorStateStore.paletteMode === PaletteMode.Editing) return;

  await editorStateStore.selectedTool.main(createPatternEditorToolContext(detail));
}

async function handleToolAntiAction(detail: ToolEventDetail) {
  const pattern = patternStore.pattern;
  if (!pattern) return;

  if (editorStateStore.paletteMode === PaletteMode.Editing) return;

  await editorStateStore.selectedTool.anti?.(createPatternEditorToolContext(detail));
}

async function handleToolRelease(detail: ToolEventDetail) {
  const pattern = patternStore.pattern;
  if (!pattern) return;

  if (editorStateStore.paletteMode === PaletteMode.Editing) return;

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
      const fontName = fonts[index]!;
      failedFonts.push(fontName);
      LoggerService.error(`Failed to load symbol font "${fontName}": ${result.reason}`);
      return undefined;
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

<template>
  <div class="flex flex-col">
    <EditorWorkspaceTabs class="border-b border-default" />

    <div class="flex min-h-0 grow">
      <EditorWorkspaceToolbar class="border-r border-default p-1" />

      <ContextMenu :items="canvasContextMenuOptions">
        <PatternCanvas
          ref="patternCanvas"
          v-element-size="useDebounceFn(({ width, height }) => patternCanvas?.resizeCanvas(width, height), 100)"
          :pattern="patternStore.pattern!"
          :options="props.options"
          enable-tool-events
          class="grow"
          @tool-main-action="handleToolMainAction"
          @tool-anti-action="handleToolAntiAction"
          @tool-release="handleToolRelease"
          @transform="handleTransform"
        />
      </ContextMenu>
    </div>

    <div class="flex items-center justify-between border-t border-default px-2 py-1">
      <CanvasZoomControls
        :model-value="editorStateStore.canvasZoom"
        :min="MIN_SCALE"
        :max="MAX_SCALE"
        class="ml-auto w-full max-w-3xs"
        @update:model-value="(value) => patternCanvas?.setCanvasZoom(value)"
      />
    </div>
  </div>
</template>

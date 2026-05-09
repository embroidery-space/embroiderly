<script lang="ts" setup>
import { ContextMenu, useToast } from "@embroiderly/ui";
import type { ContextMenuItem } from "@embroiderly/ui";

import { vElementSize } from "@vueuse/components";
import { useDebounceFn } from "@vueuse/core";
import { computed, useTemplateRef, watch } from "vue";

import { IconImage, IconImageOff } from "~/assets/icons/";
import { PatternCanvas } from "~/components/canvas/";
import { useEditor, useFilePicker, useI18n } from "~/composables/";
import type { PatternApplicationOptions, ToolEventDetail, TransformEventDetail } from "~/lib/pixi/";
import { CursorTool } from "~/lib/tools/";
import type { PatternEditorToolContext } from "~/lib/tools/";
import { LoggerService } from "~/services/";
import { PaletteMode, useEditorStateStore, usePatternStore, usePatternFileStore } from "~/stores/";
import { addSymbolFonts } from "~/utils/font-face.ts";

const props = defineProps<{ options?: PatternApplicationOptions }>();

const { events, files } = useEditor();
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
        const handle = await filePicker.open({ types: filePicker.filters.image });
        if (handle) await patternStore.setReferenceImage(await handle.getFile());
      },
    },
    {
      icon: IconImageOff,
      label: fluent.$t("canvas-ctx-menu-remove-image"),
      color: "error",
      disabled: !patternStore.pattern.referenceImage,
      onSelect: () => patternStore.removeReferenceImage(),
    },
  ],
]);

events.on("pattern-info:update", (patternInfo) => {
  patternFileStore.updateOpenedPattern(patternStore.pattern.id, patternInfo.title);
});

watch(
  () => patternStore.pattern,
  async (pattern, oldPattern) => {
    if (pattern.isNil || pattern.id === oldPattern?.id) return;
    await loadSymbolFonts(pattern.palette.usedSymbolFonts);
  },
  { immediate: true },
);

watch(
  () => editorStateStore.selectedTool,
  (_tool, prevTool) => {
    if (patternStore.pattern.isNil) return;

    if (prevTool instanceof CursorTool) {
      // Blur the reference image when the cursor tool is deselected.
      patternCanvas.value?.blurReferenceImage();
    }
  },
  { immediate: true },
);

let ignoreNextWatch = false;
watch(
  () => editorStateStore.canvasZoom,
  (zoom) => {
    if (ignoreNextWatch) {
      ignoreNextWatch = false;
      return;
    }

    patternCanvas.value?.setCanvasZoom(zoom);
  },
);

async function handleToolMainAction(detail: ToolEventDetail) {
  if (patternStore.pattern.isNil || editorStateStore.paletteMode === PaletteMode.Editing) return;
  await editorStateStore.selectedTool.main(createPatternEditorToolContext(detail));
}

async function handleToolAntiAction(detail: ToolEventDetail) {
  if (patternStore.pattern.isNil || editorStateStore.paletteMode === PaletteMode.Editing) return;
  await editorStateStore.selectedTool.anti?.(createPatternEditorToolContext(detail));
}

async function handleToolRelease(detail: ToolEventDetail) {
  if (patternStore.pattern.isNil || editorStateStore.paletteMode === PaletteMode.Editing) return;
  if (detail.event.type !== "pointerupoutside") {
    // Call the `release` method only if the pointer is not released outside.
    await editorStateStore.selectedTool.release?.(createPatternEditorToolContext(detail));
  }
}

function handleTransform(detail: TransformEventDetail) {
  const scale = Math.round(detail.scale);
  if (editorStateStore.canvasZoom !== scale) {
    ignoreNextWatch = true;
    editorStateStore.canvasZoom = scale;
  }
}

function createPatternEditorToolContext(detail: ToolEventDetail): PatternEditorToolContext {
  return {
    ...detail,
    pattern: patternStore.pattern,
    api: {
      async addStitch(stitch) {
        const palindex = editorStateStore.selectedPaletteItemIndex;
        if (palindex !== undefined) {
          stitch.palindex = palindex;
          await patternStore.addStitch(editorStateStore.selectedLayerIndex, stitch);
        }
      },
      async removeStitch(stitch) {
        const palindex = editorStateStore.selectedPaletteItemIndex;
        if (palindex !== undefined) {
          stitch.palindex = palindex;
          await patternStore.removeStitch(editorStateStore.selectedLayerIndex, stitch);
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
  const results = await Promise.allSettled(
    fonts.map(async (font) => {
      // @ts-expect-error The `FontFace` constructor do accept `TypedArray`s.
      const fontFace = new FontFace(font, await files.loadFontContent(font));
      return fontFace.load();
    }),
  );
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
  <ContextMenu :items="canvasContextMenuOptions">
    <PatternCanvas
      ref="patternCanvas"
      v-element-size="useDebounceFn(({ width, height }) => patternCanvas?.resizeCanvas(width, height), 100)"
      :pattern="patternStore.pattern"
      :options="props.options"
      enable-tool-events
      class="size-full"
      @tool-main-action="handleToolMainAction"
      @tool-anti-action="handleToolAntiAction"
      @tool-release="handleToolRelease"
      @transform="handleTransform"
    />
  </ContextMenu>
</template>

<script lang="ts" setup>
import { ContextMenu, useToast } from "@embroiderly/ui";
import type { ContextMenuItem, ToolSelectItem } from "@embroiderly/ui";

import { computed, useTemplateRef, watch } from "vue";

import { PatternCanvas } from "~/components/canvas/";
import type { PatternCanvasProps } from "~/components/canvas/";
import { useEditor, useFilePicker, useI18n, useToolItems } from "~/composables/";
import type { PatternEditorTool, PatternEditorToolContext } from "~/lib/tools/";
import type { ToolEventDetail, TransformEventDetail } from "~/lib/types/";
import { LoggerService } from "~/services/";
import { PaletteMode, useEditorStateStore, usePatternStore, usePatternFileStore } from "~/stores/";
import { addSymbolFonts } from "~/utils/font-face.ts";

defineOptions({ inheritAttrs: false });

const props = defineProps<Omit<PatternCanvasProps, "pattern">>();

const { events, files } = useEditor();
const filePicker = useFilePicker();
const { fluent } = useI18n();
const toast = useToast();

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();

const patternCanvas = useTemplateRef<InstanceType<typeof PatternCanvas>>("patternCanvas");

const canvasContextMenuOptions = computed<ContextMenuItem[][]>(() => {
  const { fullstitches, petitestitches, halfstitches, quarterstitches, linestitches, nodestitches, eraser, cursor } =
    useToolItems();

  function toContextMenuItem(item: ToolSelectItem): ContextMenuItem {
    return {
      icon: item.icon,
      label: item.label,
      shortcut: item.shortcut,
      onSelect: () => (editorStateStore.selectedTool = item.value as PatternEditorTool),
    };
  }

  return [
    [
      {
        label: fluent.$t("canvas-ctx-menu-tools"),
        children: [
          toContextMenuItem(fullstitches.value[0]!),
          {
            icon: "stitch-petite",
            label: fluent.$t("stitch-petite"),
            children: petitestitches.value.map(toContextMenuItem),
          },
          {
            icon: "stitch-half",
            label: fluent.$t("stitch-half"),
            children: halfstitches.value.map(toContextMenuItem),
          },
          {
            icon: "stitch-quarter",
            label: fluent.$t("stitch-quarter"),
            children: quarterstitches.value.map(toContextMenuItem),
          },
          {
            icon: "stitch-back",
            label: fluent.$t("stitch-line"),
            children: linestitches.value.map(toContextMenuItem),
          },
          {
            icon: "stitch-french-knot",
            label: fluent.$t("stitch-node"),
            children: nodestitches.value.map(toContextMenuItem),
          },
          { type: "separator" },
          toContextMenuItem(eraser.value[0]!),
          toContextMenuItem(cursor.value[0]!),
        ],
      },
      {
        label: fluent.$t("canvas-ctx-menu-image"),
        children: [
          {
            icon: "image",
            label: fluent.$t("canvas-ctx-menu-image-set"),
            async onSelect() {
              const handle = await filePicker.open({
                types: filePicker.filters.image,
                id: filePicker.ids.image,
              });
              if (handle) await patternStore.setReferenceImage(await handle.getFile());
            },
          },
          {
            icon: "image-off",
            label: fluent.$t("canvas-ctx-menu-image-remove"),
            color: "error",
            disabled: !patternStore.pattern.referenceImage,
            onSelect: () => patternStore.removeReferenceImage(),
          },
        ],
      },
    ],
  ];
});

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
  () => {
    if (patternStore.pattern.isNil) return;
    patternCanvas.value?.blurReferenceImage();
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
        await patternStore.removeStitch(editorStateStore.selectedLayerIndex, stitch);
      },
      async removeStitchAt(x, y) {
        await patternStore.removeStitchAt(editorStateStore.selectedLayerIndex, x, y);
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
        clear() {
          patternCanvas.value?.clearHint();
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
      v-bind="{ ...$attrs, ...props }"
      :pattern="patternStore.pattern"
      @tool-main-action="handleToolMainAction"
      @tool-anti-action="handleToolAntiAction"
      @tool-release="handleToolRelease"
      @transform="handleTransform"
    />
  </ContextMenu>
</template>

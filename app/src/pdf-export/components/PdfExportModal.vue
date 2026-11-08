<script setup lang="ts">
import { PdfExportService } from "@embroiderly/pdf-export";
import {
  BlockUI,
  Button,
  Dialog,
  Pagination,
  Progress,
  Splitter,
  SplitterPanel,
  ToolToggleGroup,
  ToolToggle,
  useConfirm,
  useToast,
  Separator,
} from "@embroiderly/ui";

import { refAutoReset, useDebounceFn, useThrottleFn } from "@vueuse/core";
import { isEqual } from "es-toolkit";
import { ref, computed, onMounted, onUnmounted, toRaw, watch, useTemplateRef } from "vue";

import {
  IconCheck,
  IconCode,
  IconDownload,
  IconFileStorage,
  IconSave,
  IconSettings,
  IconSplitView,
  IconVisibility,
} from "~/assets/icons/";
import { useEditor, useFilePicker, useI18n } from "~/composables/";
import { PatternPdf, PdfAsset } from "~/lib/pattern/";
import { LoggerService, MetricsService } from "~/services/";
import { useSettingsStore } from "~/settings/";
import { usePatternStore } from "~/stores/";

import {
  useTypstEditorStateStore,
  TypstEditorViewMode,
  TypstEditorAsideBlock,
} from "../stores/useTypstEditorStateStore.ts";

import TypstAssets from "./TypstAssets.vue";
import TypstEditor from "./TypstEditor.vue";
import TypstSettings from "./TypstSettings.vue";

const open = defineModel<boolean>("open", { default: false });

const patternStore = usePatternStore();
const settingsStore = useSettingsStore();

const typstEditorStateStore = useTypstEditorStateStore();

const { editor: patternEditor, files: patternFiles } = useEditor();
const filePicker = useFilePicker();
const { fluent } = useI18n();
const confirm = useConfirm();
const toast = useToast();

const service = new PdfExportService();

const typstEditor = useTemplateRef("typst-editor");
const canvas = useTemplateRef("canvas");

const pdf = ref(new PatternPdf(structuredClone(toRaw(patternStore.pattern.pdf))));
const isDirty = computed(() => !isEqual(patternStore.pattern.pdf, pdf.value));

const totalPages = ref<number>();
const currentPage = ref(1);

const isDark = computed(() => {
  return settingsStore.ui.theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : settingsStore.ui.theme === "dark";
});

let forceClosing = false;
watch(open, async (value) => {
  if (value || forceClosing || !isDirty.value) return;

  open.value = true; // Reka UI flips this to `false` on its own; revert immediately.

  const accepted = await confirm.open(fluent.$ta("pdf-export-unsaved-changes")).result;
  if (accepted === undefined) return;
  else if (accepted) await patternStore.updatePatternPdf(pdf.value);

  forceClosing = true;
  open.value = false;
});

watch(
  () => pdf.value.template,
  useDebounceFn((template) => updatePreview({ template, page: currentPage.value }), 1000),
);
watch(
  currentPage,
  useThrottleFn((page) => updatePreview({ page }), 1000),
);

const previewInProgress = ref(false);
async function updatePreview(options?: { template?: string; page?: number }) {
  previewInProgress.value = true;
  try {
    if (options?.template !== undefined) {
      const { output, diagnostics } = await service.compileDocument(options.template);
      if (output !== null) totalPages.value = output;

      typstEditor.value?.setDiagnostics(diagnostics);
    }
    if (options?.page !== undefined) await service.preview(options.page - 1);
  } catch (err) {
    LoggerService.error(`Failed to update the PDF preview: ${err}`);
  } finally {
    previewInProgress.value = false;
  }
}

const exportInProgress = ref(false);
const documentExported = refAutoReset(false, 1000);
async function exportDocument() {
  const handle = await filePicker.save({
    suggestedName: `${patternStore.pattern.info.title ?? "pattern"}.pdf`,
    types: filePicker.filters.pdf,
    id: filePicker.ids.pdf,
  });
  if (!handle) return;

  try {
    exportInProgress.value = true;

    const { output, diagnostics } = await service.export();
    if (output === null) {
      LoggerService.error(`Failed to export pattern as PDF: ${diagnostics}`);
      toast.add({ color: "error", title: fluent.$t("pattern-export-failure"), duration: 3000 });
      return;
    }

    const writable = await handle.createWritable();
    // @ts-expect-error `Uint8Array` works just fine here.
    await writable.write(output);
    await writable.close();

    documentExported.value = true;

    MetricsService.capturePatternExportedAsPdf();
  } catch (err) {
    LoggerService.error(`Failed to export pattern as PDF: ${err}`);
    toast.add({ color: "error", title: fluent.$t("pattern-export-failure"), duration: 3000 });
  } finally {
    exportInProgress.value = false;
  }
}

const saveInProgress = ref(false);
const templateSaved = refAutoReset(false, 1000);
async function saveTemplate() {
  try {
    saveInProgress.value = true;

    await patternStore.updatePatternPdf(pdf.value);

    templateSaved.value = true;
  } catch (err) {
    LoggerService.error(`Failed to save Typst template: ${err}`);
    toast.add({ color: "error", duration: 3000, ...fluent.$ta("pdf-export-save-template-failed") });
  } finally {
    saveInProgress.value = false;
  }
}

async function loadFonts(fonts: string[]) {
  const results = await Promise.allSettled(
    fonts.map(async (resource) => {
      // Text fonts bundled within the app.
      if (resource.startsWith("/fonts/")) {
        return new PdfAsset({
          fileName: resource.slice(7),
          content: new Uint8Array((await fetch(resource).then((r) => r.arrayBuffer())) as ArrayBuffer),
        });
      }

      // Symbol fonts uploaded into the app by the user.
      return new PdfAsset({
        fileName: `${resource}.ttf`,
        content: await patternFiles.loadFontContent(resource),
      });
    }),
  );

  const { succeededFonts, failedFonts } = results.reduce<{ succeededFonts: PdfAsset[]; failedFonts: string[] }>(
    (acc, result, index) => {
      if (result.status === "fulfilled") {
        acc.succeededFonts.push(result.value);
        return acc;
      }

      const fontName = fonts[index]!;

      acc.failedFonts.push(fontName);
      LoggerService.error(`Failed to load symbol font "${fontName}": ${result.reason}`);

      return acc;
    },
    { succeededFonts: [], failedFonts: [] },
  );

  if (failedFonts.length) {
    const failedFontsMessage = fluent.$ta("canvas-symbol-fonts-load-failure", { fonts: failedFonts.join(", ") });
    const { title, description } = failedFontsMessage as { title: string; description: string };
    toast.add({ title, description, color: "error" });
  }

  return succeededFonts;
}

async function addFiles(files: PdfAsset[]) {
  await service.addFiles(PdfAsset.serialize(files));
  await updatePreview({ template: pdf.value.template, page: currentPage.value });
  pdf.value.files.push(...files);
}

async function removeFile(index: number, fileName: string) {
  await service.removeFile(fileName);
  await updatePreview({ template: pdf.value.template, page: currentPage.value });
  pdf.value.files.splice(index, 1);
}

async function addFonts(fonts: PdfAsset[]) {
  await service.addFonts(PdfAsset.serialize(fonts));
  await updatePreview({ template: pdf.value.template, page: currentPage.value });
  pdf.value.fonts.push(...fonts);
}

async function removeFont(index: number, fileName: string) {
  await service.removeFont(fileName);
  await updatePreview({ template: pdf.value.template, page: currentPage.value });
  pdf.value.fonts.splice(index, 1);
}

onMounted(async () => {
  const pattern = await patternEditor.loadPattern(patternStore.pattern.id);
  const baseFonts = await loadFonts([
    "/fonts/FixelVariable.ttf",
    "/fonts/FixelVariableItalic.ttf",
    ...patternStore.pattern.palette.usedSymbolFonts,
  ]);

  await service.init(
    canvas.value!.transferControlToOffscreen(),
    pattern,
    PdfAsset.serialize(pdf.value.files),
    PdfAsset.serialize([...baseFonts, ...pdf.value.fonts]),
  );

  await updatePreview({ template: pdf.value.template, page: currentPage.value });
});

onUnmounted(() => service.destroy());
</script>

<template>
  <Dialog v-model:open="open" fullscreen :dismissible="false" :title="$t('pdf-export')" :class="$style.dialog">
    <template #body>
      <div :class="$style.aside">
        <ToolToggle
          :model-value="typstEditorStateStore.activeAsideBlock === TypstEditorAsideBlock.Assets"
          :icon="IconFileStorage"
          :tooltip="$t('pdf-export-assets')"
          :tooltip-options="{ side: 'right' }"
          @update:model-value="typstEditorStateStore.toggleAsideBlock(TypstEditorAsideBlock.Assets)"
        />

        <Separator />

        <ToolToggleGroup
          v-model="typstEditorStateStore.viewMode"
          orientation="vertical"
          :items="[
            {
              icon: IconCode,
              value: TypstEditorViewMode.Code,
              tooltip: $t('pdf-export-view-mode-code'),
            },
            {
              icon: IconSplitView,
              value: TypstEditorViewMode.SplitView,
              tooltip: $t('pdf-export-view-mode-split-view'),
            },
            {
              icon: IconVisibility,
              value: TypstEditorViewMode.Preview,
              tooltip: $t('pdf-export-view-mode-preview'),
            },
          ]"
          :tooltip-options="{ side: 'right' }"
        />

        <ToolToggle
          :model-value="typstEditorStateStore.activeAsideBlock === TypstEditorAsideBlock.Settings"
          :icon="IconSettings"
          :tooltip="$t('pdf-export-settings')"
          :tooltip-options="{ side: 'right' }"
          style="margin-top: auto"
          @update:model-value="typstEditorStateStore.toggleAsideBlock(TypstEditorAsideBlock.Settings)"
        />
      </div>

      <TypstAssets
        v-if="typstEditorStateStore.activeAsideBlock === TypstEditorAsideBlock.Assets"
        :files="pdf.files"
        :fonts="pdf.fonts"
        :class="$style.asideBlock"
        @add-files="addFiles"
        @remove-file="removeFile"
        @add-fonts="addFonts"
        @remove-font="removeFont"
      />

      <TypstSettings
        v-if="typstEditorStateStore.activeAsideBlock === TypstEditorAsideBlock.Settings"
        v-model:wrap-lines="typstEditorStateStore.wrapLines"
        :class="$style.asideBlock"
      />

      <div :class="$style.toolbar">
        <Button
          :loading="saveInProgress"
          variant="outline"
          :icon="templateSaved ? IconCheck : IconSave"
          :label="$t('pdf-export-save-template')"
          style="margin-left: auto"
          @click="saveTemplate"
        />

        <Button
          :loading="exportInProgress"
          :icon="documentExported ? IconCheck : IconDownload"
          :label="$t('pdf-export-export-document')"
          @click="exportDocument"
        />
      </div>

      <Splitter direction="horizontal" :class="$style.splitter">
        <SplitterPanel v-show="typstEditorStateStore.viewMode !== TypstEditorViewMode.Preview" :min-size="10">
          <TypstEditor
            ref="typst-editor"
            v-model="pdf.template"
            :dark="isDark"
            :wrap-lines="typstEditorStateStore.wrapLines"
          />
        </SplitterPanel>

        <SplitterPanel
          v-show="typstEditorStateStore.viewMode !== TypstEditorViewMode.Code"
          :min-size="10"
          :class="$style.previewPanel"
        >
          <BlockUI :blocked="previewInProgress" :class="$style.previewContent">
            <Progress v-if="previewInProgress" size="sm" :class="$style.previewProgress" />
            <canvas ref="canvas"></canvas>
          </BlockUI>

          <div :class="$style.previewFooter">
            <Pagination
              v-model:page="currentPage"
              show-edges
              :total="totalPages"
              :items-per-page="1"
              :class="$style.previewPagination"
            />
          </div>
        </SplitterPanel>
      </Splitter>
    </template>
  </Dialog>
</template>

<style module>
.dialog[data-slot="content"] > [data-slot="body"] {
  display: grid;
  grid-template: "aside settings toolbar" auto "aside settings main" 1fr / auto auto 1fr;

  padding: 0;
}

.toolbar {
  display: flex;
  grid-area: toolbar;
  gap: calc(var(--spacing) * 2);
  align-items: center;

  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
  border-bottom: 1px solid var(--border-color-default);
}

.aside {
  display: flex;
  grid-area: aside;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);

  height: 100%;
  padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 2);
  border-right: 1px solid var(--border-color-default);
}

.aside-block {
  grid-area: settings;

  width: var(--container-3xs);
  height: 100%;
  border-right: 1px solid var(--border-color-default);
}

.splitter {
  grid-area: main;
}

.preview-panel {
  display: flex;
  flex-direction: column;

  /* gap: calc(var(--spacing) * 8); */
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 100%;

  /* Ensure the panel doesn't overflow its parent container. */
  min-height: 0;
}

.preview-content {
  display: flex;

  /* Allow the canvas wrapper to absorb remaining space while allowing shrinking. */
  flex: 1 1 0%;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 0;

  padding: calc(var(--spacing) * 4);

  canvas {
    max-width: 100%;
    max-height: 100%;

    object-fit: contain;
  }
}

.preview-progress {
  position: absolute;
  top: 0;

  border-radius: 0;
}

.preview-footer {
  overflow: auto;

  width: 100%;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
  border-top: 1px solid var(--border-color-default);
}

.preview-pagination {
  width: fit-content;
  margin: 0 auto;
}
</style>

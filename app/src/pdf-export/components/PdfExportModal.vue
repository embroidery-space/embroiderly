<script setup lang="ts">
import { PdfExportService } from "@embroiderly/pdf-export";
import {
  BlockUI,
  Button,
  Dialog,
  DropdownMenu,
  FormFieldGroup,
  Pagination,
  Progress,
  Splitter,
  SplitterPanel,
  Switch,
  useConfirm,
  useToast,
} from "@embroiderly/ui";
import type { DropdownMenuItem } from "@embroiderly/ui";

import { useDebounceFn, useThrottleFn } from "@vueuse/core";
import { isEqual } from "es-toolkit";
import { ref, computed, onMounted, onUnmounted, toRaw, watch, nextTick, useTemplateRef } from "vue";

import { IconChevronDown } from "~/assets/icons/";
import { useEditor, useFilePicker, useI18n } from "~/composables/";
import { PatternPdf } from "~/lib/pattern/";
import { LoggerService, MetricsService } from "~/services/";
import { useSettingsStore } from "~/settings/";
import { usePatternStore } from "~/stores/";

import TypstEditor from "./TypstEditor.vue";

const open = defineModel<boolean>("open", { default: false });

const patternStore = usePatternStore();
const settingsStore = useSettingsStore();

const { editor, files } = useEditor();
const filePicker = useFilePicker();
const { fluent } = useI18n();
const confirm = useConfirm();
const toast = useToast();

const service = new PdfExportService();

const canvas = useTemplateRef("canvas");

const pdf = ref(new PatternPdf(toRaw(patternStore.pattern.pdf)));
const isDirty = computed(() => !isEqual(patternStore.pattern.pdf, pdf.value));

const totalPages = ref<number>();
const currentPage = ref(1);

const isDark = computed(() => {
  return settingsStore.ui.theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : settingsStore.ui.theme === "dark";
});

const exportItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: fluent.$t("pdf-export-export-document-monochrome"),
      onSelect: () => exportDocument(new PatternPdf({ ...pdf.value, color: false })),
    },
    {
      label: fluent.$t("pdf-export-export-document-color"),
      onSelect: () => exportDocument(new PatternPdf({ ...pdf.value, color: true })),
    },
  ],
]);

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
  pdf,
  useDebounceFn((pdf) => updatePreview({ pdf, page: currentPage.value }), 1000),
  { deep: true },
);
watch(
  currentPage,
  useThrottleFn((page) => updatePreview({ page }), 1000),
);

const previewInProgress = ref(false);
async function updatePreview(options?: { pdf?: PatternPdf; page?: number }) {
  previewInProgress.value = true;
  try {
    if (options?.pdf !== undefined) {
      totalPages.value = await service.buildDocument(PatternPdf.serialize(options.pdf));
    }
    if (options?.page !== undefined) await service.preview(options.page - 1);
  } catch {
    // If the error occurs, the template is invalid.
  } finally {
    previewInProgress.value = false;
  }
}

const exportInProgress = ref(false);
async function exportDocument(pdf: PatternPdf) {
  const handle = await filePicker.save({
    suggestedName: `${patternStore.pattern.info.title ?? "pattern"}.${pdf.color ? "color" : "monochrome"}.pdf`,
    types: filePicker.filters.pdf,
    id: filePicker.ids.pdf,
  });
  if (!handle) return;

  try {
    exportInProgress.value = true;

    const pdfBytes = await service.export(PatternPdf.serialize(pdf));

    const writable = await handle.createWritable();
    // @ts-expect-error `Uint8Array` works just fine here.
    await writable.write(pdfBytes);
    await writable.close();

    MetricsService.capturePatternExportedAsPdf(pdf.color);
    toast.add({ color: "success", title: fluent.$t("pattern-export-success"), duration: 3000 });
  } catch (err) {
    LoggerService.error(`Failed to export pattern as PDF: ${err}`);
    toast.add({ color: "error", title: fluent.$t("pattern-export-failure"), duration: 3000 });
  } finally {
    exportInProgress.value = false;
  }
}

async function saveTemplate() {
  await patternStore.updatePatternPdf(pdf.value);

  // Close the modal next tick, so that the pattern in the store is updated and `isDirty` becomes `false`.
  await nextTick();
  open.value = false;
}

function close() {
  open.value = false; // The watcher above handles the confirmation.
}

onMounted(async () => {
  const patternData = await editor.loadPattern(patternStore.pattern.id);
  const fontData = await Promise.all(
    [...patternStore.pattern.palette.usedSymbolFonts, "/fonts/FixelVariable.ttf", "/fonts/FixelVariableItalic.ttf"].map(
      async (resource) => {
        if (resource.startsWith("/fonts/")) {
          return new Uint8Array((await fetch(resource).then((r) => r.arrayBuffer())) as ArrayBuffer);
        }
        return files.loadFontContent(resource);
      },
    ),
  );

  await service.init(canvas.value!.transferControlToOffscreen(), patternData, fontData);

  await updatePreview({ pdf: pdf.value, page: currentPage.value });
});

onUnmounted(() => service.destroy());
</script>

<template>
  <Dialog v-model:open="open" fullscreen :dismissible="false" :title="$t('pdf-export')" :class="$style.dialog">
    <template #body>
      <div :class="$style.toolbar">
        <Switch v-model="pdf.color" :label="$t('pdf-export-color')" />

        <FormFieldGroup>
          <Button :loading="exportInProgress" :label="$t('pdf-export-export-document')" @click="exportDocument(pdf)" />
          <DropdownMenu :items="exportItems" :modal="false" :content="{ align: 'end' }">
            <Button :disabled="exportInProgress" :icon="IconChevronDown" />
          </DropdownMenu>
        </FormFieldGroup>
      </div>

      <Splitter direction="horizontal">
        <SplitterPanel>
          <TypstEditor v-model="pdf.template" :dark="isDark" />
        </SplitterPanel>

        <SplitterPanel :class="$style.previewPanel">
          <BlockUI :blocked="previewInProgress" :class="$style.previewContent">
            <Progress v-if="previewInProgress" size="sm" :class="$style.previewProgress" />
            <canvas ref="canvas"></canvas>
          </BlockUI>

          <Pagination
            v-model:page="currentPage"
            show-edges
            :total="totalPages"
            :items-per-page="1"
            :class="$style.previewPagination"
          />
        </SplitterPanel>
      </Splitter>
    </template>

    <template #footer>
      <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="close" />
      <Button loading-auto :label="$t('pdf-export-save-template')" @click="saveTemplate" />
    </template>
  </Dialog>
</template>

<style module>
.dialog[data-slot="content"] > [data-slot="body"] {
  display: grid;
  grid-template-rows: auto 1fr;

  padding: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
  border-bottom: 1px solid var(--border-color-default);
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

  padding: calc(var(--spacing) * 8);

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

.preview-pagination {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 8);
  border-top: 1px solid var(--border-color-default);
}
</style>

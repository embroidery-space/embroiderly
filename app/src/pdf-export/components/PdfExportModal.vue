<script setup lang="ts">
import { PdfExportService } from "@embroiderly/pdf-export";
import {
  Button,
  Dialog,
  DropdownMenu,
  FormFieldGroup,
  Splitter,
  SplitterPanel,
  Switch,
  useConfirm,
  useToast,
} from "@embroiderly/ui";
import type { DropdownMenuItem } from "@embroiderly/ui";

import { isEqual } from "es-toolkit";
import { ref, computed, onMounted, onUnmounted, toRaw, watch, nextTick } from "vue";

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

const pdf = ref(new PatternPdf(toRaw(patternStore.pattern.pdf)));
const isDirty = computed(() => !isEqual(patternStore.pattern.pdf, pdf.value));

const isDark = computed(() => {
  return settingsStore.ui.theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : settingsStore.ui.theme === "dark";
});

const exportItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: fluent.$t("pdf-export-export-document-monochrome"),
      onSelect: () => handleExport(new PatternPdf({ ...pdf.value, color: false })),
    },
    {
      label: fluent.$t("pdf-export-export-document-color"),
      onSelect: () => handleExport(new PatternPdf({ ...pdf.value, color: true })),
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

function handleClose() {
  open.value = false; // The watcher above handles the confirmation.
}

async function handleSave() {
  await patternStore.updatePatternPdf(pdf.value);

  // Close the modal next tick, so that the pattern in the store is updated and `isDirty` becomes `false`.
  await nextTick();
  open.value = false;
}

const isExporting = ref(false);
async function handleExport(pdf: PatternPdf) {
  const handle = await filePicker.save({
    suggestedName: `${patternStore.pattern.info.title ?? "pattern"}.${pdf.color ? "color" : "monochrome"}.pdf`,
    types: filePicker.filters.pdf,
    id: filePicker.ids.pdf,
  });
  if (!handle) return;

  try {
    isExporting.value = true;

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
    isExporting.value = false;
  }
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

  await service.start(patternData, fontData);
});

onUnmounted(() => service.destroy());
</script>

<template>
  <Dialog v-model:open="open" fullscreen :dismissible="false" :title="$t('pdf-export')" :class="$style.dialog">
    <template #body>
      <div :class="$style.toolbar">
        <Switch v-model="pdf.color" :label="$t('pdf-export-color')" />

        <FormFieldGroup>
          <Button :loading="isExporting" :label="$t('pdf-export-export-document')" @click="handleExport(pdf)" />
          <DropdownMenu :items="exportItems" :modal="false" :content="{ align: 'end' }">
            <Button :disabled="isExporting" :icon="IconChevronDown" />
          </DropdownMenu>
        </FormFieldGroup>
      </div>

      <Splitter direction="horizontal">
        <SplitterPanel>
          <TypstEditor v-model="pdf.template" :dark="isDark" />
        </SplitterPanel>
      </Splitter>
    </template>

    <template #footer>
      <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="handleClose" />
      <Button loading-auto :label="$t('pdf-export-save-template')" @click="handleSave" />
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
</style>

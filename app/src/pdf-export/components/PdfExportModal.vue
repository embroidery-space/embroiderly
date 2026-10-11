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
  useToast,
} from "@embroiderly/ui";
import type { DropdownMenuItem } from "@embroiderly/ui";

import { ref, computed, onMounted, onUnmounted } from "vue";

import { IconChevronDown } from "~/assets/icons/";
import { useEditor, useFilePicker, useI18n } from "~/composables/";
import { Pattern, PatternPdf } from "~/lib/pattern/";
import { LoggerService, MetricsService } from "~/services/";
import { useSettingsStore } from "~/settings/";

import TypstEditor from "./TypstEditor.vue";

const props = defineProps<{ patternId: string }>();

const settingsStore = useSettingsStore();

const { editor, files } = useEditor();
const filePicker = useFilePicker();
const { fluent } = useI18n();
const toast = useToast();

const service = new PdfExportService();

const title = ref<string>();
const pdf = ref(new PatternPdf());

const isDark = computed(() => {
  return settingsStore.ui.theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : settingsStore.ui.theme === "dark";
});

const exportItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: fluent.$t("pdf-export-export-document-monochrome"),
      onSelect: () => exportPattern(new PatternPdf({ ...pdf.value, color: false })),
    },
    {
      label: fluent.$t("pdf-export-export-document-color"),
      onSelect: () => exportPattern(new PatternPdf({ ...pdf.value, color: true })),
    },
  ],
]);

const isExporting = ref(false);
async function exportPattern(pdf: PatternPdf) {
  const handle = await filePicker.save({
    suggestedName: `${title.value ?? "pattern"}.${pdf.color ? "color" : "monochrome"}.pdf`,
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
  const patternData = await editor.loadPattern(props.patternId);
  const pattern = Pattern.deserialize(patternData);

  title.value = pattern.info.title;
  pdf.value = pattern.pdf;

  const fontData = await Promise.all(
    [...pattern.palette.usedSymbolFonts, "/fonts/FixelVariable.ttf", "/fonts/FixelVariableItalic.ttf"].map(
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
  <Dialog fullscreen :dismissible="false" :title="$t('pdf-export')" :class="$style.dialog">
    <template #body>
      <div :class="$style.toolbar">
        <Switch v-model="pdf.color" :label="$t('pdf-export-color')" />

        <FormFieldGroup>
          <Button :loading="isExporting" :label="$t('pdf-export-export-document')" @click="exportPattern(pdf)" />
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

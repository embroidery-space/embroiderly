<script setup lang="ts">
import { Button, Checkbox, Dialog, FilePicker, FormFieldSet } from "@embroiderly/ui";
import { basename } from "@tauri-apps/api/path";

import { computedAsync, refAutoReset } from "@vueuse/core";
import { ref } from "vue";

import { useFilePicker } from "~/composables/";
import { PDF_FILTER } from "~/constants/";
import { PdfExportOptions } from "~/modules/pattern-editor/lib/pattern/";

import PdfExportOptionsForm from "./PdfExportOptionsForm.vue";

const props = defineProps<{
  filePath: string;
  options: PdfExportOptions;
  onOptionsUpdate?: (options: PdfExportOptions) => void | Promise<void>;
  onDocumentExport?: (filePath: string, options: PdfExportOptions) => void | Promise<void>;
}>();
const emit = defineEmits<{ close: [] }>();

const filePicker = useFilePicker();

// Copy the data from the props to a reactive object.
const options = ref<PdfExportOptions>(new PdfExportOptions(props.options));

const filePath = ref(props.filePath);
const pdfFile = computedAsync(
  async () => {
    const fileName = filePath.value ? await basename(filePath.value, ".pdf") : "";
    return {
      base: `${fileName}.pdf`,
      monochrome: `${fileName}.monochrome.pdf`,
      color: `${fileName}.color.pdf`,
    };
  },
  { base: "", monochrome: "", color: "" },
);

const optionsUpdated = refAutoReset(false, 1000);
async function updateOptions() {
  await props.onOptionsUpdate?.(options.value);
  optionsUpdated.value = true;
}

async function exportPattern() {
  await props.onDocumentExport?.(filePath.value, options.value);
}
</script>

<template>
  <Dialog :title="$t('pdf-export')" :ui="{ content: 'w-xl' }">
    <template #body>
      <div class="flex flex-col gap-y-4">
        <FilePicker
          v-model="filePath"
          class="w-full"
          @pick="
            async () => {
              const path = await filePicker.save(filePath, { filters: PDF_FILTER });
              if (path) filePath = path;
            }
          "
        />

        <div class="flex flex-col gap-y-1">
          <Checkbox
            v-model="options.monochrome"
            :label="$t('pdf-export-monochrome')"
            :description="pdfFile.monochrome"
          />
          <Checkbox v-model="options.color" :label="$t('pdf-export-color')" :description="pdfFile.color" />
        </div>

        <FormFieldSet collapsible :legend="$t('publish-settings')">
          <PdfExportOptionsForm v-model="options" />
        </FormFieldSet>
      </div>
    </template>
    <template #footer>
      <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <Button
        loading-auto
        variant="outline"
        :label="$t('pdf-export-save-settings')"
        :icon="optionsUpdated ? 'lucide:check' : undefined"
        @click="updateOptions"
      />
      <Button v-if="filePath" loading-auto :label="$t('pdf-export-export-document')" @click="exportPattern" />
    </template>
  </Dialog>
</template>

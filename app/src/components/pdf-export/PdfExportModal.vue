<script setup lang="ts">
import type { PdfVariant } from "@embroiderly/pdf-export";
import { Button, Dialog, DropdownMenu, FormFieldGroup, RadioGroup } from "@embroiderly/ui";
import type { DropdownMenuItem, RadioGroupItem } from "@embroiderly/ui";

import { refAutoReset } from "@vueuse/core";
import { computed, ref, toRaw } from "vue";

import { IconCheck, IconChevronDown } from "~/assets/icons/";
import { useI18n } from "~/composables/";
import { PdfExportOptions } from "~/lib/pattern/";

import PdfExportOptionsForm from "./PdfExportOptionsForm.vue";

const props = defineProps<{
  options: PdfExportOptions;
  fabricWidth: number;
  fabricHeight: number;
  onOptionsUpdate?: (options: PdfExportOptions) => void | Promise<void>;
  onDocumentExport?: (variant: PdfVariant) => void | Promise<void>;
}>();
const emit = defineEmits<{ close: [] }>();

const { fluent } = useI18n();

const options = ref<PdfExportOptions>(new PdfExportOptions(toRaw(props.options)));
const variant = ref<PdfVariant>("monochrome");

const variantItems = computed<RadioGroupItem[]>(() => [
  { value: "monochrome", label: fluent.$t("pdf-export-variant-monochrome") },
  { value: "color", label: fluent.$t("pdf-export-variant-color") },
]);
const exportItems = computed<DropdownMenuItem[][]>(() => [
  [
    { label: fluent.$t("pdf-export-variant-monochrome"), onSelect: () => exportPattern("monochrome") },
    { label: fluent.$t("pdf-export-variant-color"), onSelect: () => exportPattern("color") },
  ],
]);

const optionsUpdated = refAutoReset(false, 1000);
async function updateOptions() {
  await props.onOptionsUpdate?.(options.value);
  optionsUpdated.value = true;
}

const isExporting = ref(false);
async function exportPattern(variant: PdfVariant) {
  try {
    isExporting.value = true;
    await props.onDocumentExport?.(variant);
  } finally {
    isExporting.value = false;
  }
}
</script>

<template>
  <Dialog :title="$t('pdf-export')">
    <template #body>
      <RadioGroup v-model="variant" :items="variantItems" />
      <PdfExportOptionsForm
        v-model="options"
        :fabric-width="props.fabricWidth"
        :fabric-height="props.fabricHeight"
        class="mt-2"
      />
    </template>
    <template #footer>
      <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <Button
        loading-auto
        variant="outline"
        :label="$t('pdf-export-save-settings')"
        :icon="optionsUpdated ? IconCheck : undefined"
        @click="updateOptions"
      />
      <FormFieldGroup>
        <Button :loading="isExporting" :label="$t('pdf-export-export-document')" @click="exportPattern(variant)" />
        <DropdownMenu :items="exportItems" :modal="false" :content="{ align: 'end' }">
          <Button color="primary" variant="solid" :disabled="isExporting" :icon="IconChevronDown" />
        </DropdownMenu>
      </FormFieldGroup>
    </template>
  </Dialog>
</template>

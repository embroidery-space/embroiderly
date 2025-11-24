<template>
  <UModal :title="$t('pdf-export')" :ui="{ content: 'w-xl' }">
    <template #body>
      <div class="flex flex-col gap-y-4">
        <FilePicker v-model="filePath" mode="save" :options="{ filters: PDF_FILTER }" class="w-full" />

        <div class="flex flex-col gap-y-1">
          <UCheckbox
            v-model="options.monochrome"
            :label="$t('pdf-export-monochrome')"
            :description="pdfFile.monochrome"
          />
          <UCheckbox v-model="options.color" :label="$t('pdf-export-color')" :description="pdfFile.color" />
        </div>

        <UCollapsible class="flex flex-col gap-x-2">
          <UButton
            block
            color="neutral"
            variant="subtle"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('publish-settings')"
            :ui="{
              base: 'group',
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
          />
          <template #content>
            <PdfPublishForm v-model="options" />
          </template>
        </UCollapsible>
      </div>
    </template>
    <template #footer>
      <UButton :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton
        :label="$t('pdf-export-save-settings')"
        variant="outline"
        :icon="optionsUpdated ? 'i-lucide:check' : undefined"
        @click="updateOptions"
      />
      <UButton
        v-if="filePath"
        :label="$t('pdf-export-export-document')"
        :loading="exportingPattern"
        @click="exportPattern"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { basename } from "@tauri-apps/api/path";

  import { computedAsync, refAutoReset } from "@vueuse/core";
  import { ref } from "vue";

  import { PdfExportOptions } from "~/core/pattern/";
  import { PDF_FILTER } from "~/shared/constants/";

  const props = defineProps<{ filePath: string; options: PdfExportOptions }>();
  const emit = defineEmits<{ close: [] }>();

  const patternsStore = usePatternsStore();

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
    await patternsStore.updatePdfExportOptions(options.value);
    optionsUpdated.value = true;
  }

  const exportingPattern = ref(false);
  async function exportPattern() {
    try {
      exportingPattern.value = true;
      await patternsStore.exportPatternAsPdf(filePath.value, options.value);
    } finally {
      exportingPattern.value = false;
    }
  }
</script>

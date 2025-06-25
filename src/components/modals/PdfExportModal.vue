<template>
  <NuxtModal :title="$t('title-pdf-export')">
    <template #body>
      <div class="flex flex-col gap-y-4">
        <NuxtButtonGroup class="w-full">
          <NuxtButton :label="$t('label-choose-file')" @click="chooseFile" />
          <NuxtInput :model-value="pdfFile.base" readonly class="w-full" />
        </NuxtButtonGroup>

        <div class="flex flex-col gap-y-1">
          <NuxtCheckbox
            v-model="options.monochrome"
            :label="$t('label-pdf-export-monochrome')"
            :description="pdfFile.monochrome"
          />
          <NuxtCheckbox v-model="options.color" :label="$t('label-pdf-export-color')" :description="pdfFile.color" />
        </div>

        <NuxtCollapsible class="flex flex-col gap-x-2">
          <NuxtButton
            block
            color="neutral"
            variant="subtle"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('title-publish-settings')"
            :ui="{
              base: 'group',
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
          />
          <template #content>
            <PdfPublishForm v-model:options="options" />
          </template>
        </NuxtCollapsible>
      </div>
    </template>
    <template #footer>
      <NuxtButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <NuxtButton
        :label="$t('label-save-settings')"
        variant="outline"
        :icon="optionsUpdated ? 'i-lucide:check' : undefined"
        @click="updateOptions"
      />
      <NuxtButton
        v-if="filePath"
        :label="$t('label-export-document')"
        :loading="exportingPattern"
        @click="exportPattern"
      />
    </template>
  </NuxtModal>
</template>

<script setup lang="ts">
  import { basename } from "@tauri-apps/api/path";
  import { save } from "@tauri-apps/plugin-dialog";
  import { ref } from "vue";
  import { asyncComputed, refAutoReset } from "@vueuse/core";

  import { PdfExportOptions } from "#/schemas/";
  import { PDF_FILTER } from "#/stores/patterns.ts";

  const props = defineProps<{ filePath: string; options: PdfExportOptions }>();
  const emit = defineEmits<{ close: [] }>();

  const patternsStore = usePatternsStore();

  // Copy the data from the props to a reactive object.
  const options = ref<PdfExportOptions>(new PdfExportOptions(props.options));

  const filePath = ref(props.filePath);
  const pdfFile = asyncComputed(
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

  async function chooseFile() {
    const path = await save({ defaultPath: filePath.value, filters: PDF_FILTER });
    if (path !== null) filePath.value = path;
  }

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

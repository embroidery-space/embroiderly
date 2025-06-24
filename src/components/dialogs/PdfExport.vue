<template>
  <NuxtModal :title="$t('title-pdf-export')">
    <template #body>
      <NuxtButtonGroup class="w-full">
        <NuxtButton :label="$t('label-choose-file')" @click="chooseFile" />
        <NuxtInput :model-value="pdfFile.base" readonly class="w-full" />
      </NuxtButtonGroup>

      <div class="flex flex-col gap-y-1 mt-2">
        <NuxtCheckbox
          v-model="options.monochrome"
          :label="$t('label-pdf-export-monochrome')"
          :description="pdfFile.monochrome"
        />
        <NuxtCheckbox v-model="options.color" :label="$t('label-pdf-export-color')" :description="pdfFile.color" />
      </div>

      <FormFieldset :legend="$t('label-print-options')">
        <div class="flex flex-col gap-y-1 mt-1">
          <NuxtCheckbox v-model="options.centerFrames" :label="$t('label-print-center-frames')" />
          <NuxtCheckbox v-model="options.enumerateFrames" :label="$t('label-print-enumerate-frames')" />
        </div>
      </FormFieldset>

      <FormFieldset :legend="$t('label-frame-options')">
        <p class="my-2 text-sm text-dimmed whitespace-pre-line">{{ $t("message-frame-what-is-this") }}</p>

        <div class="flex flex-col gap-y-1">
          <div class="flex gap-x-2">
            <NuxtFormField :label="$t('label-frame-width')">
              <NuxtInputNumber v-model="options.frameOptions.frameSize![0]" orientation="vertical" />
            </NuxtFormField>
            <NuxtFormField :label="$t('label-frame-height')">
              <NuxtInputNumber v-model="options.frameOptions.frameSize![1]" orientation="vertical" />
            </NuxtFormField>
          </div>
          <div class="flex gap-x-2">
            <NuxtFormField
              :label="$t('label-frame-cell-size')"
              :description="$t('message-frame-cell-size-description')"
              class="w-full"
            >
              <NuxtInputNumber v-model="options.frameOptions.cellSize" orientation="vertical" class="w-full" />
            </NuxtFormField>
            <NuxtFormField
              :label="$t('label-frame-preserved-overlap')"
              :description="$t('message-frame-preserved-overlap-description')"
              class="w-full"
            >
              <NuxtInputNumber v-model="options.frameOptions.preservedOverlap" orientation="vertical" class="w-full" />
            </NuxtFormField>
          </div>
        </div>

        <div class="flex flex-col gap-y-1 mt-2">
          <NuxtCheckbox
            v-model="options.frameOptions.showGridLineNumbers"
            :label="$t('label-frame-show-grid-line-numbers')"
          />
          <NuxtCheckbox
            v-model="options.frameOptions.showCenteringMarks"
            :label="$t('label-frame-show-centering-marks')"
          />
        </div>
      </FormFieldset>
    </template>
    <template #footer>
      <NuxtButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <NuxtButton v-if="filePath" :label="$t('label-export')" @click="emit('close', { filePath, options })" />
    </template>
  </NuxtModal>
</template>

<script setup lang="ts">
  import { basename } from "@tauri-apps/api/path";
  import { save } from "@tauri-apps/plugin-dialog";
  import { reactive, ref } from "vue";
  import { asyncComputed } from "@vueuse/core";

  import { PdfExportOptions } from "#/schemas/";
  import { PDF_FILTER } from "#/stores/patterns.ts";

  const props = defineProps<{
    filePath?: string;
    options: PdfExportOptions;
  }>();
  const emit = defineEmits<{
    (e: "close", result?: { filePath: string; options: PdfExportOptions }): void;
  }>();

  // Copy the data from the props to a reactive object.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options = reactive<PdfExportOptions>(new PdfExportOptions(props.options as any));

  const filePath = ref<string | undefined>(props.filePath);
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
</script>

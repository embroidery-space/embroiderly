<template>
  <div>
    <FormFieldset :legend="$t('label-print-options')" class="!m-0">
      <div class="flex flex-col gap-y-1 mt-1">
        <NuxtCheckbox v-model="options.centerFrames" :label="$t('label-print-center-frames')" />
        <NuxtCheckbox v-model="options.enumerateFrames" :label="$t('label-print-enumerate-frames')" />
      </div>
    </FormFieldset>

    <FormFieldset :legend="$t('label-frame-options')">
      <p class="my-2 text-sm text-dimmed whitespace-pre-line">{{ $t("message-frame-what-is-this") }}</p>

      <div class="flex flex-col gap-y-1">
        <div class="flex gap-x-2">
          <NuxtFormField :label="$t('label-frame-width')" class="w-full">
            <NuxtInputNumber v-model="options.frameOptions.frameSize![0]" orientation="vertical" class="w-full" />
          </NuxtFormField>
          <NuxtFormField :label="$t('label-frame-height')" class="w-full">
            <NuxtInputNumber v-model="options.frameOptions.frameSize![1]" orientation="vertical" class="w-full" />
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
  </div>
</template>

<script lang="ts" setup>
  import type { PdfExportOptions } from "#/core/pattern/";

  const options = defineModel<PdfExportOptions>({ required: true });
</script>

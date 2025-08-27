<template>
  <div>
    <FormFieldset :legend="$t('label-print-options')" class="m-0!">
      <div class="mt-1 flex flex-col gap-y-1">
        <UCheckbox v-model="options.centerFrames" :label="$t('label-print-center-frames')" />
        <UCheckbox v-model="options.enumerateFrames" :label="$t('label-print-enumerate-frames')" />
      </div>
    </FormFieldset>

    <FormFieldset :legend="$t('label-frame-options')">
      <p class="my-2 text-sm whitespace-pre-line text-dimmed">{{ $t("message-frame-what-is-this") }}</p>

      <div class="flex flex-col gap-y-1">
        <div class="flex gap-x-2">
          <UFormField :label="$t('label-frame-width')" class="w-full">
            <UInputNumber v-model="options.frameOptions.frameSize![0]" orientation="vertical" class="w-full" />
          </UFormField>
          <UFormField :label="$t('label-frame-height')" class="w-full">
            <UInputNumber v-model="options.frameOptions.frameSize![1]" orientation="vertical" class="w-full" />
          </UFormField>
        </div>
        <div class="flex gap-x-2">
          <UFormField
            :label="$t('label-frame-cell-size')"
            :description="$t('message-frame-cell-size-description')"
            class="w-full"
          >
            <UInputNumber v-model="options.frameOptions.cellSize" orientation="vertical" class="w-full" />
          </UFormField>
          <UFormField
            :label="$t('label-frame-preserved-overlap')"
            :description="$t('message-frame-preserved-overlap-description')"
            class="w-full"
          >
            <UInputNumber v-model="options.frameOptions.preservedOverlap" orientation="vertical" class="w-full" />
          </UFormField>
        </div>
      </div>

      <div class="mt-2 flex flex-col gap-y-1">
        <UCheckbox
          v-model="options.frameOptions.showGridLineNumbers"
          :label="$t('label-frame-show-grid-line-numbers')"
        />
        <UCheckbox v-model="options.frameOptions.showCenteringMarks" :label="$t('label-frame-show-centering-marks')" />
      </div>
    </FormFieldset>
  </div>
</template>

<script lang="ts" setup>
  import type { PdfExportOptions } from "#/core/pattern/";

  const options = defineModel<PdfExportOptions>({ required: true });
</script>

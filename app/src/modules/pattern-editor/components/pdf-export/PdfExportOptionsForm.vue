<template>
  <div>
    <FormFieldset :legend="$t('publish-settings-print-options')" class="m-0!">
      <div class="mt-1 flex flex-col gap-y-1">
        <UCheckbox v-model="options.centerFrames" :label="$t('publish-settings-print-center-frames')" />
        <UCheckbox v-model="options.enumerateFrames" :label="$t('publish-settings-print-enumerate-frames')" />
      </div>
    </FormFieldset>

    <FormFieldset :legend="$t('publish-settings-frame-options')">
      <p class="my-2 text-sm whitespace-pre-line text-dimmed">{{ $t("publish-settings-frame-definition") }}</p>

      <div class="flex flex-col gap-y-1">
        <div class="flex gap-x-2">
          <UFormField :label="$t('publish-settings-frame-width')" class="w-full">
            <UInputNumber v-model="options.frameOptions.frameSize![0]" orientation="vertical" class="w-full" />
          </UFormField>
          <UFormField :label="$t('publish-settings-frame-height')" class="w-full">
            <UInputNumber v-model="options.frameOptions.frameSize![1]" orientation="vertical" class="w-full" />
          </UFormField>
        </div>
        <div class="flex gap-x-2">
          <UFormField v-bind="$ta('publish-settings-frame-cell-size')" class="w-full">
            <UInputNumber v-model="options.frameOptions.cellSize" orientation="vertical" class="w-full" />
          </UFormField>
          <UFormField v-bind="$ta('publish-settings-frame-preserved-overlap')" class="w-full">
            <UInputNumber v-model="options.frameOptions.preservedOverlap" orientation="vertical" class="w-full" />
          </UFormField>
        </div>
      </div>

      <div class="mt-2 flex flex-col gap-y-1">
        <UCheckbox
          v-model="options.frameOptions.showGridLineNumbers"
          :label="$t('publish-settings-frame-show-grid-line-numbers')"
        />
        <UCheckbox
          v-model="options.frameOptions.showCenteringMarks"
          :label="$t('publish-settings-frame-show-centering-marks')"
        />
      </div>
    </FormFieldset>
  </div>
</template>

<script lang="ts" setup>
  import type { PdfExportOptions } from "#pattern-editor/lib/pattern/";
  import { FormFieldset } from "#shared/components/";

  const options = defineModel<PdfExportOptions>({ required: true });
</script>

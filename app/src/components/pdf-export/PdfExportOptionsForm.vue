<script lang="ts" setup>
import { Checkbox, FormField, FormFieldSet, InputNumber } from "@embroiderly/ui";

import type { PdfExportOptions } from "~/lib/pattern/";

const options = defineModel<PdfExportOptions>({ required: true });
</script>

<template>
  <div>
    <FormFieldSet :legend="$t('publish-settings-print-options')" class="m-0!">
      <div class="mt-1">
        <Checkbox v-model="options.centerFrames" :label="$t('publish-settings-print-center-frames')" />
        <Checkbox v-model="options.enumerateFrames" :label="$t('publish-settings-print-enumerate-frames')" />
      </div>
    </FormFieldSet>

    <FormFieldSet :legend="$t('publish-settings-frame-options')">
      <p class="my-2 text-sm whitespace-pre-line text-dimmed">{{ $t("publish-settings-frame-definition") }}</p>

      <div class="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-2">
        <FormField :label="$t('publish-settings-frame-width')" class="w-full">
          <InputNumber v-model="options.frameOptions.frameSize![0]" orientation="vertical" class="w-full" />
        </FormField>
        <FormField :label="$t('publish-settings-frame-height')" class="w-full">
          <InputNumber v-model="options.frameOptions.frameSize![1]" orientation="vertical" class="w-full" />
        </FormField>
        <FormField v-bind="$ta('publish-settings-frame-preserved-overlap')" class="w-full">
          <InputNumber v-model="options.frameOptions.preservedOverlap" orientation="vertical" class="w-full" />
        </FormField>
      </div>

      <div class="mt-2">
        <Checkbox
          v-model="options.frameOptions.showGridLineNumbers"
          :label="$t('publish-settings-frame-show-grid-line-numbers')"
        />
        <Checkbox
          v-model="options.frameOptions.showCenteringMarks"
          :label="$t('publish-settings-frame-show-centering-marks')"
        />
      </div>
    </FormFieldSet>
  </div>
</template>

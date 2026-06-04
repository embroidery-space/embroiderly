<script lang="ts" setup>
import { Checkbox, FormField, FormFieldSet, InputNumber } from "@embroiderly/ui";

import type { PdfExportOptions } from "~/lib/pattern/";

const options = defineModel<PdfExportOptions>({ required: true });
const props = defineProps<{
  fabricWidth: number;
  fabricHeight: number;
}>();
</script>

<template>
  <div>
    <FormFieldSet :legend="$t('publish-settings-frame-options')" class="m-0!">
      <p class="my-2 text-sm whitespace-pre-line text-dimmed">{{ $t("publish-settings-frame-definition") }}</p>

      <div class="grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-2">
        <FormField :label="$t('publish-settings-frame-width')" class="w-full">
          <InputNumber
            v-model="options.frameSize[0]"
            :min="1"
            :max="props.fabricWidth"
            orientation="vertical"
            class="w-full"
          />
        </FormField>
        <FormField :label="$t('publish-settings-frame-height')" class="w-full">
          <InputNumber
            v-model="options.frameSize[1]"
            :min="1"
            :max="props.fabricHeight"
            orientation="vertical"
            class="w-full"
          />
        </FormField>
        <FormField v-bind="$ta('publish-settings-frame-preserved-overlap')" class="w-full">
          <InputNumber v-model="options.preservedOverlap" :min="0" orientation="vertical" class="w-full" />
        </FormField>
      </div>

      <div class="mt-2">
        <Checkbox v-model="options.showGridLineNumbers" :label="$t('publish-settings-frame-show-grid-line-numbers')" />
        <Checkbox v-model="options.showCenteringMarks" :label="$t('publish-settings-frame-show-centering-marks')" />
      </div>
    </FormFieldSet>
  </div>
</template>

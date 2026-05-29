<script setup lang="ts">
import { Checkbox, FormField, FormFieldSet, InputColor, InputNumber } from "@embroiderly/ui";

import { Grid } from "~/lib/pattern/";

const grid = defineModel<Grid>({ required: true });
</script>

<template>
  <div>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField v-bind="$ta('grid-major-lines-interval')">
        <InputNumber
          v-model="grid.majorLinesInterval"
          data-testid="grid-major-lines-interval-input"
          :min="1"
          class="w-full"
        />
      </FormField>
    </div>

    <FormFieldSet :legend="$t('grid-major-lines')">
      <div class="grid grid-cols-2 gap-4 pt-1">
        <Checkbox v-bind="$ta('grid-pixel-line')" v-model="grid.majorLines.pixelLine" class="col-span-2" />

        <FormField :label="$t('grid-thickness')">
          <InputNumber
            v-model="grid.majorLines.thickness"
            data-testid="grid-major-lines-thickness-input"
            :min="0.5"
            :max="5"
            :step="0.01"
            :format-options="{ style: 'percent' }"
            :disabled="grid.majorLines.pixelLine"
            class="w-full"
          />
        </FormField>

        <FormField :label="$t('grid-color')">
          <InputColor v-model="grid.majorLines.color" data-testid="grid-major-lines-color-input" class="w-full" />
        </FormField>
      </div>
    </FormFieldSet>

    <FormFieldSet :legend="$t('grid-minor-lines')">
      <div class="grid grid-cols-2 gap-4 pt-1">
        <Checkbox v-bind="$ta('grid-pixel-line')" v-model="grid.minorLines.pixelLine" class="col-span-2" />

        <FormField :label="$t('grid-thickness')">
          <InputNumber
            v-model="grid.minorLines.thickness"
            data-testid="grid-minor-lines-thickness-input"
            :min="0.5"
            :max="5"
            :step="0.01"
            :format-options="{ style: 'percent' }"
            :disabled="grid.minorLines.pixelLine"
            class="w-full"
          />
        </FormField>

        <FormField :label="$t('grid-color')">
          <InputColor v-model="grid.minorLines.color" data-testid="grid-minor-lines-color-input" class="w-full" />
        </FormField>
      </div>
    </FormFieldSet>
  </div>
</template>

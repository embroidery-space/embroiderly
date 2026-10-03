<script setup lang="ts">
import { Checkbox, FormField, FormFieldSet, InputColor, InputNumber } from "@embroiderly/ui";

import { Grid } from "~/lib/pattern/";

const grid = defineModel<Grid>({ required: true });
</script>

<template>
  <div>
    <div :class="$style.general">
      <FormField v-bind="$ta('grid-major-lines-interval')">
        <InputNumber v-model="grid.majorLinesInterval" data-testid="grid-major-lines-interval-input" :min="1" />
      </FormField>
    </div>

    <FormFieldSet :legend="$t('grid-major-lines')">
      <div :class="$style.lines">
        <Checkbox v-bind="$ta('grid-pixel-line')" v-model="grid.majorLines.pixelLine" />

        <FormField :label="$t('grid-thickness')">
          <InputNumber
            v-model="grid.majorLines.thickness"
            data-testid="grid-major-lines-thickness-input"
            :min="0.5"
            :max="5"
            :step="0.01"
            :format-options="{ style: 'percent' }"
            :disabled="grid.majorLines.pixelLine"
          />
        </FormField>

        <FormField :label="$t('grid-color')">
          <InputColor v-model="grid.majorLines.color" data-testid="grid-major-lines-color-input" />
        </FormField>
      </div>
    </FormFieldSet>

    <FormFieldSet :legend="$t('grid-minor-lines')">
      <div :class="$style.lines">
        <Checkbox v-bind="$ta('grid-pixel-line')" v-model="grid.minorLines.pixelLine" />

        <FormField :label="$t('grid-thickness')">
          <InputNumber
            v-model="grid.minorLines.thickness"
            data-testid="grid-minor-lines-thickness-input"
            :min="0.5"
            :max="5"
            :step="0.01"
            :format-options="{ style: 'percent' }"
            :disabled="grid.minorLines.pixelLine"
          />
        </FormField>

        <FormField :label="$t('grid-color')">
          <InputColor v-model="grid.minorLines.color" data-testid="grid-minor-lines-color-input" />
        </FormField>
      </div>
    </FormFieldSet>
  </div>
</template>

<style module>
.general {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);

  @media (width >= 48rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.lines {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);

  /* The "pixel line" checkbox. */
  > :first-child {
    grid-column: span 2 / span 2;
  }
}
</style>

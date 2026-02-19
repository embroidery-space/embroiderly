<script setup lang="ts">
import { Grid } from "#pattern-editor/lib/pattern/";
import { ColorPicker, FormFieldset } from "#shared/components/";

const grid = defineModel<Grid>({ required: true });
</script>

<template>
  <div>
    <div class="grid grid-cols-2 gap-4">
      <UFormField v-bind="$ta('grid-major-lines-interval')">
        <UInputNumber
          v-model="grid.majorLinesInterval"
          data-testid="grid-major-lines-interval-input"
          orientation="vertical"
          :min="1"
          class="w-full"
        />
      </UFormField>
    </div>

    <FormFieldset :legend="$t('grid-major-lines')">
      <div class="grid grid-cols-2 gap-4">
        <UFormField v-bind="$ta('grid-thickness')">
          <UInputNumber
            v-model="grid.majorLines.thickness"
            data-testid="grid-major-lines-thickness-input"
            orientation="vertical"
            :min="0.001"
            :step="0.01"
          />
        </UFormField>
        <UFormField :label="$t('grid-color')">
          <ColorPicker v-model="grid.majorLines.color" data-testid="grid-major-lines-color-input" />
        </UFormField>
      </div>
    </FormFieldset>

    <FormFieldset :legend="$t('grid-minor-lines')">
      <div class="grid grid-cols-2 gap-4">
        <UFormField v-bind="$ta('grid-thickness')">
          <UInputNumber
            v-model="grid.minorLines.thickness"
            data-testid="grid-minor-lines-thickness-input"
            orientation="vertical"
            :min="0.001"
            :step="0.01"
          />
        </UFormField>
        <UFormField :label="$t('grid-color')">
          <ColorPicker v-model="grid.minorLines.color" data-testid="grid-minor-lines-color-input" />
        </UFormField>
      </div>
    </FormFieldset>
  </div>
</template>

<template>
  <div>
    <div class="grid grid-cols-2 gap-4">
      <UFormField :label="$t('label-major-lines-interval')" :hint="$t('label-hint-counts-in-stitches')">
        <UInputNumber
          v-model="grid.majorLinesInterval"
          orientation="vertical"
          :min="1"
          class="w-full"
          data-testid="grid-major-lines-interval"
        />
      </UFormField>
    </div>

    <FormFieldset :legend="$t('label-minor-lines')">
      <div class="grid grid-cols-2 gap-4">
        <UFormField :label="$t('label-thickness')" :hint="$t('label-hint-counts-in-points')">
          <UInputNumber
            v-model="grid.minorLines.thickness"
            orientation="vertical"
            :min="0.001"
            :step="0.01"
            data-testid="grid-minor-thickness"
          />
        </UFormField>
        <UFormField :label="$t('label-color')">
          <ColorPicker v-model="grid.minorLines.color" data-testid="grid-minor-color" />
        </UFormField>
      </div>
    </FormFieldset>

    <FormFieldset :legend="$t('label-major-lines')">
      <div class="grid grid-cols-2 gap-4">
        <UFormField :label="$t('label-thickness')" :hint="$t('label-hint-counts-in-points')">
          <UInputNumber
            v-model="grid.majorLines.thickness"
            orientation="vertical"
            :min="0.001"
            :step="0.01"
            data-testid="grid-major-thickness"
          />
        </UFormField>
        <UFormField :label="$t('label-color')">
          <ColorPicker v-model="grid.majorLines.color" data-testid="grid-major-color" />
        </UFormField>
      </div>
    </FormFieldset>
  </div>
</template>

<script setup lang="ts">
  import { Grid } from "~/core/pattern/";

  const grid = defineModel<Grid>({ required: true });
</script>

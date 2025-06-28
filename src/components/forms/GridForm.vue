<template>
  <div>
    <div class="grid grid-cols-2 gap-4">
      <NuxtFormField :label="$t('label-major-lines-interval')" :hint="$t('label-hint-counts-in-stitches')">
        <NuxtInputNumber v-model="grid.majorLinesInterval" orientation="vertical" :min="1" />
      </NuxtFormField>
    </div>

    <FormFieldset :legend="$t('label-minor-lines')">
      <div class="grid grid-cols-2 gap-4">
        <NuxtFormField :label="$t('label-thickness')" :hint="$t('label-hint-counts-in-points')">
          <NuxtInputNumber v-model="grid.minorLines.thickness" orientation="vertical" :min="0.001" :step="0.01" />
        </NuxtFormField>
        <NuxtFormField :label="$t('label-color')">
          <ColorPicker v-model="grid.minorLines.color" />
        </NuxtFormField>
      </div>
    </FormFieldset>

    <FormFieldset :legend="$t('label-major-lines')">
      <div class="grid grid-cols-2 gap-4">
        <NuxtFormField :label="$t('label-thickness')" :hint="$t('label-hint-counts-in-points')">
          <NuxtInputNumber v-model="grid.majorLines.thickness" orientation="vertical" :min="0.001" :step="0.01" />
        </NuxtFormField>
        <NuxtFormField :label="$t('label-color')">
          <ColorPicker v-model="grid.majorLines.color" />
        </NuxtFormField>
      </div>
    </FormFieldset>
  </div>
</template>

<script setup lang="ts">
  import { Grid } from "#/schemas/";

  const grid = defineModel<Grid>({ required: true });
</script>

<template>
  <NuxtModal :title="$t('title-grid-properties')">
    <template #body>
      <div class="grid grid-cols-2 gap-4">
        <NuxtFormField :label="$t('label-major-lines-interval')" :hint="$t('message-major-lines-interval-hint')">
          <NuxtInputNumber v-model="grid.majorLinesInterval" orientation="vertical" :min="1" />
        </NuxtFormField>
      </div>

      <FormFieldset :legend="$t('label-minor-lines')">
        <div class="grid grid-cols-2 gap-4">
          <NuxtFormField :label="$t('label-thickness')" :hint="$t('message-thickness-hint')">
            <NuxtInputNumber v-model="grid.minorLines.thickness" orientation="vertical" :min="0.001" :step="0.01" />
          </NuxtFormField>
          <NuxtFormField :label="$t('label-color')">
            <ColorPicker v-model="grid.minorLines.color" />
          </NuxtFormField>
        </div>
      </FormFieldset>

      <FormFieldset :legend="$t('label-major-lines')">
        <div class="grid grid-cols-2 gap-4">
          <NuxtFormField :label="$t('label-thickness')" :hint="$t('message-thickness-hint')">
            <NuxtInputNumber v-model="grid.majorLines.thickness" orientation="vertical" :min="0.001" :step="0.01" />
          </NuxtFormField>
          <NuxtFormField :label="$t('label-color')">
            <ColorPicker v-model="grid.majorLines.color" />
          </NuxtFormField>
        </div>
      </FormFieldset>
    </template>
    <template #footer>
      <NuxtButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <NuxtButton :label="$t('label-save')" @click="emit('close', grid)" />
    </template>
  </NuxtModal>
</template>

<script setup lang="ts">
  import { reactive } from "vue";
  import { Grid } from "#/schemas/";

  const props = defineProps<{ grid: Grid }>();
  const emit = defineEmits<{ close: [Grid?] }>();

  // Copy the data from the props to a reactive object.
  const grid = reactive<Grid>(new Grid(props.grid));
</script>

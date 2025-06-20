<template>
  <UModal :title="$t('title-grid-properties')">
    <template #body>
      <div class="grid grid-cols-2 gap-4">
        <UFormField :label="$t('label-major-lines-interval')" :hint="$t('message-major-lines-interval-hint')">
          <UInputNumber v-model="grid.majorLinesInterval" orientation="vertical" :min="1" />
        </UFormField>
      </div>

      <FormFieldset :legend="$t('label-minor-lines')">
        <div class="grid grid-cols-2 gap-4">
          <UFormField :label="$t('label-thickness')" :hint="$t('message-thickness-hint')">
            <UInputNumber v-model="grid.minorLines.thickness" orientation="vertical" :min="0.001" :step="0.01" />
          </UFormField>
          <UFormField :label="$t('label-color')">
            <ColorPicker v-model="grid.minorLines.color" />
          </UFormField>
        </div>
      </FormFieldset>

      <FormFieldset :legend="$t('label-major-lines')">
        <div class="grid grid-cols-2 gap-4">
          <UFormField :label="$t('label-thickness')" :hint="$t('message-thickness-hint')">
            <UInputNumber v-model="grid.majorLines.thickness" orientation="vertical" :min="0.001" :step="0.01" />
          </UFormField>
          <UFormField :label="$t('label-color')">
            <ColorPicker v-model="grid.majorLines.color" />
          </UFormField>
        </div>
      </FormFieldset>
    </template>
    <template #footer>
      <UButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton :label="$t('label-save')" @click="emit('close', grid)" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { reactive } from "vue";
  import { Grid } from "#/schemas/";

  const props = defineProps<{ grid: Grid }>();
  const emit = defineEmits<{ close: [Grid?] }>();

  // Copy the data from the props to a reactive object.
  const grid = reactive<Grid>(new Grid(props.grid));
</script>

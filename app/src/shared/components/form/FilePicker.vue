<script setup lang="ts" generic="Mode extends 'open' | 'save'">
import { useFilePicker } from "#shared/composables/";
import type { FilePickerOpenOptions, FilePickerSaveOptions } from "#shared/composables/";

interface FilePickerProps {
  mode?: Mode;
  options?: Mode extends "open" ? FilePickerOpenOptions : FilePickerSaveOptions;
  disabled?: boolean;
}

const filePath = defineModel<string>({ required: true });
const { mode = "open", options = undefined, disabled = false } = defineProps<FilePickerProps>();

const filePicker = useFilePicker();

async function chooseFile() {
  const path = mode === "open" ? await filePicker.open(options) : await filePicker.save(filePath.value, options);
  if (path) filePath.value = path;
}
</script>

<template>
  <UFieldGroup>
    <UButton :label="$t('choose-file')" :disabled="disabled" @click="chooseFile" />
    <UInput :model-value="filePath" readonly :disabled="disabled" class="w-full" />
  </UFieldGroup>
</template>

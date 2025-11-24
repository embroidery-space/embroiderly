<template>
  <UFieldGroup>
    <UButton :label="$t('choose-file')" @click="chooseFile" />
    <UInput :model-value="filePath" readonly class="w-full" />
  </UFieldGroup>
</template>

<script setup lang="ts" generic="Mode extends 'open' | 'save'">
  import type { FilePickerOpenOptions, FilePickerSaveOptions } from "~/shared/composables/";
  import { useFilePicker } from "~/shared/composables/";

  interface FilePickerProps {
    mode?: Mode;
    options?: Mode extends "open" ? FilePickerOpenOptions : FilePickerSaveOptions;
  }

  const filePath = defineModel<string>({ required: true });
  const { mode = "open", options = undefined } = defineProps<FilePickerProps>();

  const filePicker = useFilePicker();

  async function chooseFile() {
    const path = mode === "open" ? await filePicker.open(options) : await filePicker.save(filePath.value, options);
    if (path) filePath.value = path;
  }
</script>

<script setup lang="ts">
import { Button, Dialog } from "@embroiderly/ui";

import { ref, toRaw } from "vue";

import { PdfExportOptions } from "~/lib/pattern/";

import PdfExportOptionsForm from "./PdfExportOptionsForm.vue";

const props = defineProps<{
  options: PdfExportOptions;
  onSave?: (options: PdfExportOptions) => void | Promise<void>;
}>();
const emit = defineEmits<{ close: [] }>();

const options = ref<PdfExportOptions>(new PdfExportOptions(toRaw(props.options)));

async function handleSave() {
  await props.onSave?.(options.value);
  emit("close");
}
</script>

<template>
  <Dialog :title="$t('publish-settings')" :ui="{ content: 'w-xl' }">
    <template #body>
      <PdfExportOptionsForm v-model="options" />
    </template>
    <template #footer>
      <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <Button loading-auto :label="$t('modal-save')" @click="handleSave" />
    </template>
  </Dialog>
</template>

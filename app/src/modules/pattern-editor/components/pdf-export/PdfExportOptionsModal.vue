<template>
  <UModal :title="$t('publish-settings')" :ui="{ content: 'w-xl' }">
    <template #body>
      <PdfExportOptionsForm v-model="options" />
    </template>
    <template #footer>
      <UButton :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton loading-auto :label="$t('modal-save')" @click="handleSave" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, toRaw } from "vue";

  import { PdfExportOptions } from "~/pattern-editor/lib/pattern/";

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

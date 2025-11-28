<template>
  <UModal :title="$t('publish-settings')" :ui="{ content: 'w-xl' }">
    <template #body>
      <PdfExportOptionsForm v-model="options" />
    </template>
    <template #footer>
      <UButton :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton :label="$t('modal-save')" @click="emit('close', options)" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, toRaw } from "vue";

  import { PdfExportOptions } from "~/modules/pattern-editor/lib/pattern/";

  import PdfExportOptionsForm from "./PdfExportOptionsForm.vue";

  const props = defineProps<{ options: PdfExportOptions }>();
  const emit = defineEmits<{ close: [options?: PdfExportOptions] }>();

  const options = ref<PdfExportOptions>(new PdfExportOptions(toRaw(props.options)));
</script>

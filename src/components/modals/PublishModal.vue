<template>
  <NuxtModal :title="$t('title-publish-settings')" :ui="{ content: 'w-xl' }">
    <template #body>
      <PdfPublishForm v-model="options" />
    </template>
    <template #footer>
      <NuxtButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <NuxtButton :label="$t('label-save')" @click="updateOptions" />
    </template>
  </NuxtModal>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  import { PdfExportOptions } from "#/schemas/";

  const props = defineProps<{ options: PdfExportOptions }>();
  const emit = defineEmits<{ close: [] }>();

  const patternsStore = usePatternsStore();

  // Copy the data from the props to a reactive object.
  const options = ref<PdfExportOptions>(new PdfExportOptions(props.options));

  async function updateOptions() {
    await patternsStore.updatePdfExportOptions(options.value);
    emit("close");
  }
</script>

<template>
  <UModal :title="$t('pattern-info')">
    <template #body>
      <PatternInfoForm v-model="patternInfo" />
    </template>
    <template #footer>
      <UButton :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton loading-auto :label="$t('modal-save')" @click="handleSave" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, toRaw } from "vue";

  import { PatternInfo } from "#pattern-editor/lib/pattern/";

  import PatternInfoForm from "./PatternInfoForm.vue";

  const props = defineProps<{
    patternInfo: PatternInfo;
    onSave?: (patternInfo: PatternInfo) => void | Promise<void>;
  }>();
  const emit = defineEmits<{ close: [] }>();

  const patternInfo = ref<PatternInfo>(new PatternInfo(toRaw(props.patternInfo)));

  async function handleSave() {
    await props.onSave?.(patternInfo.value);
    emit("close");
  }
</script>

<script setup lang="ts">
import { Button, Dialog } from "@embroiderly/ui";

import { ref, toRaw } from "vue";

import { PatternInfo } from "~/lib/pattern/";

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

<template>
  <Dialog :title="$t('pattern-info')">
    <template #body>
      <PatternInfoForm v-model="patternInfo" />
    </template>
    <template #footer>
      <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <Button loading-auto :label="$t('modal-save')" @click="handleSave" />
    </template>
  </Dialog>
</template>

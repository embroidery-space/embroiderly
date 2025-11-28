<template>
  <UModal :title="$t('pattern-info')">
    <template #body>
      <PatternInfoForm v-model="patternInfo" />
    </template>
    <template #footer>
      <UButton :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton :label="$t('modal-save')" @click="emit('close', patternInfo)" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, toRaw } from "vue";

  import { PatternInfo } from "~/core/pattern/";

  import PatternInfoForm from "./PatternInfoForm.vue";

  const props = defineProps<{ patternInfo: PatternInfo }>();
  const emit = defineEmits<{ close: [patternInfo?: PatternInfo] }>();

  const patternInfo = ref<PatternInfo>(new PatternInfo(toRaw(props.patternInfo)));
</script>

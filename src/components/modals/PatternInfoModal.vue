<template>
  <NuxtModal :title="$t('title-pattern-info')">
    <template #body>
      <PatternInfoForm v-model="patternInfo" />
    </template>
    <template #footer>
      <NuxtButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <NuxtButton :label="$t('label-save')" @click="updatePatternInfo" />
    </template>
  </NuxtModal>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { PatternInfo } from "#/core/pattern/";

  const props = defineProps<{ patternInfo: PatternInfo }>();
  const emit = defineEmits<{ close: [] }>();

  const patternsStore = usePatternsStore();

  // Copy the data from the props to a reactive object.
  const patternInfo = ref<PatternInfo>(new PatternInfo(props.patternInfo));

  async function updatePatternInfo() {
    await patternsStore.updatePatternInfo(patternInfo.value);
    emit("close");
  }
</script>

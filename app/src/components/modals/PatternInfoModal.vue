<template>
  <UModal :title="$t('pattern-info')">
    <template #body>
      <PatternInfoForm v-model="patternInfo" />
    </template>
    <template #footer>
      <UButton :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton :label="$t('modal-save')" @click="updatePatternInfo" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  import { PatternInfo } from "~/core/pattern/";

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

<template>
  <UModal :title="$t('title-pattern-info')">
    <template #body>
      <div class="flex flex-col gap-y-2">
        <UFormField :label="$t('label-pattern-title')" class="w-full">
          <UInput v-model="patternInfo.title" class="w-full" />
        </UFormField>
        <UFormField :label="$t('label-pattern-author')" class="w-full">
          <UInput v-model="patternInfo.author" class="w-full" />
        </UFormField>
        <UFormField :label="$t('label-pattern-copyright')" class="w-full">
          <UInput v-model="patternInfo.copyright" class="w-full" />
        </UFormField>
        <UFormField :label="$t('label-pattern-description')" class="w-full">
          <UTextarea v-model="patternInfo.description" autoresize class="w-full" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <UButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton :label="$t('label-save')" @click="emit('close', patternInfo)" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { reactive } from "vue";
  import { PatternInfo } from "#/schemas/";

  const props = defineProps<{ patternInfo: PatternInfo }>();
  const emit = defineEmits<{ close: [PatternInfo?] }>();

  // Copy the data from the props to a reactive object.
  const patternInfo = reactive<PatternInfo>(new PatternInfo(props.patternInfo));
</script>

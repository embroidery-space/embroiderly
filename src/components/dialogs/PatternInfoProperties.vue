<template>
  <NuxtModal :title="$t('title-pattern-info')">
    <template #body>
      <div class="flex flex-col gap-y-2">
        <NuxtFormField :label="$t('label-pattern-title')" class="w-full">
          <NuxtInput v-model="patternInfo.title" class="w-full" />
        </NuxtFormField>
        <NuxtFormField :label="$t('label-pattern-author')" class="w-full">
          <NuxtInput v-model="patternInfo.author" class="w-full" />
        </NuxtFormField>
        <NuxtFormField :label="$t('label-pattern-copyright')" class="w-full">
          <NuxtInput v-model="patternInfo.copyright" class="w-full" />
        </NuxtFormField>
        <NuxtFormField :label="$t('label-pattern-description')" class="w-full">
          <NuxtTextarea v-model="patternInfo.description" autoresize class="w-full" />
        </NuxtFormField>
      </div>
    </template>
    <template #footer>
      <NuxtButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <NuxtButton :label="$t('label-save')" @click="emit('close', patternInfo)" />
    </template>
  </NuxtModal>
</template>

<script setup lang="ts">
  import { reactive } from "vue";
  import { PatternInfo } from "#/schemas/";

  const props = defineProps<{ patternInfo: PatternInfo }>();
  const emit = defineEmits<{ close: [PatternInfo?] }>();

  // Copy the data from the props to a reactive object.
  const patternInfo = reactive<PatternInfo>(new PatternInfo(props.patternInfo));
</script>

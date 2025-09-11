<template>
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

<script setup lang="ts">
  import { PatternInfo } from "~/core/pattern/";

  const patternInfo = defineModel<PatternInfo>({ required: true });
</script>

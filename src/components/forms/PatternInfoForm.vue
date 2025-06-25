<template>
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

<script setup lang="ts">
  import { PatternInfo } from "#/schemas/";

  const patternInfo = defineModel<PatternInfo>({ required: true });
</script>

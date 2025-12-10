<template>
  <div class="flex flex-col gap-y-2">
    <UFormField :label="$t('label-pattern-title')" class="w-full">
      <UInput v-model="patternInfo.title" data-testid="pattern-title-input" class="w-full" />
    </UFormField>
    <UFormField :label="$t('label-pattern-author')" class="w-full">
      <UInput v-model="patternInfo.author" data-testid="pattern-author-input" class="w-full" />
    </UFormField>
    <UFormField :label="$t('label-pattern-copyright')" class="w-full">
      <UInput v-model="patternInfo.copyright" data-testid="pattern-copyright-input" class="w-full" />
    </UFormField>
    <UFormField :label="$t('label-pattern-description')" class="w-full">
      <UTextarea
        v-model="patternInfo.description"
        data-testid="pattern-description-textarea"
        autoresize
        class="w-full"
      />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
  import { PatternInfo } from "#pattern-editor/lib/pattern/";

  const patternInfo = defineModel<PatternInfo>({ required: true });
</script>

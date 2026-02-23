<script setup lang="ts">
import { FormField, Input, Textarea } from "@embroiderly/ui";

import { PatternInfo } from "~/modules/pattern-editor/lib/pattern/";

const patternInfo = defineModel<PatternInfo>({ required: true });
</script>

<template>
  <div class="flex flex-col gap-y-2">
    <FormField :label="$t('pattern-info-title')" class="w-full">
      <Input v-model="patternInfo.title" data-testid="pattern-title-input" class="w-full" />
    </FormField>
    <FormField :label="$t('pattern-info-author')" class="w-full">
      <Input v-model="patternInfo.author" data-testid="pattern-author-input" class="w-full" />
    </FormField>
    <FormField :label="$t('pattern-info-copyright')" class="w-full">
      <Input v-model="patternInfo.copyright" data-testid="pattern-copyright-input" class="w-full" />
    </FormField>
    <FormField :label="$t('pattern-info-description')" class="w-full">
      <Textarea
        v-model="patternInfo.description"
        data-testid="pattern-description-textarea"
        autoresize
        class="w-full"
      />
    </FormField>
  </div>
</template>

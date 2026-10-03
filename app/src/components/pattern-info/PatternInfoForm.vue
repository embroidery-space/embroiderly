<script setup lang="ts">
import { FormField, Input, Textarea } from "@embroiderly/ui";

import { PatternInfo } from "~/lib/pattern/";

const patternInfo = defineModel<PatternInfo>({ required: true });
</script>

<template>
  <div :class="$style.root">
    <FormField :label="$t('pattern-info-title')">
      <Input v-model="patternInfo.title" data-testid="pattern-title-input" />
    </FormField>
    <FormField :label="$t('pattern-info-author')">
      <Input v-model="patternInfo.author" data-testid="pattern-author-input" />
    </FormField>
    <FormField :label="$t('pattern-info-copyright')">
      <Input v-model="patternInfo.copyright" data-testid="pattern-copyright-input" />
    </FormField>
    <FormField :label="$t('pattern-info-description')">
      <Textarea v-model="patternInfo.description" data-testid="pattern-description-textarea" autoresize />
    </FormField>
  </div>
</template>

<style module>
.root {
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--spacing) * 2);
}
</style>

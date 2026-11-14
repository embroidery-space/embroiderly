<script setup lang="ts">
import { Checkbox, FormField, InputNumber } from "@embroiderly/ui";

import type { TypstEditorSettings } from "../lib/codemirror/";

import AsideBlock from "./utils/AsideBlock.vue";

const settings = defineModel<TypstEditorSettings>({ required: true });
</script>

<template>
  <AsideBlock :title="$t('pdf-export-settings')">
    <FormField :label="$t('pdf-export-settings-font-size')">
      <InputNumber v-model="settings.fontSize" />
    </FormField>
    <Checkbox v-model="settings.fontLigatures" v-bind="$ta('pdf-export-settings-font-ligatures')" />
    <Checkbox v-model="settings.wrapLines" :label="$t('pdf-export-settings-line-wrapping')" />
  </AsideBlock>
</template>

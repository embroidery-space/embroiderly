<script setup lang="ts">
import { Checkbox } from "@embroiderly/ui";

import AsideBlock from "./utils/AsideBlock.vue";

const wrapLines = defineModel<boolean>("wrap-lines", { required: true });
</script>

<template>
  <AsideBlock :title="$t('pdf-export-settings')">
    <Checkbox v-model="wrapLines" :label="$t('pdf-export-settings-line-wrapping')" />
  </AsideBlock>
</template>

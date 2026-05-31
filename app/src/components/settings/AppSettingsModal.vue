<script setup lang="ts">
import { Dialog } from "@embroiderly/ui";

import { useSettingsStore } from "~/stores/";

import AppSettingsForm from "./AppSettingsForm.vue";

const settingsStore = useSettingsStore();
</script>

<template>
  <Dialog :title="$t('settings')">
    <template #body>
      <AppSettingsForm
        v-model:ui="settingsStore.ui"
        v-model:startup="settingsStore.startup"
        v-model:canvas="settingsStore.canvas"
        v-model:updater="settingsStore.updater"
        v-model:telemetry="settingsStore.telemetry"
        v-model:other="settingsStore.other"
      />
    </template>
  </Dialog>
</template>

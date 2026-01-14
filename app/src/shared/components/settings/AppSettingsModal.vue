<template>
  <UModal :title="$t('settings')" :ui="{ content: 'w-xl' }">
    <template #body>
      <AppSettingsForm
        v-model:ui="settingsStore.ui"
        v-model:startup="settingsStore.startup"
        v-model:viewport="settingsStore.viewport"
        v-model:updater="settingsStore.updater"
        v-model:telemetry="settingsStore.telemetry"
        v-model:other="settingsStore.other"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { useSettingsStore } from "#shared/stores/";

  import AppSettingsForm from "./AppSettingsForm.vue";

  const settingsStore = useSettingsStore();
</script>

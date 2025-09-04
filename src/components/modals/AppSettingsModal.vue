<template>
  <UModal :title="$t('title-settings')" :ui="{ content: 'w-xl' }">
    <template #body>
      <AppSettingsForm
        v-model:ui="settingsStore.ui"
        v-model:viewport="settingsStore.viewport"
        v-model:updater="settingsStore.updater"
        v-model:telemetry="settingsStore.telemetry"
        v-model:other="settingsStore.other"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  const settingsStore = useSettingsStore();
</script>

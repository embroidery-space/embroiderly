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
  import { posthog, AppEvent } from "#/vendor/";

  const settingsStore = useSettingsStore();
  settingsStore.$subscribe((_mutation, state) => {
    posthog.capture(
      new AppEvent.AppSettingsChanged({
        ui: state.ui,
        viewport: state.viewport,
        updater: state.updater,
        telemetry: state.telemetry,
        other: state.other,
      }),
    );
  });
</script>

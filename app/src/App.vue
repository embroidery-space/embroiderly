<template>
  <UApp :locale="currentUiLocale">
    <RouterView />
  </UApp>
</template>

<script lang="ts" setup>
  import { onMounted, onErrorCaptured } from "vue";

  import { useI18n } from "#shared/composables/";
  import { LoggerService } from "#shared/services/";
  import { useSettingsStore } from "#shared/stores/";

  const toast = useToast();
  const { fluent, currentUiLocale } = useI18n();

  const settingsStore = useSettingsStore();

  async function checkForUpdates() {
    await settingsStore.$tauri.start();
    if (settingsStore.updater.autoCheck) {
      await settingsStore.checkForUpdates({ auto: true });
    }
  }

  onMounted(async () => {
    await checkForUpdates();
  });

  onErrorCaptured((err, _component, info) => {
    // Log the error, notify the user, and let it be propagated further so that Sentry can handle it.
    LoggerService.error(`Error (${info}): ${err instanceof Error ? err.message : err}`);
    toast.add({ type: "background", color: "error", title: fluent.$t("error") });
  });
</script>

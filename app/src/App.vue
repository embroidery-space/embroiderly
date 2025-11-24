<template>
  <UApp :locale="currentUiLocale">
    <RouterView />
  </UApp>
</template>

<script lang="ts" setup>
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

  import { onMounted, onErrorCaptured } from "vue";

  import { useConfirm, useI18n } from "~/shared/composables/";

  import { FilesApi } from "./api/";
  import { LoggerService } from "./shared/services/";

  const confirm = useConfirm();
  const toast = useToast();
  const { fluent, currentUiLocale } = useI18n();

  const appStateStore = useAppStateStore();
  const settingsStore = useSettingsStore();

  const appWindow = getCurrentWebviewWindow();

  appWindow.onCloseRequested(async (e) => {
    const unsavedPatterns = await FilesApi.getUnsavedPatterns();
    if (unsavedPatterns.length) {
      const patterns = appStateStore.openedPatterns
        .filter(({ id }) => unsavedPatterns.includes(id))
        .map(({ title }) => `- ${title}`)
        .join("\n");

      const savePatterns = await confirm.open(fluent.$ta("unsaved-patterns", { patterns })).result;

      // If the user dismissed the dialog, prevent the window from closing.
      if (savePatterns === undefined) return e.preventDefault();

      if (savePatterns) await FilesApi.saveAllPatterns();
      await FilesApi.closeAllPatterns();
    }
  });

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

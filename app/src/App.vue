<template>
  <UApp :locale="currentUiLocale">
    <RouterView />
  </UApp>
</template>

<script lang="ts" setup>
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

  import { onMounted, onErrorCaptured } from "vue";

  import { PatternApi } from "./api/";

  const confirm = useConfirm();
  const toast = useToast();
  const { fluent, currentUiLocale } = useI18n();

  const appStateStore = useAppStateStore();
  const settingsStore = useSettingsStore();

  const appWindow = getCurrentWebviewWindow();

  appWindow.onCloseRequested(async (e) => {
    const unsavedPatterns = await PatternApi.getUnsavedPatterns();
    if (unsavedPatterns.length) {
      const patterns = appStateStore.openedPatterns
        .filter(({ id }) => unsavedPatterns.includes(id))
        .map(({ title }) => `- ${title}`)
        .join("\n");

      const unsavedPatternsMessage = fluent.$ta("unsaved-patterns", { patterns });
      const { title, description } = unsavedPatternsMessage as { title: string; description: string };
      const savePatterns = await confirm.open({ title, message: description }).result;

      // If the user dismissed the dialog, prevent the window from closing.
      if (savePatterns === undefined) return e.preventDefault();

      if (savePatterns) await PatternApi.saveAllPatterns();
      await PatternApi.closeAllPatterns();
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
    error(`Error (${info}): ${err instanceof Error ? err.message : err}`);
    toast.add({ type: "background", color: "error", title: fluent.$t("error") });
  });
</script>

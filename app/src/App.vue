<template>
  <UApp :locale="locale">
    <RouterView />
  </UApp>
</template>

<script lang="ts" setup>
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

  import { computed, onMounted, onErrorCaptured } from "vue";

  import { PatternApi } from "./api/";
  import { NUXT_LOCALES } from "./fluent.ts";

  const confirm = useConfirm();
  const toast = useToast();

  const fluent = useFluent();
  const locale = computed(() => {
    const bundles = [...fluent.bundles.value];
    const locale = bundles[0]!.locales[0]!;
    // @ts-expect-error The `locale` code is always a valid key in `NUXT_LOCALES`.
    return NUXT_LOCALES[locale];
  });

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

      const savePatterns = await confirm.open({
        title: fluent.$t("title-unsaved-changes"),
        message: fluent.$t("message-unsaved-patterns", { patterns }),
      }).result;

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
    toast.add({ type: "background", color: "error", title: fluent.$t("title-error") });
  });
</script>

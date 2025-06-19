<template>
  <UApp :locale="locale">
    <RouterView />
  </UApp>
  <DynamicDialog />
  <ConfirmDialog />
  <Toast position="bottom-right" />
</template>

<script lang="ts" setup>
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { computed, onMounted } from "vue";
  import { useSessionStorage } from "@vueuse/core";
  import { ConfirmDialog, DynamicDialog, Toast, useToast, useConfirm } from "primevue";
  import { useFluent } from "fluent-vue";
  import { NUXT_LOCALES } from "./fluent.ts";
  import { PatternApi } from "./api/";
  import { useAppStateStore, usePatternsStore, useSettingsStore } from "./stores/";

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
  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const appWindow = getCurrentWebviewWindow();

  appWindow.listen<string>("app:pattern-saved", ({ payload: patternId }) => {
    if (patternId === patternsStore.pattern?.id) {
      toast.add({ severity: "success", detail: fluent.$t("message-pattern-saved"), life: 3000 });
    }
  });
  appWindow.listen<string>("app:pattern-exported", ({ payload: patternId }) => {
    if (patternId === patternsStore.pattern?.id) {
      toast.add({ severity: "success", detail: fluent.$t("message-pattern-exported"), life: 3000 });
    }
  });

  appWindow.onCloseRequested(async (e) => {
    const unsavedPatterns = await PatternApi.getUnsavedPatterns();
    if (unsavedPatterns.length) {
      e.preventDefault();
      const patterns = appStateStore.openedPatterns
        .filter(({ id }) => unsavedPatterns.includes(id))
        .map(({ title }) => `- ${title}`)
        .join("\n");
      confirm.require({
        header: fluent.$t("title-unsaved-changes"),
        message: fluent.$t("message-unsaved-patterns", { patterns }),
        accept: async () => {
          await PatternApi.saveAllPatterns();
          await PatternApi.closeAllPatterns();
          await appWindow.destroy();
        },
        reject: async () => {
          await PatternApi.closeAllPatterns();
          await appWindow.destroy();
        },
      });
    }
  });

  const openedFilesProcessed = useSessionStorage("openedFilesProcessed", false);
  async function processOpenedFiles() {
    // @ts-expect-error This property is injected on the Rust side when handling file associations.
    const openedFiles: string[] = window.openedFiles;

    // Process opened files only if we haven't processed them yet.
    if (openedFiles.length && !openedFilesProcessed.value) {
      for (const file of openedFiles) await patternsStore.openPattern(file);
      openedFilesProcessed.value = true;
    } else {
      const currentPattern = appStateStore.currentPattern;
      if (currentPattern) await patternsStore.loadPattern(currentPattern.id);
    }
  }

  async function checkForUpdates() {
    await settingsStore.$tauri.start();
    if (settingsStore.updater.autoCheck) {
      await settingsStore.checkForUpdates({ auto: true });
    }
  }

  onMounted(async () => {
    await Promise.all([processOpenedFiles(), checkForUpdates()]);
  });

  window.onunhandledrejection = (event) => {
    const err = event.reason;
    if (err instanceof Error) {
      error(`Error: ${err.message}`);
      toast.add({ severity: "error", summary: fluent.$t("title-error"), detail: err.message });
    } else error(`Error: ${err}`);
  };
</script>

import { useToast } from "@embroiderly/ui";

import { useSessionStorage } from "@vueuse/core";
import { onMounted } from "vue";

import { useI18n } from "~/composables/";
import { LoggerService } from "~/services/";
import { StartupAction, usePatternFileStore, useSettingsStore } from "~/stores/";

/** Handles app startup actions, such as opening a pattern on startup. */
export function useAppStartup() {
  const { fluent } = useI18n();
  const toast = useToast();

  const patternFileStore = usePatternFileStore();
  const settingsStore = useSettingsStore();

  const startupHandled = useSessionStorage("embroiderly-startup-handled", false);

  async function handleFileAssociations(files: string[]) {
    for (const filePath of files) {
      try {
        const patternId = await patternFileStore.openPattern({ filePath });
        if (patternId) patternFileStore.switchPattern(patternId);
      } catch (error) {
        LoggerService.error(`Failed to open pattern from path (${filePath}): ${error}`);
        toast.add({
          type: "foreground",
          color: "error",
          title: fluent.$t("error"),
          description: fluent.$t("startup-file-association-failure", {
            filePath: filePath.replaceAll("\\", "/").split("/").pop() ?? filePath,
          }),
        });
      }
    }
  }

  async function handleOpenOnStartup() {
    switch (settingsStore.startup.action) {
      case StartupAction.NewPattern: {
        const id = await patternFileStore.createPattern();
        patternFileStore.switchPattern(id);
        break;
      }
      case StartupAction.CustomTemplate: {
        if (settingsStore.startup.patternTemplate) {
          try {
            const id = await patternFileStore.openPattern({ template: settingsStore.startup.patternTemplate });
            patternFileStore.switchPattern(id);
          } catch (error) {
            LoggerService.error(`Failed to open pattern from template: ${error}`);
            toast.add({
              type: "foreground",
              color: "error",
              title: fluent.$t("error"),
              description: fluent.$t("startup-template-failure", {
                filePath: settingsStore.startup.patternTemplate,
              }),
            });
          }
        }
        break;
      }
    }
  }

  onMounted(async () => {
    if (!startupHandled.value) {
      startupHandled.value = true;

      const openedFiles = window.openedFiles ?? [];

      // File associations are only relevant for Tauri, since there is no such a feature in the browsers.
      if (__TAURI__) await handleFileAssociations(openedFiles);

      // Handle the "Open on Startup" action only if there is no pattern open yet from the previous steps.
      if (openedFiles.length === 0 && !patternFileStore.openedPatterns.length) {
        await handleOpenOnStartup();
      }
    }

    if (!patternFileStore.currentPatternId && patternFileStore.openedPatterns.length) {
      patternFileStore.switchPattern(patternFileStore.openedPatterns[0]!.id);
    }
  });
}

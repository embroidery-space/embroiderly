import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { defineAsyncComponent, reactive, ref, watch } from "vue";
import { defineStore } from "pinia";
import { LOCALES } from "#/fluent.ts";
import type { WheelAction } from "#/core/pixi//";

export type Theme = "light" | "dark" | "system";
export type Scale = "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large";
export type Language = "en" | "uk";

export interface UiOptions {
  theme: Theme;
  scale: Scale;
  language: Language;
}

export interface ViewportOptions {
  antialias: boolean;
  wheelAction: WheelAction;
}
export type { WheelAction };

export interface UpdaterOptions {
  autoCheck: boolean;
}

export interface OtherOptions {
  usePaletteItemColorForStitchTools: boolean;
  autoSaveInterval: number;
}

export interface CheckForUpdatesOptions {
  /**
   * Identifies whether this is an automatic check or a manual check.
   * If true, the check will not prompt the user for confirmation, but instead will show a notification.
   * @default false
   */
  auto: boolean;
}

export const useSettingsStore = defineStore("embroiderly-settings", () => {
  const overlay = useOverlay();
  const appSettingModal = overlay.create(
    defineAsyncComponent(() => import("#/components/modals/AppSettingsModal.vue")),
  );

  const toast = useToast();
  const fluent = useFluent();

  const loadingUpdate = ref(false);

  const ui = reactive<UiOptions>({
    theme: "system",
    scale: "medium",
    language: "en",
  });
  watch(
    ui,
    async (newUi) => {
      await setAppTheme(newUi.theme === "system" ? null : newUi.theme);
      document.documentElement.style.fontSize = newUi.scale;
      fluent.bundles.value = [LOCALES[newUi.language]];
    },
    { immediate: true },
  );

  const viewport = reactive<ViewportOptions>({
    antialias: true,
    wheelAction: "zoom",
  });

  const updater = reactive<UpdaterOptions>({
    autoCheck: false,
  });

  const other = reactive<OtherOptions>({
    usePaletteItemColorForStitchTools: true,
    autoSaveInterval: 15,
  });

  function openSettingsModal() {
    appSettingModal.open();
  }

  async function checkForUpdates(options?: CheckForUpdatesOptions) {
    const type = options?.auto ? "background" : "foreground";
    try {
      loadingUpdate.value = true;
      const update = await check();
      if (update) {
        const { currentVersion, version } = update;
        const date = new Date(update.date!);
        toast.add({
          type,
          color: "info",
          title: fluent.$t("title-update-available"),
          description: fluent.$t("message-update-available", { currentVersion, version, date }),
          actions: [
            {
              label: fluent.$t("label-update-now"),
              onClick: async () => {
                try {
                  loadingUpdate.value = true;
                  await update.downloadAndInstall();
                  await relaunch();
                } finally {
                  loadingUpdate.value = false;
                }
              },
            },
          ],
        });
      } else {
        if (!options?.auto) {
          toast.add({
            type,
            color: "info",
            title: fluent.$t("title-no-updates-available"),
            description: fluent.$t("message-no-updates-available"),
          });
        }
      }
    } finally {
      loadingUpdate.value = false;
    }
  }

  return {
    loadingUpdate,
    ui,
    viewport,
    updater,
    other,
    openSettingsModal,
    checkForUpdates,
  };
});

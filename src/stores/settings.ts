import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";
import { defineAsyncComponent, reactive, ref, watch } from "vue";
import { defineStore } from "pinia";
import { useFluent } from "fluent-vue";
import { useConfirm, usePrimeVue } from "primevue";
import type { ConfirmationOptions } from "primevue/confirmationoptions";
import { LOCALES, PRIMEVUE_LOCALES } from "#/fluent.ts";
import type { WheelAction } from "#/pixi/";

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
  const AppSettings = defineAsyncComponent(() => import("#/components/dialogs/AppSettings.vue"));

  const overlay = useOverlay();
  const appSettingModal = overlay.create(AppSettings);

  const primevue = usePrimeVue();
  const confirm = useConfirm();
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
      primevue.config.locale = PRIMEVUE_LOCALES[newUi.language];
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

  function openSettings() {
    appSettingModal.open();
  }

  async function checkForUpdates(options?: CheckForUpdatesOptions) {
    let confirmOptions: ConfirmationOptions = {};
    if (options?.auto) {
      confirmOptions = {
        position: "bottomright",
        modal: false,
      };
    }

    try {
      loadingUpdate.value = true;
      const update = await check();
      if (update) {
        const { currentVersion, version } = update;
        const date = new Date(update.date!);
        confirm.require({
          ...confirmOptions,
          header: fluent.$t("title-update-available"),
          message: fluent.$t("message-update-available", { currentVersion, version, date }),
          accept: async () => {
            try {
              loadingUpdate.value = true;
              await update.downloadAndInstall();
              await relaunch();
            } finally {
              loadingUpdate.value = false;
            }
          },
        });
      } else {
        if (!options?.auto) {
          confirm.require({
            header: fluent.$t("title-no-updates-available"),
            message: fluent.$t("message-no-updates-available"),
            acceptProps: { style: { display: "none" } },
            rejectProps: { style: { display: "none" } },
          });
        }
      }
    } finally {
      loadingUpdate.value = false;
    }
  }

  defineShortcuts({
    "ctrl_,": () => openSettings(),
  });

  return {
    loadingUpdate,
    ui,
    viewport,
    updater,
    other,
    openSettings,
    checkForUpdates,
  };
});

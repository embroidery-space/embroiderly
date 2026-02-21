import { useOverlay, useToast } from "@embroiderly/ui";
import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";

import { defineStore } from "pinia";
import { defineAsyncComponent, reactive, ref, watch } from "vue";

import type { WheelAction } from "#pattern-editor/lib/pixi/";
import { useI18n } from "#shared/composables/";

export type Theme = "light" | "dark" | "system";
export type Scale = "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large";
export type Language = "en" | "uk";

export interface UiOptions {
  theme: Theme;
  scale: Scale;
  language: Language;
}

export enum StartupAction {
  Nothing = "Nothing",
  NewPattern = "NewPattern",
  CustomTemplate = "CustomTemplate",
}

export interface StartupOptions {
  action: StartupAction;
  templatePath: string;
}

export interface ViewportOptions {
  antialias: boolean;
  wheelAction: WheelAction;
}
export type { WheelAction };

export interface UpdaterOptions {
  autoCheck: boolean;
}

export interface CheckForUpdatesOptions {
  /**
   * Identifies whether this is an automatic check or a manual check.
   * If true, the check will not prompt the user for confirmation, but instead will show a notification.
   * @default false
   */
  auto: boolean;
}

/** Options for telemetry. */
export interface TelemetryOptions {
  /**
   * Whether errors monitoring is enabled or not.
   * @default false
   */
  diagnostics: boolean;

  /**
   * Whether metrics collection is enabled or not.
   * @default false
   */
  metrics: boolean;
}

export interface OtherOptions {
  usePaletteItemColorForStitchTools: boolean;
  autoSaveInterval: number;
}

export const useSettingsStore = defineStore("embroiderly-settings", () => {
  const overlay = useOverlay();
  const appSettingModal = overlay.create(
    defineAsyncComponent(() => import("#shared/components/settings/AppSettingsModal.vue")),
  );

  const { fluent, setLocale } = useI18n();
  const toast = useToast();

  const ui = reactive<UiOptions>({
    theme: "system",
    scale: "medium",
    language: "en",
  });
  watch(
    ui,
    async (newUi) => {
      document.documentElement.style.fontSize = newUi.scale;
      setLocale(newUi.language);
      await setAppTheme(newUi.theme === "system" ? null : newUi.theme);
    },
    { immediate: true },
  );

  const startup = reactive<StartupOptions>({
    action: StartupAction.NewPattern,
    templatePath: "",
  });

  const viewport = reactive<ViewportOptions>({
    antialias: true,
    wheelAction: "zoom",
  });

  const updater = reactive<UpdaterOptions>({
    autoCheck: false,
  });

  const telemetry = reactive<TelemetryOptions>({
    diagnostics: false,
    metrics: false,
  });

  const other = reactive<OtherOptions>({
    usePaletteItemColorForStitchTools: true,
    autoSaveInterval: 15,
  });

  function openSettingsModal() {
    appSettingModal.open();
  }

  const loadingUpdate = ref(false);
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
          actions: [
            {
              label: fluent.$t("updater-update-now"),
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
          ...fluent.$ta("updater-update-available", { currentVersion, version, date }),
        });
      } else {
        if (!options?.auto) {
          toast.add({
            type,
            color: "info",
            ...fluent.$ta("updater-no-updates-available"),
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
    startup,
    viewport,
    updater,
    telemetry,
    other,
    openSettingsModal,
    checkForUpdates,
  };
});

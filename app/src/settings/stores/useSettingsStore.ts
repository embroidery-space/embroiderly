import { useOverlay, useToast } from "@embroiderly/ui";

import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

import { useI18n } from "~/composables/";
import { useCloseAllPatterns } from "~/composables/core/";
import { LayerLayout, WheelAction } from "~/lib/types/";
import type { PatternOptions, RenderOptions, ViewportOptions } from "~/lib/types/";

import AppSettingModal from "../components/AppSettingsModal.vue";

export type Theme = "light" | "dark" | "system";
export type Scale = "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large";
export type Language = "en" | "uk";

export interface UiOptions {
  theme: Theme;
  scale: Scale;
  language: Language;
}

export const enum StartupAction {
  Nothing = "nothing",
  NewPattern = "new-pattern",
  CustomTemplate = "custom-template",
}

export interface StartupOptions {
  action: StartupAction;
  patternTemplate: string;
}

export interface CanvasOptions {
  renderOptions: RenderOptions;
  viewportOptions: ViewportOptions;
  patternOptions: PatternOptions;
}

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
  /**
   * The pattern auto save interval, in minutes.
   * @default 15
   */
  autoSaveInterval: number;

  /**
   * Whether to show the open demo pattern option in the file menu.
   * @default true
   */
  showOpenDemoPatternOption: boolean;

  /**
   * Whether to use the palette item color for stitch tools.
   * @default true
   */
  usePaletteItemColorForStitchTools: boolean;
}

export const useSettingsStore = defineStore(
  "embroiderly-settings",
  () => {
    const overlay = useOverlay();
    const appSettingModal = overlay.create(AppSettingModal);

    const { closeAllPatterns } = useCloseAllPatterns();
    const { fluent, setLocale } = useI18n();
    const toast = useToast();

    const ui = ref<UiOptions>({
      theme: "system",
      scale: "medium",
      language: "en",
    });
    watch(
      ui,
      (newUi) => {
        const theme = newUi.theme === "system" ? "light dark" : newUi.theme;
        document.documentElement.style.colorScheme = theme;

        // Polyfill fallback for LightningCSS transpiled `light-dark()` variables.
        if (newUi.theme === "light") {
          document.documentElement.style.setProperty("--lightningcss-light", "initial");
          document.documentElement.style.setProperty("--lightningcss-dark", " ");
        } else if (newUi.theme === "dark") {
          document.documentElement.style.setProperty("--lightningcss-light", " ");
          document.documentElement.style.setProperty("--lightningcss-dark", "initial");
        } else {
          document.documentElement.style.removeProperty("--lightningcss-light");
          document.documentElement.style.removeProperty("--lightningcss-dark");
        }

        document.documentElement.style.fontSize = newUi.scale;
        setLocale(newUi.language);
      },
      { immediate: true, deep: true },
    );

    const startup = ref<StartupOptions>({
      action: StartupAction.NewPattern,
      patternTemplate: "",
    });

    const canvas = ref<CanvasOptions>({
      renderOptions: { antialias: true },
      viewportOptions: { wheelAction: WheelAction.Zoom },
      patternOptions: { layerLayout: LayerLayout.ByLayerOrder },
    });

    const updater = ref<UpdaterOptions>({
      autoCheck: false,
    });

    const telemetry = ref<TelemetryOptions>({
      diagnostics: false,
      metrics: false,
    });

    const other = ref<OtherOptions>({
      autoSaveInterval: 15,
      showOpenDemoPatternOption: true,
      usePaletteItemColorForStitchTools: true,
    });

    function openSettingsModal() {
      appSettingModal.open();
    }

    const loadingUpdate = ref(false);
    async function checkForUpdates(options?: CheckForUpdatesOptions) {
      const type = options?.auto ? "background" : "foreground";
      try {
        loadingUpdate.value = true;

        if (__TAURI__) {
          const [{ check }, { relaunch }] = await Promise.all([
            import("@tauri-apps/plugin-updater"),
            import("@tauri-apps/plugin-process"),
          ]);

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
                  async onClick() {
                    try {
                      loadingUpdate.value = true;

                      if (!(await closeAllPatterns())) {
                        toast.add({ type: "foreground", color: "warning", ...fluent.$ta("updater-unsaved-changes") });
                        return;
                      }

                      await update.downloadAndInstall();
                      await relaunch();
                    } finally {
                      loadingUpdate.value = false;
                    }
                  },
                },
              ],
              ...fluent.$ta("updater-update-available-desktop", { currentVersion, version, date }),
            });
          } else if (!options?.auto) {
            toast.add({ type, color: "info", ...fluent.$ta("updater-no-updates-available") });
          }
        } else {
          const { useServiceWorker } = await import("~/composables/pwa");

          const pwa = useServiceWorker();

          const hasUpdate = await pwa.check();
          if (hasUpdate) {
            toast.add({
              type,
              color: "info",
              actions: [
                {
                  label: fluent.$t("updater-update-now"),
                  async onClick() {
                    try {
                      loadingUpdate.value = true;

                      if (!(await closeAllPatterns())) {
                        toast.add({ type: "foreground", color: "warning", ...fluent.$ta("updater-unsaved-changes") });
                        return;
                      }

                      await pwa.applyUpdate();
                    } finally {
                      loadingUpdate.value = false;
                    }
                  },
                },
              ],
              ...fluent.$ta("updater-update-available-pwa"),
            });
          } else if (!options?.auto) {
            toast.add({ type, color: "info", ...fluent.$ta("updater-no-updates-available") });
          }
        }
      } finally {
        loadingUpdate.value = false;
      }
    }

    const autoSaveIntervalInMillis = computed(() => other.value.autoSaveInterval * 60 * 1000);

    function $reset() {
      ui.value = {
        theme: "system",
        scale: "medium",
        language: "en",
      };
      startup.value = {
        action: StartupAction.NewPattern,
        patternTemplate: startup.value.patternTemplate,
      };
      canvas.value = {
        renderOptions: { antialias: true },
        viewportOptions: { wheelAction: WheelAction.Zoom },
        patternOptions: { layerLayout: LayerLayout.ByLayerOrder },
      };
      updater.value = {
        autoCheck: false,
      };
      telemetry.value = {
        diagnostics: false,
        metrics: false,
      };
      other.value = {
        autoSaveInterval: 15,
        showOpenDemoPatternOption: true,
        usePaletteItemColorForStitchTools: true,
      };
    }

    return {
      loadingUpdate,
      ui,
      startup,
      canvas,
      updater,
      telemetry,
      other,
      openSettingsModal,
      checkForUpdates,
      autoSaveIntervalInMillis,
      $reset,
    };
  },
  { persist: { omit: ["loadingUpdate"] } },
);

import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { defineAsyncComponent, reactive, watch } from "vue";
import { defineStore } from "pinia";
import { useFluent } from "fluent-vue";
import { useDialog, usePrimeVue } from "primevue";
import { LOCALES, PRIMEVUE_LOCALES } from "#/fluent";
import type { WheelAction } from "#/pixi";

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

export interface OtherOptions {
  usePaletteItemColorForStitchTools: boolean;
  autoSaveInterval: number;
}

export const useSettingsStore = defineStore(
  "embroiderly-settings",
  () => {
    const AppSettings = defineAsyncComponent(() => import("#/components/dialogs/AppSettings.vue"));

    const primevue = usePrimeVue();
    const dialog = useDialog();
    const fluent = useFluent();

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

    const other = reactive<OtherOptions>({
      usePaletteItemColorForStitchTools: true,
      autoSaveInterval: 15,
    });

    function openSettings() {
      dialog.open(AppSettings, {
        props: { header: fluent.$t("title-settings"), modal: true, dismissableMask: true },
      });
    }

    return {
      ui,
      viewport,
      other,
      openSettings,
    };
  },
  {
    tauri: {
      autoStart: true,
    },
  },
);

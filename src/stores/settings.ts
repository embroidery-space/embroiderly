import { setTheme as setAppTheme } from "@tauri-apps/api/app";
import { defineAsyncComponent, reactive, ref, watch } from "vue";
import { defineStore } from "pinia";
import { useFluent } from "fluent-vue";
import { useDialog } from "primevue";
import { LOCALES } from "#/fluent";
import type { WheelAction } from "#/pixi";

export type Theme = "light" | "dark" | "system";
export type Scale = "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large";
export type Language = "en" | "uk";

export interface ViewportOptions {
  antialias: boolean;
  wheelAction: WheelAction;
}
export type { WheelAction };

export const useSettingsStore = defineStore(
  "embroiderly-settings",
  () => {
    const AppSettings = defineAsyncComponent(() => import("#/components/dialogs/AppSettings.vue"));

    const dialog = useDialog();
    const fluent = useFluent();

    const theme = ref<Theme>("system");
    watch(
      theme,
      async (newTheme) => {
        await setAppTheme(newTheme === "system" ? null : newTheme);
      },
      { immediate: true },
    );

    const scale = ref<Scale>("medium");
    watch(
      scale,
      (newScale) => {
        document.documentElement.style.fontSize = newScale;
      },
      { immediate: true },
    );

    const language = ref<Language>("en");
    watch(
      language,
      (newLanguage) => {
        const bundle = LOCALES[newLanguage];
        fluent.bundles.value = [bundle];
      },
      { immediate: true },
    );

    const viewport = reactive<ViewportOptions>({
      antialias: true,
      wheelAction: "zoom",
    });

    const usePaletteItemColorForStitchTools = ref(true);

    function openSettings() {
      dialog.open(AppSettings, {
        props: { header: fluent.$t("title-settings"), modal: true, dismissableMask: true },
      });
    }

    return {
      theme,
      scale,
      language,
      viewport,
      usePaletteItemColorForStitchTools,
      openSettings,
    };
  },
  {
    tauri: {
      autoStart: true,
    },
  },
);

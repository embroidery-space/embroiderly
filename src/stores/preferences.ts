import { ref } from "vue";
import { defineStore } from "pinia";
import { getCurrentWindow } from "@tauri-apps/api/window";

export type Theme = "light" | "dark" | "system";

export const usePreferencesStore = defineStore(
  "embroidery-studio-preferences",
  () => {
    const theme = ref<Theme>("system");
    const usePaletteItemColorForStitchTool = ref(true);

    /**
     * Sets the application theme.
     *
     * @param newTheme - The new theme to be applied.
     * @returns A promise that resolves when the theme has been set.
     */
    async function setTheme(newTheme: Theme) {
      await getCurrentWindow().setTheme(newTheme === "system" ? null : newTheme);
      theme.value = newTheme;
    }

    return { theme, setTheme, usePaletteItemColorForStitchTool };
  },
  { persist: { storage: localStorage } },
);

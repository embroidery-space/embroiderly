import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { basename, join, sep } from "@tauri-apps/api/path";
import { open, save, type DialogFilter } from "@tauri-apps/plugin-dialog";
import { defineAsyncComponent, ref, shallowRef, triggerRef } from "vue";
import { useFluent } from "fluent-vue";
import { useConfirm } from "primevue";
import { defineStore } from "pinia";
import { useAppStateStore } from "./state";
import { DisplayApi, FabricApi, GridApi, HistoryApi, PaletteApi, PathApi, PatternApi, StitchesApi } from "#/api";
import { useShortcuts } from "#/composables";
import { PatternView } from "#/pixi";
import {
  AddedPaletteItemData,
  deserializeStitch,
  deserializeStitches,
  DisplayMode,
  PaletteSettings,
  PaletteItem,
  Fabric,
  Grid,
  PatternInfo,
  type Stitch,
} from "#/schemas";
import {
  PatternErrorBackupFileExists,
  PatternErrorUnsavedChanges,
  PatternErrorUnsupportedPatternType,
} from "#/error.ts";

const SAVE_AS_FILTERS: DialogFilter[] = [{ name: "Embroidery Project", extensions: ["embproj"] }];
const EXPORT_FILTERS: DialogFilter[] = [
  { name: "OXS", extensions: ["oxs"] },
  { name: "PDF", extensions: ["pdf"] },
];

export type OpenPatternOptions = PatternApi.OpenPatternOptions & {
  /**
   * Whether to assign the opened pattern to the current pattern in the app state.
   * @default true
   */
  assignToCurrent?: boolean;
};

export const usePatternsStore = defineStore(
  "embroiderly-patterns",
  () => {
    const overlay = useOverlay();
    const patternInfoModal = overlay.create(
      defineAsyncComponent(() => import("#/components/dialogs/PatternInfoProperties.vue")),
    );
    const fabricPropertiesModal = overlay.create(
      defineAsyncComponent(() => import("#/components/dialogs/FabricProperties.vue")),
    );
    const gridPropertiesModal = overlay.create(
      defineAsyncComponent(() => import("#/components/dialogs/GridProperties.vue")),
    );

    const appWindow = getCurrentWebviewWindow();

    const fluent = useFluent();
    const confirm = useConfirm();

    const appStateStore = useAppStateStore();

    const blocked = ref(false);
    const loading = ref(false);
    const pattern = shallowRef<PatternView>();

    async function loadPattern(id: string) {
      try {
        loading.value = true;
        pattern.value = new PatternView(await PatternApi.loadPattern(id));
        appStateStore.addOpenedPattern(pattern.value.id, pattern.value.info.title);
      } finally {
        loading.value = false;
      }
    }

    async function openPattern(filePath?: string, options?: OpenPatternOptions) {
      let path = filePath;
      if (!path) {
        appStateStore.lastOpenedFolder ??= await PathApi.getAppDocumentDir();
        const selectedPath = await open({
          defaultPath: appStateStore.lastOpenedFolder,
          multiple: false,
          filters: [
            { name: "Cross-Stitch Patterns", extensions: ["embproj", "oxs", "xsd"] },
            { name: "All Files", extensions: ["*"] },
          ],
        });
        if (selectedPath === null) return;
        path = selectedPath;
        appStateStore.lastOpenedFolder = path.substring(0, path.lastIndexOf(sep()));
      }

      try {
        loading.value = true;
        const rawPattern = await PatternApi.openPattern(path, options);
        appStateStore.addOpenedPattern(rawPattern.id, rawPattern.pattern.info.title);
        if (options?.assignToCurrent ?? true) pattern.value = new PatternView(rawPattern);
      } catch (error) {
        if (error instanceof PatternErrorUnsupportedPatternType) {
          confirm.require({
            header: fluent.$t("title-error"),
            message: fluent.$t("message-error-unsupported-pattern-type"),
            rejectProps: { style: { display: "none" } },
          });
          return;
        }
        if (error instanceof PatternErrorBackupFileExists) {
          confirm.require({
            header: fluent.$t("title-error"),
            message: fluent.$t("message-error-backup-file-exists"),
            accept: () => openPattern(path, { restoreFromBackup: true }),
            reject: () => openPattern(path, { restoreFromBackup: false }),
          });
          return;
        }
        throw error;
      } finally {
        loading.value = false;
      }
    }

    async function createPattern() {
      const fabric = await fabricPropertiesModal.open().result;
      if (fabric) {
        try {
          loading.value = true;
          pattern.value = new PatternView(await PatternApi.createPattern(fabric));
          appStateStore.addOpenedPattern(pattern.value.id, pattern.value.info.title);
        } finally {
          loading.value = false;
        }
      }
    }

    async function savePattern(as = false) {
      if (!pattern.value) return;
      try {
        let path = await PatternApi.getPatternFilePath(pattern.value.id);
        if (as) {
          appStateStore.lastSavedFolder ??= path.substring(0, path.lastIndexOf(sep()));
          const selectedPath = await save({
            defaultPath: await join(appStateStore.lastSavedFolder, await basename(path)),
            filters: SAVE_AS_FILTERS,
          });
          if (selectedPath === null) return;
          path = selectedPath;
          appStateStore.lastSavedFolder = path.substring(0, path.lastIndexOf(sep()));
        }
        loading.value = true;
        await PatternApi.savePattern(pattern.value.id, path);
      } catch (error) {
        if (error instanceof PatternErrorUnsupportedPatternType) {
          confirm.require({
            header: fluent.$t("title-error"),
            message: fluent.$t("message-error-unsupported-pattern-type-for-saving"),
            rejectProps: { style: { display: "none" } },
          });
          return;
        }
        throw error;
      } finally {
        loading.value = false;
      }
    }

    async function exportPattern(ext: string) {
      if (!pattern.value) return;
      try {
        const defaultPath = (await PatternApi.getPatternFilePath(pattern.value.id)).replace(/\.[^.]+$/, `.${ext}`);
        const path = await save({ defaultPath, filters: EXPORT_FILTERS.filter((f) => f.extensions.includes(ext)) });
        if (path === null) return;
        loading.value = true;
        if (ext === "oxs") await PatternApi.savePattern(pattern.value.id, path);
        else await PatternApi.exportPattern(pattern.value.id, path);
      } finally {
        loading.value = false;
      }
    }

    async function closePattern(id?: string, options?: PatternApi.ClosePatternOptions) {
      if (!pattern.value) return;
      const patternId = id ?? pattern.value.id;
      try {
        loading.value = true;
        await PatternApi.closePattern(patternId, options);
        appStateStore.removeCurrentPattern();
        if (!appStateStore.currentPattern) pattern.value = undefined;
        else await loadPattern(appStateStore.currentPattern.id);
      } catch (error) {
        if (error instanceof PatternErrorUnsavedChanges) {
          confirm.require({
            header: fluent.$t("title-unsaved-changes"),
            message: fluent.$t("message-unsaved-changes"),
            accept: async () => {
              const patternId = pattern.value!.id;
              const filePath = await PatternApi.getPatternFilePath(patternId);
              await PatternApi.savePattern(patternId, filePath);
              await closePattern(patternId);
            },
            reject: async () => {
              await closePattern(patternId, { force: true });
            },
          });
          return;
        }
        throw error;
      } finally {
        loading.value = false;
      }
    }

    async function updatePatternInfo() {
      if (!pattern.value) return;
      const patternInfo = await patternInfoModal.open({ patternInfo: pattern.value.info }).result;
      if (patternInfo) await PatternApi.updatePatternInfo(pattern.value.id, patternInfo);
    }
    appWindow.listen<string>("pattern-info:update", ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.info = PatternInfo.deserialize(payload);
    });

    async function updateFabric() {
      if (!pattern.value) return;
      const fabric = await fabricPropertiesModal.open({ fabric: pattern.value.fabric }).result;
      if (fabric) await FabricApi.updateFabric(pattern.value.id, fabric);
    }
    appWindow.listen<string>("fabric:update", ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.fabric = Fabric.deserialize(payload);
    });

    async function updateGrid() {
      if (!pattern.value) return;
      const grid = await gridPropertiesModal.open({ grid: pattern.value.grid }).result;
      if (grid) await GridApi.updateGrid(pattern.value!.id, grid);
    }
    appWindow.listen<string>("grid:update", ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.grid = Grid.deserialize(payload);
    });

    async function addPaletteItem(palitem: PaletteItem) {
      if (!pattern.value) return;
      await PaletteApi.addPaletteItem(pattern.value.id, palitem);
    }
    appWindow.listen<string>("palette:add_palette_item", ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.addPaletteItem(AddedPaletteItemData.deserialize(payload));
      triggerRef(pattern);
    });

    async function removePaletteItem(...paletteItemIndexes: number[]) {
      if (!pattern.value) return;
      await PaletteApi.removePaletteItems(pattern.value.id, paletteItemIndexes);
    }
    appWindow.listen<number[]>("palette:remove_palette_items", ({ payload: palindexes }) => {
      if (!pattern.value) return;
      for (const palindex of palindexes.reverse()) {
        pattern.value.removePaletteItem(palindex);
        if (appStateStore.selectedPaletteItemIndexes.includes(palindex)) appStateStore.selectedPaletteItemIndexes = [];
      }
      triggerRef(pattern);
    });

    async function updatePaletteDisplaySettings(displaySettings: PaletteSettings, local = false) {
      if (!pattern.value) return;
      if (local) {
        pattern.value.paletteDisplaySettings = displaySettings;
        triggerRef(pattern);
      } else await PaletteApi.updatePaletteDisplaySettings(pattern.value.id, displaySettings);
    }
    appWindow.listen<string>("palette:update_display_settings", ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.paletteDisplaySettings = PaletteSettings.deserialize(payload);
      triggerRef(pattern);
    });

    function addStitch(stitch: Stitch) {
      if (!pattern.value) return;
      return StitchesApi.addStitch(pattern.value.id, stitch);
    }
    function removeStitch(stitch: Stitch) {
      if (!pattern.value) return;
      return StitchesApi.removeStitch(pattern.value.id, stitch);
    }
    appWindow.listen<string>("stitches:add_one", ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.addStitch(deserializeStitch(payload));
    });
    appWindow.listen<string>("stitches:add_many", ({ payload }) => {
      if (!pattern.value) return;
      for (const stitch of deserializeStitches(payload)) pattern.value.addStitch(stitch);
    });
    appWindow.listen<string>("stitches:remove_one", ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.removeStitch(deserializeStitch(payload));
    });
    appWindow.listen<string>("stitches:remove_many", ({ payload }) => {
      if (!pattern.value) return;
      for (const stitch of deserializeStitches(payload)) pattern.value.removeStitch(stitch);
    });

    function setDisplayMode(mode: DisplayMode | undefined) {
      if (!pattern.value) return;
      if (!mode) {
        pattern.value.displayMode = mode;
        return triggerRef(pattern);
      } else return DisplayApi.setDisplayMode(pattern.value.id, mode);
    }
    appWindow.listen<DisplayMode>("display:set_mode", ({ payload: mode }) => {
      if (!pattern.value) return;
      pattern.value.displayMode = mode;
      triggerRef(pattern);
    });

    function showSymbols(value: boolean) {
      if (!pattern.value) return;
      return DisplayApi.showSymbols(pattern.value.id, value);
    }
    appWindow.listen<boolean>("display:show_symbols", ({ payload: value }) => {
      if (!pattern.value) return;
      pattern.value.showSymbols = value;
      triggerRef(pattern);
    });

    const shortcut = useShortcuts();

    shortcut.on("Ctrl+KeyO", openPattern);
    shortcut.on("Ctrl+KeyN", createPattern);
    shortcut.on("Ctrl+KeyS", savePattern);
    shortcut.on("Ctrl+Shift+KeyS", () => savePattern(true));
    shortcut.on("Ctrl+KeyW", closePattern);
    shortcut.on("Ctrl+KeyZ", async () => {
      if (!pattern.value) return;
      await HistoryApi.undo(pattern.value.id);
    });
    shortcut.on("Ctrl+KeyY", async () => {
      if (!pattern.value) return;
      await HistoryApi.redo(pattern.value.id);
    });

    return {
      blocked,
      loading,
      pattern,
      loadPattern,
      openPattern,
      createPattern,
      savePattern,
      exportPattern,
      closePattern,
      updatePatternInfo,
      updateFabric,
      updateGrid,
      addPaletteItem,
      removePaletteItem,
      updatePaletteDisplaySettings,
      addStitch,
      removeStitch,
      setDisplayMode,
      showSymbols,
    };
  },
  { tauri: { save: false, sync: false } },
);

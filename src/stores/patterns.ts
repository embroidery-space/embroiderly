import { getCurrentWindow } from "@tauri-apps/api/window";
import { basename, join, sep } from "@tauri-apps/api/path";
import { open, save, type DialogFilter } from "@tauri-apps/plugin-dialog";
import { defineAsyncComponent, ref, shallowRef, triggerRef } from "vue";
import { useFluent } from "fluent-vue";
import { useDialog } from "primevue";
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
  type Stitch,
} from "#/schemas/index.ts";

const SAVE_AS_FILTERS: DialogFilter[] = [
  { name: "Embroidery Project", extensions: ["embproj"] },
  { name: "Open Cross-Stitch", extensions: ["oxs", "xml"] },
];

export const usePatternsStore = defineStore("pattern-project", () => {
  const appWindow = getCurrentWindow();

  const fluent = useFluent();
  const dialog = useDialog();
  const FabricProperties = defineAsyncComponent(() => import("#/components/dialogs/FabricProperties.vue"));
  const GridProperties = defineAsyncComponent(() => import("#/components/dialogs/GridProperties.vue"));

  const appStateStore = useAppStateStore();

  const blocked = ref(false);
  const loading = ref(false);
  const pattern = shallowRef<PatternView>();

  async function loadPattern() {
    appStateStore.lastOpenedFolder ??= await PathApi.getAppDocumentDir();
    const path = await open({
      defaultPath: appStateStore.lastOpenedFolder,
      multiple: false,
      filters: [
        { name: "Cross-Stitch Patterns", extensions: ["xsd", "oxs", "xml", "embproj"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    if (path === null || Array.isArray(path)) return;
    appStateStore.lastOpenedFolder = path.substring(0, path.lastIndexOf(sep()));
    await openPattern(path);
  }

  async function openPattern(pathOrKey: string) {
    try {
      loading.value = true;
      pattern.value = new PatternView(await PatternApi.loadPattern(pathOrKey));
      appStateStore.addOpenedPattern(pattern.value.info.title, pattern.value.key);
    } finally {
      loading.value = false;
    }
  }

  function createPattern() {
    dialog.open(FabricProperties, {
      props: { header: fluent.$t("title-fabric-properties"), modal: true },
      onClose: async (options) => {
        if (!options?.data) return;
        const { fabric } = options.data;
        try {
          loading.value = true;
          pattern.value = new PatternView(await PatternApi.createPattern(fabric));
          appStateStore.addOpenedPattern(pattern.value.info.title, pattern.value.key);
        } finally {
          loading.value = false;
        }
      },
    });
  }

  async function savePattern(as = false) {
    if (!pattern.value) return;
    try {
      let path = await PatternApi.getPatternFilePath(pattern.value.key);
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
      await PatternApi.savePattern(pattern.value.key, path);
    } finally {
      loading.value = false;
    }
  }

  async function exportPattern(ext: string) {
    if (!pattern.value) return;
    try {
      const defaultPath = (await PatternApi.getPatternFilePath(pattern.value.key)).replace(/\.[^.]+$/, `.${ext}`);
      const path = await save({ defaultPath, filters: SAVE_AS_FILTERS.filter((f) => f.extensions.includes(ext)) });
      if (path === null) return;
      loading.value = true;
      await PatternApi.savePattern(pattern.value.key, path);
    } finally {
      loading.value = false;
    }
  }

  async function closePattern() {
    if (!pattern.value) return;
    try {
      loading.value = true;
      await PatternApi.closePattern(pattern.value.key);
      appStateStore.removeCurrentPattern();
      if (!appStateStore.currentPattern) pattern.value = undefined;
      else await openPattern(appStateStore.currentPattern.key);
    } finally {
      loading.value = false;
    }
  }

  function updateFabric() {
    if (!pattern.value) return;
    dialog.open(FabricProperties, {
      props: { header: fluent.$t("title-fabric-properties"), modal: true },
      data: { fabric: pattern.value.fabric },
      onClose: async (options) => {
        if (!options?.data) return;
        const { fabric } = options.data;
        await FabricApi.updateFabric(pattern.value!.key, fabric);
      },
    });
  }
  appWindow.listen<string>("fabric:update", ({ payload }) => {
    if (!pattern.value) return;
    pattern.value.setFabric(Fabric.deserialize(payload));
  });

  function updateGrid() {
    if (!pattern.value) return;
    dialog.open(GridProperties, {
      props: { header: fluent.$t("title-grid-properties"), modal: true },
      data: { grid: pattern.value.grid },
      onClose: async (options) => {
        if (!options?.data) return;
        const { grid } = options.data;
        await GridApi.updateGrid(pattern.value!.key, grid);
      },
    });
  }
  appWindow.listen<string>("grid:update", ({ payload }) => {
    if (!pattern.value) return;
    pattern.value.setGrid(Grid.deserialize(payload));
  });

  async function addPaletteItem(palitem: PaletteItem) {
    if (!pattern.value) return;
    await PaletteApi.addPaletteItem(pattern.value.key, palitem);
  }
  appWindow.listen<string>("palette:add_palette_item", ({ payload }) => {
    if (!pattern.value) return;
    pattern.value.addPaletteItem(AddedPaletteItemData.deserialize(payload));
    triggerRef(pattern);
  });

  async function removePaletteItem(...paletteItemIndexes: number[]) {
    if (!pattern.value) return;
    await PaletteApi.removePaletteItems(pattern.value.key, paletteItemIndexes);
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
    } else await PaletteApi.updatePaletteDisplaySettings(pattern.value.key, displaySettings);
  }
  appWindow.listen<string>("palette:update_display_settings", ({ payload }) => {
    if (!pattern.value) return;
    pattern.value.paletteDisplaySettings = PaletteSettings.deserialize(payload);
    triggerRef(pattern);
  });

  function addStitch(stitch: Stitch) {
    if (!pattern.value) return;
    return StitchesApi.addStitch(pattern.value.key, stitch);
  }
  function removeStitch(stitch: Stitch) {
    if (!pattern.value) return;
    return StitchesApi.removeStitch(pattern.value.key, stitch);
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
      pattern.value.setDisplayMode(mode);
      return triggerRef(pattern);
    } else return DisplayApi.setDisplayMode(pattern.value.key, mode);
  }
  appWindow.listen<DisplayMode>("display:set_mode", ({ payload: mode }) => {
    if (!pattern.value) return;
    pattern.value.setDisplayMode(mode);
    triggerRef(pattern);
  });

  function showSymbols(value: boolean) {
    if (!pattern.value) return;
    return DisplayApi.showSymbols(pattern.value.key, value);
  }
  appWindow.listen<boolean>("display:show_symbols", ({ payload: value }) => {
    if (!pattern.value) return;
    pattern.value.setShowSymbols(value);
    pattern.value.setDisplayMode(pattern.value.displayMode);
    triggerRef(pattern);
  });

  const shortcut = useShortcuts();

  shortcut.on("Ctrl+KeyO", loadPattern);
  shortcut.on("Ctrl+KeyN", createPattern);
  shortcut.on("Ctrl+KeyS", () => savePattern());
  shortcut.on("Ctrl+Shift+KeyS", () => savePattern(true));
  shortcut.on("Ctrl+KeyW", closePattern);
  shortcut.on("Ctrl+KeyZ", async () => {
    if (!pattern.value) return;
    await HistoryApi.undo(pattern.value.key);
  });
  shortcut.on("Ctrl+KeyY", async () => {
    if (!pattern.value) return;
    await HistoryApi.redo(pattern.value.key);
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
});

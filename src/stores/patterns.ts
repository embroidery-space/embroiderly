import { getCurrentWindow } from "@tauri-apps/api/window";
import { open, save } from "@tauri-apps/plugin-dialog";
import { defineAsyncComponent, ref, shallowRef, triggerRef } from "vue";
import { useMagicKeys, whenever } from "@vueuse/core";
import { useDialog } from "primevue";
import { defineStore } from "pinia";
import { deserialize } from "@dao-xyz/borsh";
import { toByteArray } from "base64-js";
import { useAppStateStore } from "./state";
import { FabricApi, GridApi, HistoryApi, PaletteApi, PathApi, PatternApi, StitchesApi } from "#/api";
import { PatternView } from "#/plugins/pixi";
import { AddedPaletteItemData, deserializeStitch, deserializeStitches } from "#/schemas/pattern";
import { PaletteItem, Fabric, Grid, type Stitch } from "#/schemas/pattern";

export const usePatternsStore = defineStore("pattern-project", () => {
  const appWindow = getCurrentWindow();

  const dialog = useDialog();
  const FabricProperties = defineAsyncComponent(() => import("#/components/dialogs/FabricProperties.vue"));
  const GridProperties = defineAsyncComponent(() => import("#/components/dialogs/GridProperties.vue"));

  const appStateStore = useAppStateStore();

  const loading = ref(false);
  const pattern = shallowRef<PatternView>();

  async function loadPattern() {
    const path = await open({
      defaultPath: await PathApi.getAppDocumentDir(),
      multiple: false,
      filters: [
        {
          name: "Cross-Stitch Pattern",
          extensions: ["xsd", "oxs", "embproj"],
        },
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    });
    if (path === null || Array.isArray(path)) return;
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
      props: {
        header: "Fabric Properties",
        modal: true,
      },
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

  async function savePattern() {
    if (!pattern.value) return;
    try {
      const path = await save({
        defaultPath: await PatternApi.getPatternFilePath(pattern.value.key),
        filters: [
          {
            name: "Cross-Stitch Pattern",
            extensions: ["oxs", "embproj"],
          },
        ],
      });
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
      if (!appStateStore.state.currentPattern) pattern.value = undefined;
      else await openPattern(appStateStore.state.currentPattern.key);
    } finally {
      loading.value = false;
    }
  }

  function updateFabric() {
    if (!pattern.value) return;
    dialog.open(FabricProperties, {
      props: {
        header: "Fabric Properties",
        modal: true,
      },
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
    pattern.value.setFabric(deserialize(toByteArray(payload), Fabric));
  });

  function updateGrid() {
    if (!pattern.value) return;
    dialog.open(GridProperties, {
      props: {
        header: "Grid Properties",
        modal: true,
      },
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
    pattern.value.setGrid(deserialize(toByteArray(payload), Grid));
  });

  async function addPaletteItem(palitem: PaletteItem) {
    if (!pattern.value) return;
    await PaletteApi.addPaletteItem(pattern.value.key, palitem);
  }
  appWindow.listen<string>("palette:add_palette_item", ({ payload }) => {
    if (!pattern.value) return;
    pattern.value.addPaletteItem(deserialize(toByteArray(payload), AddedPaletteItemData));
    triggerRef(pattern);
  });

  async function removePaletteItem(palitem: PaletteItem) {
    if (!pattern.value) return;
    await PaletteApi.removePaletteItem(pattern.value.key, palitem);
  }
  appWindow.listen<number>("palette:remove_palette_item", ({ payload: palindex }) => {
    if (!pattern.value) return;
    pattern.value.removePaletteItem(palindex);
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
    pattern.value.addStitch(deserializeStitch(toByteArray(payload)));
  });
  appWindow.listen<string>("stitches:add_many", ({ payload }) => {
    if (!pattern.value) return;
    for (const stitch of deserializeStitches(toByteArray(payload))) pattern.value.addStitch(stitch);
  });
  appWindow.listen<string>("stitches:remove_one", ({ payload }) => {
    if (!pattern.value) return;
    pattern.value.removeStitch(deserializeStitch(toByteArray(payload)));
  });
  appWindow.listen<string>("stitches:remove_many", ({ payload }) => {
    if (!pattern.value) return;
    for (const stitch of deserializeStitches(toByteArray(payload))) pattern.value.removeStitch(stitch);
  });

  const keys = useMagicKeys();
  whenever(keys["Ctrl+KeyZ"]!, async () => {
    if (!pattern.value) return;
    await HistoryApi.undo(pattern.value.key);
  });
  whenever(keys["Ctrl+KeyY"]!, async () => {
    if (!pattern.value) return;
    await HistoryApi.redo(pattern.value.key);
  });

  return {
    loading,
    pattern,
    loadPattern,
    openPattern,
    createPattern,
    savePattern,
    closePattern,
    updateFabric,
    updateGrid,
    addPaletteItem,
    removePaletteItem,
    addStitch,
    removeStitch,
  };
});

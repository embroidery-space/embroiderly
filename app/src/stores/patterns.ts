import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { defineAsyncComponent, ref, shallowRef, triggerRef } from "vue";
import { defineStore } from "pinia";
import {
  DisplayApi,
  FabricApi,
  GridApi,
  HistoryApi,
  ImageApi,
  PaletteApi,
  PatternApi,
  PublishApi,
  StitchesApi,
} from "#/api";
import {
  Pattern,
  PatternInfo,
  PatternEvent,
  AddedPaletteItemData,
  DisplayMode,
  PaletteSettings,
  PaletteItem,
  Fabric,
  Grid,
  PdfExportOptions,
  LayersVisibility,
  ReferenceImage,
  ReferenceImageSettings,
  deserializeStitches,
  type Stitch,
} from "#/core/pattern/";
import {
  PatternErrorBackupFileExists,
  PatternErrorUnsavedChanges,
  PatternErrorUnsupportedPatternType,
} from "#/error.ts";

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
      defineAsyncComponent(() => import("#/components/modals/PatternInfoModal.vue")),
    );
    const fabricModal = overlay.create(defineAsyncComponent(() => import("#/components/modals/FabricModal.vue")));
    const gridModal = overlay.create(defineAsyncComponent(() => import("#/components/modals/GridModal.vue")));
    const publishModal = overlay.create(defineAsyncComponent(() => import("#/components/modals/PublishModal.vue")));
    const pdfExportModal = overlay.create(defineAsyncComponent(() => import("#/components/modals/PdfExportModal.vue")));

    const appWindow = getCurrentWebviewWindow();

    const fluent = useFluent();
    const confirm = useConfirm();
    const filePicker = useFilePicker();

    const appStateStore = useAppStateStore();

    const blocked = ref(false);
    const loading = ref(false);
    const pattern = shallowRef<Pattern>();

    async function loadPattern(id: string) {
      try {
        loading.value = true;
        pattern.value = await PatternApi.loadPattern(id);
        appStateStore.addOpenedPattern(pattern.value.id, pattern.value.info.title);
      } finally {
        loading.value = false;
      }
    }

    async function openPattern(filePath?: string, options?: OpenPatternOptions) {
      let path = filePath;
      if (!path) {
        const selectedPath = await filePicker.open({ filters: filePicker.ANY_PATTERN_FILTER });
        if (selectedPath === null) return;
        path = selectedPath;
      }

      try {
        loading.value = true;
        const _pattern = await PatternApi.openPattern(path, options);
        appStateStore.addOpenedPattern(_pattern.id, _pattern.info.title);
        if (options?.assignToCurrent ?? true) pattern.value = _pattern;
      } catch (error) {
        if (error instanceof PatternErrorUnsupportedPatternType) {
          confirm.open({
            title: fluent.$t("title-error"),
            message: fluent.$t("message-error-unsupported-pattern-type"),
            acceptLabel: fluent.$t("label-ok"),
            rejectLabel: null,
          });
          return;
        }
        if (error instanceof PatternErrorBackupFileExists) {
          const accepted = await confirm.open({
            title: fluent.$t("title-error"),
            message: fluent.$t("message-error-backup-file-exists"),
          }).result;
          await openPattern(path, { restoreFromBackup: accepted });
          return;
        }
        throw error;
      } finally {
        loading.value = false;
      }
    }

    async function createPattern(fabric: Fabric) {
      try {
        loading.value = true;
        pattern.value = await PatternApi.createPattern(fabric);
        appStateStore.addOpenedPattern(pattern.value.id, pattern.value.info.title);
      } finally {
        loading.value = false;
      }
    }

    async function savePattern(as = false) {
      if (!pattern.value) return;
      try {
        let path = await PatternApi.getPatternFilePath(pattern.value.id);
        if (as) {
          const selectedPath = await filePicker.save(path, { filters: filePicker.EMBPROJ_FILTER });
          if (selectedPath === null) return;
          path = selectedPath;
        }
        loading.value = true;
        await PatternApi.savePattern(pattern.value.id, path);
      } catch (error) {
        if (error instanceof PatternErrorUnsupportedPatternType) {
          confirm.open({
            title: fluent.$t("title-error"),
            message: fluent.$t("message-error-unsupported-pattern-type-for-saving"),
            acceptLabel: fluent.$t("label-ok"),
            rejectLabel: null,
          });
          return;
        }
        throw error;
      } finally {
        loading.value = false;
      }
    }

    async function openExportModal(ext: "oxs" | "pdf") {
      if (!pattern.value) return;
      try {
        const filePath = (await PatternApi.getPatternFilePath(pattern.value.id)).replace(/\.[^.]+$/, `.${ext}`);
        switch (ext) {
          case "oxs": {
            await exportPatternAsOxs(filePath);
            break;
          }
          case "pdf": {
            pdfExportModal.open({
              filePath,
              options: pattern.value.pdfExportOptions,
            });
            break;
          }
        }
      } finally {
        loading.value = false;
      }
    }

    async function exportPatternAsOxs(filePath: string) {
      if (!pattern.value) return;

      const path = await filePicker.save(filePath, { filters: filePicker.OXS_FILTER });
      if (path === null) return;

      try {
        loading.value = true;
        await PatternApi.savePattern(pattern.value.id, path);
      } finally {
        loading.value = false;
      }
    }

    async function exportPatternAsPdf(filePath: string, options: PdfExportOptions) {
      if (!pattern.value) return;
      try {
        loading.value = true;
        await PatternApi.exportPattern(pattern.value.id, filePath, options);
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
          const accepted = await confirm.open({
            title: fluent.$t("title-unsaved-changes"),
            message: fluent.$t("message-unsaved-changes"),
          }).result;

          // If the user dismisses the dialog, prevent the window from closing.
          if (accepted === undefined) return;

          if (accepted) {
            const patternId = pattern.value!.id;
            const filePath = await PatternApi.getPatternFilePath(patternId);
            await PatternApi.savePattern(patternId, filePath);
            await closePattern(patternId);
          } else await closePattern(patternId, { force: true });

          return;
        }
        throw error;
      } finally {
        loading.value = false;
      }
    }

    async function setReferenceImage() {
      if (!pattern.value) return;

      const selectedPath = await filePicker.open({ filters: filePicker.ANY_IMAGE_FILTER });
      if (selectedPath === null) return;

      await ImageApi.setReferenceImage(pattern.value.id, selectedPath);
    }
    async function removeReferenceImage() {
      if (!pattern.value) return;
      await ImageApi.removeReferenceImage(pattern.value.id);
    }
    appWindow.listen<string>("image:set", ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.referenceImage = ReferenceImage.deserialize(payload);
      triggerRef(pattern);
    });

    async function updateReferenceImageSettings(settings: ReferenceImageSettings) {
      if (!pattern.value) return;
      await ImageApi.updateReferenceImageSettings(pattern.value.id, settings);
    }
    appWindow.listen<string>(PatternEvent.UpdateReferenceImageSettings, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.referenceImageSettings = ReferenceImageSettings.deserialize(payload);
    });

    function openPatternInfoModal() {
      if (!pattern.value) return;
      patternInfoModal.open({ patternInfo: pattern.value.info });
    }
    async function updatePatternInfo(patternInfo: PatternInfo) {
      if (!pattern.value) return;
      await PatternApi.updatePatternInfo(pattern.value.id, patternInfo);
    }
    appWindow.listen<string>(PatternEvent.UpdatePatternInfo, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.info = PatternInfo.deserialize(payload);
      appStateStore.updateOpenedPattern(pattern.value.id, pattern.value.info.title);
    });

    function openFabricModal(fabric?: Fabric) {
      fabricModal.open({ fabric });
    }
    async function updateFabric(fabric: Fabric) {
      if (!pattern.value) return;
      await FabricApi.updateFabric(pattern.value.id, fabric);
    }
    appWindow.listen<string>(PatternEvent.UpdateFabric, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.fabric = Fabric.deserialize(payload);
    });

    function openGridModal() {
      if (!pattern.value) return;
      gridModal.open({ grid: pattern.value.grid });
    }
    async function updateGrid(grid: Grid) {
      if (!pattern.value) return;
      await GridApi.updateGrid(pattern.value!.id, grid);
    }
    appWindow.listen<string>(PatternEvent.UpdateGrid, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.grid = Grid.deserialize(payload);
    });

    async function addPaletteItem(palitem: PaletteItem) {
      if (!pattern.value) return;
      await PaletteApi.addPaletteItem(pattern.value.id, palitem);
    }
    appWindow.listen<string>(PatternEvent.AddPaletteItem, ({ payload }) => {
      if (!pattern.value) return;
      const { palitem, palindex } = AddedPaletteItemData.deserialize(payload);
      pattern.value.addPaletteItem(palitem, palindex);
      triggerRef(pattern);
    });

    async function removePaletteItem(...paletteItemIndexes: number[]) {
      if (!pattern.value) return;
      await PaletteApi.removePaletteItems(pattern.value.id, paletteItemIndexes);
    }
    appWindow.listen<number[]>(PatternEvent.RemovePaletteItem, ({ payload: palindexes }) => {
      if (!pattern.value) return;
      for (const palindex of palindexes.reverse()) {
        pattern.value.removePaletteItem(palindex);
        if (appStateStore.selectedPaletteItemIndexes.includes(palindex)) appStateStore.selectedPaletteItemIndexes = [];
      }
      triggerRef(pattern);
    });

    async function updatePaletteDisplaySettings(settings: PaletteSettings, local = false) {
      if (!pattern.value) return;
      if (local) {
        pattern.value.paletteDisplaySettings = settings;
        triggerRef(pattern);
      } else await PaletteApi.updatePaletteDisplaySettings(pattern.value.id, settings);
    }
    appWindow.listen<string>(PatternEvent.UpdatePaletteDisplaySettings, ({ payload }) => {
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
    appWindow.listen<string>(PatternEvent.AddStitch, ({ payload }) => {
      if (!pattern.value) return;
      for (const stitch of deserializeStitches(payload)) pattern.value.addStitch(stitch);
    });
    appWindow.listen<string>(PatternEvent.RemoveStitch, ({ payload }) => {
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
    appWindow.listen<DisplayMode>(PatternEvent.UpdateDisplayMode, ({ payload: mode }) => {
      if (!pattern.value) return;
      pattern.value.displayMode = mode;
      triggerRef(pattern);
    });

    function showSymbols(value: boolean) {
      if (!pattern.value) return;
      return DisplayApi.showSymbols(pattern.value.id, value);
    }
    appWindow.listen<boolean>(PatternEvent.UpdateShowSymbols, ({ payload: value }) => {
      if (!pattern.value) return;
      pattern.value.showSymbols = value;
      triggerRef(pattern);
    });

    function setLayersVisibility(layersVisibility: LayersVisibility) {
      if (!pattern.value) return;
      return DisplayApi.setLayersVisibility(pattern.value.id, layersVisibility);
    }
    appWindow.listen<string>(PatternEvent.UpdateLayersVisibility, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.layersVisibility = LayersVisibility.deserialize(payload);
      triggerRef(pattern);
    });

    function openPublishModal() {
      if (!pattern.value) return;
      publishModal.open({ options: pattern.value.pdfExportOptions });
    }
    async function updatePdfExportOptions(options: PdfExportOptions) {
      if (!pattern.value) return;
      await PublishApi.updatePdfExportOptions(pattern.value.id, options);
    }
    appWindow.listen<string>(PatternEvent.UpdatePdfExportOptions, ({ payload }) => {
      if (!pattern.value) return;
      pattern.value.pdfExportOptions = PdfExportOptions.deserialize(payload);
    });

    async function undo(options?: HistoryApi.UndoRedoOptions) {
      if (!pattern.value) return;
      await HistoryApi.undo(pattern.value.id, options);
    }

    async function redo(options?: HistoryApi.UndoRedoOptions) {
      if (!pattern.value) return;
      await HistoryApi.redo(pattern.value.id, options);
    }

    async function startTransaction() {
      if (!pattern.value) return;
      await HistoryApi.startTransaction(pattern.value.id);
    }

    async function endTransaction() {
      if (!pattern.value) return;
      await HistoryApi.endTransaction(pattern.value.id);
    }

    return {
      blocked,
      loading,
      pattern,
      loadPattern,
      openPattern,
      createPattern,
      savePattern,
      openExportModal,
      exportPatternAsOxs,
      exportPatternAsPdf,
      closePattern,
      setReferenceImage,
      removeReferenceImage,
      updateReferenceImageSettings,
      openPatternInfoModal,
      updatePatternInfo,
      openFabricModal,
      updateFabric,
      openGridModal,
      updateGrid,
      addPaletteItem,
      removePaletteItem,
      updatePaletteDisplaySettings,
      addStitch,
      removeStitch,
      setDisplayMode,
      showSymbols,
      setLayersVisibility,
      openPublishModal,
      updatePdfExportOptions,
      undo,
      redo,
      startTransaction,
      endTransaction,
    };
  },
  { tauri: { save: false, sync: false } },
);

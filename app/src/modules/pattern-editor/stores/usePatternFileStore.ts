import { defineStore } from "pinia";
import { ref } from "vue";

import type { Fabric, PdfExportOptions } from "~/core/pattern/";
import {
  PatternErrorBackupFileExists,
  PatternErrorUnsavedChanges,
  PatternErrorUnsupportedPatternType,
} from "~/shared/api/";
import { useConfirm, useFilePicker, useI18n } from "~/shared/composables/";
import { ANY_PATTERN_FILTER, EMBPROJ_FILTER, OXS_FILTER } from "~/shared/constants/";

import { FilesApi } from "../api/";

export const usePatternFileStore = defineStore(
  "embroiderly-pattern-files",
  () => {
    const { fluent } = useI18n();
    const confirm = useConfirm();
    const toast = useToast();
    const filePicker = useFilePicker();

    const openedPatterns = ref<{ id: string; title: string }[]>([]);
    const loading = ref(false);

    function addOpenedPattern(id: string, title: string) {
      if (openedPatterns.value.some((p) => p.id === id)) return;
      openedPatterns.value.push({ id, title });
    }

    function removeOpenedPattern(id: string) {
      const index = openedPatterns.value.findIndex((p) => p.id === id);
      if (index !== -1) openedPatterns.value.splice(index, 1);
    }

    async function loadPattern(id: string) {
      try {
        loading.value = true;

        const pattern = await FilesApi.loadPattern(id);
        addOpenedPattern(pattern.id, pattern.info.title);

        return pattern;
      } finally {
        loading.value = false;
      }
    }

    async function openPattern(filePath?: string, options?: FilesApi.OpenPatternOptions) {
      const path = filePath ?? (await filePicker.open({ filters: ANY_PATTERN_FILTER }));
      if (!path) return;

      try {
        loading.value = true;
        return await FilesApi.openPattern(path, options);
      } catch (error) {
        if (error instanceof PatternErrorUnsupportedPatternType) {
          confirm.open({
            title: fluent.$t("error"),
            description: fluent.$t("pattern-open-unsupported-type"),
            yesButton: { label: fluent.$t("confirm-ok") },
            noButton: null,
          });
          return;
        }
        if (error instanceof PatternErrorBackupFileExists) {
          const accepted = await confirm.open({
            title: fluent.$t("error"),
            description: fluent.$t("pattern-backup-file-exists"),
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
        return await FilesApi.createPattern(fabric);
      } finally {
        loading.value = false;
      }
    }

    async function savePattern(id: string, as = false) {
      try {
        let path = await FilesApi.getPatternFilePath(id);
        if (as) {
          const selectedPath = await filePicker.save(path, { filters: EMBPROJ_FILTER });
          if (selectedPath === null) return;
          path = selectedPath;
        }

        loading.value = true;
        await FilesApi.savePattern(id, path);
      } catch (error) {
        if (error instanceof PatternErrorUnsupportedPatternType) {
          confirm.open({
            title: fluent.$t("error"),
            description: fluent.$t("pattern-save-unsupported-type"),
            yesButton: { label: fluent.$t("confirm-ok") },
            noButton: null,
          });
        } else {
          toast.add({ color: "error", title: fluent.$t("pattern-save-failure"), duration: 3000 });
        }
      } finally {
        loading.value = false;
      }
    }

    async function closePattern(id: string, options?: FilesApi.ClosePatternOptions) {
      try {
        loading.value = true;
        await FilesApi.closePattern(id, options);
        removeOpenedPattern(id);
      } catch (error) {
        if (error instanceof PatternErrorUnsavedChanges) {
          const accepted = await confirm.open(fluent.$ta("unsaved-changes")).result;

          // If the user dismisses the dialog, prevent the window from closing.
          if (accepted === undefined) return;

          if (accepted) {
            const filePath = await FilesApi.getPatternFilePath(id);
            await FilesApi.savePattern(id, filePath);
            await closePattern(id);
          } else await closePattern(id, { force: true });

          return;
        }
        throw error;
      } finally {
        loading.value = false;
      }
    }

    async function exportPatternAsOxs(id: string, filePath: string) {
      const path = await filePicker.save(filePath, { filters: OXS_FILTER });
      if (path === null) return;

      try {
        loading.value = true;
        await FilesApi.savePattern(id, path);
      } finally {
        loading.value = false;
      }
    }

    async function exportPatternAsPdf(id: string, filePath: string, options: PdfExportOptions) {
      try {
        loading.value = true;
        await FilesApi.exportPattern(id, filePath, options);
        toast.add({ color: "success", title: fluent.$t("pattern-export-success"), duration: 3000 });
      } catch {
        toast.add({ color: "error", title: fluent.$t("pattern-export-failure"), duration: 3000 });
      } finally {
        loading.value = false;
      }
    }

    async function fetchOpenedPatterns() {
      for (const [id, title] of await FilesApi.getOpenedPatterns()) {
        addOpenedPattern(id, title);
      }
    }

    async function getUnsavedPatterns() {
      const patterns = await FilesApi.getUnsavedPatterns();
      return openedPatterns.value.filter((pattern) => patterns.includes(pattern.id));
    }

    function saveAllPatterns() {
      return FilesApi.saveAllPatterns();
    }

    function closeAllPatterns() {
      return FilesApi.closeAllPatterns();
    }

    return {
      openedPatterns,
      loading,
      loadPattern,
      openPattern,
      createPattern,
      savePattern,
      closePattern,
      exportPatternAsOxs,
      exportPatternAsPdf,
      getUnsavedPatterns,
      fetchOpenedPatterns,
      saveAllPatterns,
      closeAllPatterns,
    };
  },
  { tauri: { save: false, sync: false } },
);

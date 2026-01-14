import { defineStore } from "pinia";
import { ref } from "vue";

import type { Fabric, PdfExportOptions } from "#pattern-editor/lib/pattern/";
import { BackupFileExistsError, UnsavedChangesError, UnsupportedPatternTypeError } from "#shared/api/";
import { useConfirm, useFilePicker, useI18n } from "#shared/composables/";
import { ANY_PATTERN_FILTER, EMBPROJ_FILTER, OXS_FILTER } from "#shared/constants/";

import { FilesApi } from "../api/";

const MAX_RECENT_PATTERNS = 5;

export const usePatternFileStore = defineStore(
  "embroiderly-pattern-files",
  () => {
    const { fluent } = useI18n();
    const confirm = useConfirm();
    const toast = useToast();
    const filePicker = useFilePicker();

    const openedPatterns = ref<{ id: string; title: string }[]>([]);
    const recentPatterns = ref<string[]>([]);
    const loading = ref(false);

    function addOpenedPattern(id: string, title: string) {
      if (openedPatterns.value.some((p) => p.id === id)) return;
      openedPatterns.value.push({ id, title });
    }

    function removeOpenedPattern(id: string) {
      const index = openedPatterns.value.findIndex((p) => p.id === id);
      if (index !== -1) openedPatterns.value.splice(index, 1);
    }

    function updateOpenedPattern(id: string, title: string) {
      const pattern = openedPatterns.value.find((p) => p.id === id);
      if (pattern) pattern.title = title;
    }

    function addRecentPattern(filePath: string) {
      // Delete an existing entry to maintain the order.
      const index = recentPatterns.value.indexOf(filePath);
      if (index !== -1) recentPatterns.value.splice(index, 1);

      recentPatterns.value.unshift(filePath);
      recentPatterns.value = recentPatterns.value.slice(0, MAX_RECENT_PATTERNS);
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

        const patternId = await FilesApi.openPattern(path, options);
        addRecentPattern(path);

        return patternId;
      } catch (error) {
        if (error instanceof UnsupportedPatternTypeError) {
          confirm.open({
            title: fluent.$t("error"),
            description: fluent.$t("pattern-open-unsupported-type"),
            yesButton: { label: fluent.$t("confirm-ok") },
            noButton: null,
          });
          return;
        }
        if (error instanceof BackupFileExistsError) {
          const accepted = await confirm.open({
            title: fluent.$t("error"),
            description: fluent.$t("pattern-backup-file-exists"),
          }).result;
          return await openPattern(path, { restoreFromBackup: accepted });
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

    /**
     * Saves the pattern to a file.
     * @param id - The pattern ID to save.
     * @param as - If true, always show the file picker (Save As).
     * @returns `true` if the pattern was saved successfully, `false` if cancelled or failed.
     */
    async function savePattern(id: string, as = false) {
      try {
        let path = await FilesApi.getPatternFilePath(id);
        if (path === null || as) {
          path ??= await FilesApi.getPatternDefaultFilePath(id);

          const selectedPath = await filePicker.save(path, { filters: EMBPROJ_FILTER });
          if (selectedPath === null) return false;

          path = selectedPath;
        }

        loading.value = true;
        await FilesApi.savePattern(id, path);

        return true;
      } catch (error) {
        if (error instanceof UnsupportedPatternTypeError) {
          confirm.open({
            title: fluent.$t("error"),
            description: fluent.$t("pattern-save-unsupported-type"),
            yesButton: { label: fluent.$t("confirm-ok") },
            noButton: null,
          });
        } else {
          toast.add({ color: "error", title: fluent.$t("pattern-save-failure"), duration: 3000 });
        }

        return false;
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
        if (error instanceof UnsavedChangesError) {
          const pattern = openedPatterns.value.find((p) => p.id === id)!;

          const accepted = await confirm.open(fluent.$ta("unsaved-changes", { pattern: pattern.title })).result;
          if (accepted === undefined) return;
          else if (accepted) {
            const saved = await savePattern(id);
            if (!saved) return;

            await closePattern(id);
          } else {
            await closePattern(id, { force: true });
          }

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
      const patterns = await FilesApi.getOpenedPatterns();
      for (const [id, title] of patterns) {
        addOpenedPattern(id, title);
      }
    }

    async function getUnsavedPatterns() {
      const patterns = await FilesApi.getUnsavedPatterns();
      return openedPatterns.value.filter((pattern) => patterns.includes(pattern.id));
    }

    return {
      openedPatterns,
      recentPatterns,
      loading,
      updateOpenedPattern,
      loadPattern,
      openPattern,
      createPattern,
      savePattern,
      closePattern,
      exportPatternAsOxs,
      exportPatternAsPdf,
      getUnsavedPatterns,
      fetchOpenedPatterns,
    };
  },
  {
    tauri: {
      autoStart: true,
      saveOnChange: true,
      filterKeys: ["recentPatterns"],
      filterKeysStrategy: "pick",
    },
  },
);

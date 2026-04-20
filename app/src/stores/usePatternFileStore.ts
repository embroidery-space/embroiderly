import { useConfirm, useToast } from "@embroiderly/ui";

import { useLocalStorage, useSessionStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

import { FilesApi } from "~/api/";
import { useEditor, useFilePicker, useI18n } from "~/composables/";
import { UnsavedChangesError, UnsupportedPatternTypeError } from "~/lib/errors.ts";
import { Fabric, Pattern } from "~/lib/pattern/";
import type { PdfExportOptions } from "~/lib/pattern/";

const MAX_RECENT_PATTERNS = 5;

export interface OpenPattern {
  id: string;
  title: string;
  dirty: boolean;
}

export const usePatternFileStore = defineStore(
  "embroiderly-pattern-files",
  () => {
    const { fluent } = useI18n();
    const confirm = useConfirm();
    const toast = useToast();
    const filePicker = useFilePicker();

    const { editor, events } = useEditor();

    const currentPatternId = useSessionStorage<string | undefined>("embroiderly-current-pattern", undefined);

    const openedPatterns = useSessionStorage<OpenPattern[]>("embroiderly-opened-patterns", []);
    const recentPatterns = useLocalStorage<string[]>("embroiderly-recent-patterns", []);

    const patternHandles = new Map<string, FileSystemFileHandle>();

    const loading = ref(false);

    function switchPattern(id: string) {
      currentPatternId.value = id;
    }

    function addOpenedPattern(id: string, title: string) {
      if (openedPatterns.value.some((p) => p.id === id)) return;
      openedPatterns.value.push({ id, title, dirty: false });
    }

    function removeOpenedPattern(id: string) {
      const index = openedPatterns.value.findIndex((p) => p.id === id);
      if (index !== -1) openedPatterns.value.splice(index, 1);
    }

    function updateOpenedPattern(id: string, title: string) {
      const pattern = openedPatterns.value.find((p) => p.id === id);
      if (pattern) pattern.title = title;
    }

    function addRecentPattern(fileName: string) {
      const index = recentPatterns.value.indexOf(fileName);
      if (index !== -1) recentPatterns.value.splice(index, 1);
      recentPatterns.value.unshift(fileName);
      recentPatterns.value = recentPatterns.value.slice(0, MAX_RECENT_PATTERNS);
    }

    // oxlint-disable-next-line require-await
    async function loadPattern(id: string) {
      try {
        loading.value = true;

        const pattern = Pattern.deserialize(editor.loadPattern(id));
        addOpenedPattern(pattern.id, pattern.info.title);

        return pattern;
      } finally {
        loading.value = false;
      }
    }

    async function openPattern() {
      try {
        loading.value = true;

        const fileHandle = await filePicker.open({ types: filePicker.filters.pattern });
        if (!fileHandle) return;

        const file = await fileHandle.getFile();
        const data = new Uint8Array(await file.arrayBuffer());

        const patternId = editor.openPattern(data, file.name);
        patternHandles.set(patternId, fileHandle);
        addRecentPattern(file.name);

        return patternId;
      } catch (err) {
        if (err instanceof UnsupportedPatternTypeError) {
          confirm.open({
            title: fluent.$t("error"),
            description: fluent.$t("pattern-open-unsupported-type"),
            yesButton: { label: fluent.$t("confirm-ok") },
            noButton: null,
          });
          return;
        }
        throw err;
      } finally {
        loading.value = false;
      }
    }

    // oxlint-disable-next-line require-await
    async function createPattern(fabric: Fabric) {
      try {
        loading.value = true;
        return editor.createPattern(Fabric.serialize(fabric));
      } finally {
        loading.value = false;
      }
    }

    /**
     * Saves the pattern to a file.
     * @param id - The pattern ID to save.
     * @param as - If true, always show the save picker (Save As).
     * @returns `true` if the pattern was saved successfully, `false` if cancelled or failed.
     */
    async function savePattern(id: string, as = false) {
      try {
        let handle = patternHandles.get(id);
        if (!handle || as) {
          const pattern = openedPatterns.value.find((p) => p.id === id);
          const suggestedName = `${pattern?.title ?? "pattern"}.embproj`;
          const picked = await filePicker.save({
            suggestedName,
            types: filePicker.filters.embproj,
          });
          if (!picked) return false;
          handle = picked;
        }

        loading.value = true;

        const file = await handle!.getFile();
        const bytes = editor.encodePattern(id, file.name);

        const writable = await handle!.createWritable();
        await writable.write(new Uint8Array(bytes));
        await writable.close();

        patternHandles.set(id, handle!);
        editor.checkpoint(id);
        return true;
      } catch (err) {
        if (err instanceof UnsupportedPatternTypeError) {
          confirm.open({
            title: fluent.$t("error"),
            description: fluent.$t("pattern-save-unsupported-type"),
            yesButton: { label: fluent.$t("confirm-ok") },
            noButton: null,
          });
        } else {
          toast.add({
            color: "error",
            title: fluent.$t("pattern-save-failure"),
            duration: 3000,
          });
        }
        return false;
      } finally {
        loading.value = false;
      }
    }

    async function closePattern(id: string, options?: { force?: boolean }) {
      try {
        loading.value = true;

        editor.closePattern(id, options?.force ?? false);
        patternHandles.delete(id);
        removeOpenedPattern(id);

        if (currentPatternId.value === id) {
          currentPatternId.value = openedPatterns.value[0]?.id;
        }
      } catch (err) {
        if (err instanceof UnsavedChangesError) {
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
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function exportPatternAsOxs(id: string) {
      const pattern = openedPatterns.value.find((p) => p.id === id);
      const suggestedName = `${pattern?.title ?? "pattern"}.oxs`;
      const handle = await filePicker.save({
        suggestedName,
        types: filePicker.filters.oxs,
      });
      if (!handle) return;

      try {
        loading.value = true;
        const file = await handle.getFile();
        const bytes = editor.encodePattern(id, file.name);
        const writable = await handle.createWritable();
        await writable.write(new Uint8Array(bytes));
        await writable.close();
      } finally {
        loading.value = false;
      }
    }

    async function exportPatternAsPdf(id: string, filePath: string, options: PdfExportOptions) {
      try {
        loading.value = true;
        await FilesApi.exportPattern(id, filePath, options);
        toast.add({
          color: "success",
          title: fluent.$t("pattern-export-success"),
          duration: 3000,
        });
      } catch {
        toast.add({
          color: "error",
          title: fluent.$t("pattern-export-failure"),
          duration: 3000,
        });
      } finally {
        loading.value = false;
      }
    }

    // Listen to change/checkpoint events to correctly identify dirty state.
    events.on("app:pattern-changed", (id) => {
      const pattern = openedPatterns.value.find((p) => p.id === id);
      if (pattern) pattern.dirty = true;
    });
    events.on("app:pattern-checkpoint", (id) => {
      const pattern = openedPatterns.value.find((p) => p.id === id);
      if (pattern) pattern.dirty = false;
    });

    return {
      currentPatternId,
      openedPatterns,
      recentPatterns,
      loading,
      switchPattern,
      updateOpenedPattern,
      loadPattern,
      openPattern,
      createPattern,
      savePattern,
      closePattern,
      exportPatternAsOxs,
      exportPatternAsPdf,
    };
  },
  { tauri: { save: false, sync: false } },
);

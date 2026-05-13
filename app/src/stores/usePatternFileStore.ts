import { useConfirm, useToast } from "@embroiderly/ui";
import { readFile } from "@tauri-apps/plugin-fs";

import { defineStore } from "pinia";
import { ref } from "vue";

import { useEditor, useFilePicker, useI18n } from "~/composables/";
import { NoFileHandleError, UnsavedChangesError, UnsupportedPatternTypeError } from "~/lib/errors.ts";
import { Fabric, Pattern, PdfExportOptions } from "~/lib/pattern/";
import { LoggerService, MetricsService } from "~/services/";

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

    const { editor, events, files } = useEditor();

    const currentPatternId = ref<string>();

    const openedPatterns = ref<OpenPattern[]>([]);

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

    async function loadPattern(id: string) {
      try {
        loading.value = true;
        return Pattern.deserialize(await editor.loadPattern(id));
      } finally {
        loading.value = false;
      }
    }

    /** Adds a Borsh-serialized pattern directly to the editor. Returns the pattern ID. */
    async function addPattern(pattern: Uint8Array): Promise<string> {
      try {
        loading.value = true;

        const result = await editor.addPattern(pattern);
        addOpenedPattern(result.id, result.title);

        return result.id;
      } finally {
        loading.value = false;
      }
    }

    async function openPattern(): Promise<string>;
    async function openPattern(options: { file: File }): Promise<string>;
    async function openPattern(options: { filePath: string }): Promise<string>;
    async function openPattern(options: { template: string }): Promise<string>;
    async function openPattern(options: { demo: string }): Promise<string>;
    async function openPattern(
      options?: { file: File } | { filePath: string } | { template: string } | { demo: string },
    ) {
      try {
        loading.value = true;

        let fileName: string;
        let result: { id: string; title: string; snapshot: Uint8Array };

        if (!options) {
          const fileHandle = await filePicker.open({
            types: filePicker.filters.pattern,
            id: filePicker.ids.pattern,
          });
          if (!fileHandle) return;

          fileName = fileHandle.name;
          result = await editor.openPattern(fileHandle);
        } else if ("file" in options) {
          const data = new Uint8Array(await options.file.arrayBuffer());

          fileName = options.file.name;
          result = await editor.openPatternFromData(data, fileName);
        } else if ("filePath" in options) {
          if (!__TAURI__) return;

          const data = await readFile(options.filePath);

          fileName = options.filePath.replaceAll("\\", "/").split("/").pop() ?? options.filePath;
          result = await editor.openPatternFromData(data, fileName);
        } else if ("template" in options) {
          const data = await files.loadPatternTemplate(options.template);

          fileName = options.template;
          result = await editor.openPatternFromData(new Uint8Array(data), fileName);
        } else {
          const response = await fetch(`/demo/${options.demo}`);
          const data = new Uint8Array(await response.arrayBuffer());

          fileName = options.demo;
          result = await editor.openPatternFromData(data, fileName);
        }

        addOpenedPattern(result.id, result.title || fileName);
        MetricsService.capturePatternOpened(Pattern.deserialize(result.snapshot), fileName.split(".").pop());

        return result.id;
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

    async function createPattern(fabric = new Fabric()) {
      try {
        loading.value = true;

        const result = await editor.createPattern(Fabric.serialize(fabric));

        addOpenedPattern(result.id, result.title);
        MetricsService.capturePatternCreated(fabric);

        return result.id;
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
      let handle: FileSystemFileHandle | null = null;
      if (as) {
        handle = await pickSaveHandle(id);
        if (!handle) return false;
      }

      try {
        loading.value = true;
        await editor.savePattern(id, handle);
        MetricsService.capturePatternSaved(handle?.name.split(".").pop());
        return true;
      } catch (err) {
        if (err instanceof NoFileHandleError) {
          loading.value = false;

          const picked = await pickSaveHandle(id);
          if (!picked) return false;

          loading.value = true;

          try {
            await editor.savePattern(id, picked);
            MetricsService.capturePatternSaved(picked.name.split(".").pop());
            return true;
          } catch {
            toast.add({ color: "error", title: fluent.$t("pattern-save-failure"), duration: 3000 });
            return false;
          }
        }

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

    function pickSaveHandle(id: string) {
      const pattern = openedPatterns.value.find((p) => p.id === id);
      const suggestedName = `${pattern?.title ?? "pattern"}.embproj`;
      return filePicker.save({
        suggestedName,
        types: filePicker.filters.embproj,
        id: filePicker.ids.pattern,
      });
    }

    async function closePattern(id: string, options?: { force?: boolean }) {
      try {
        loading.value = true;

        await editor.closePattern(id, options?.force ?? false);

        removeOpenedPattern(id);
        MetricsService.capturePatternClosed();

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
        id: filePicker.ids.pattern,
      });
      if (!handle) return;

      try {
        loading.value = true;
        await editor.exportPattern(id, handle);
      } finally {
        loading.value = false;
      }
    }

    async function exportPatternAsPdf(id: string, variant: "monochrome" | "color") {
      const patternData = await editor.loadPattern(id);
      const pattern = Pattern.deserialize(patternData);

      const handle = await filePicker.save({
        suggestedName: `${pattern.info.title ?? "pattern"}.${variant}.pdf`,
        types: filePicker.filters.pdf,
        id: filePicker.ids.pdf,
      });
      if (!handle) return;

      try {
        loading.value = true;

        const { exportPatternAsPdf } = await import("@embroiderly/pdf-export");
        await exportPatternAsPdf({
          handle,
          pattern: patternData,
          options: PdfExportOptions.schema.serialize(pattern.pdfExportOptions),
          fonts: await Promise.all(pattern.palette.usedSymbolFonts.map((name) => files.loadFontContent(name))),
          variant,
        });

        MetricsService.capturePatternExportedAsPdf(pattern.pdfExportOptions);
        toast.add({ color: "success", title: fluent.$t("pattern-export-success"), duration: 3000 });
      } catch (err) {
        LoggerService.error(`Failed to export pattern as PDF: ${err}`);
        toast.add({ color: "error", title: fluent.$t("pattern-export-failure"), duration: 3000 });
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
      loading,
      switchPattern,
      updateOpenedPattern,
      loadPattern,
      addPattern,
      openPattern,
      createPattern,
      savePattern,
      closePattern,
      exportPatternAsOxs,
      exportPatternAsPdf,
    };
  },
  {
    persist: { pick: ["currentPatternId", "openedPatterns"] },
  },
);

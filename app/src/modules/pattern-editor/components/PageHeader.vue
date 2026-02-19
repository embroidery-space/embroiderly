<script setup lang="ts">
import { resolveResource } from "@tauri-apps/api/path";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { openPath, openUrl } from "@tauri-apps/plugin-opener";

import type { DropdownMenuItem } from "@nuxt/ui";
import { computed } from "vue";
import { useRouter } from "vue-router";

import { useEditorModals } from "#pattern-editor/composables/";
import { Fabric } from "#pattern-editor/lib/pattern/";
import { usePatternFileStore, usePatternStore } from "#pattern-editor/stores/";
import { useShortcuts, extractShortcuts } from "#plugins/shortcuts/";
import { SystemApi } from "#shared/api";
import { WindowTitlebar } from "#shared/components/";
import type { WindowMenuItem } from "#shared/components/";
import { useConfirm, useFilePicker, useI18n } from "#shared/composables/";
import { ANY_IMAGE_FILTER } from "#shared/constants";
import { useSettingsStore } from "#shared/stores/";

import { FilesApi } from "../api/";

import { ToolButton } from "./toolbar/";

const router = useRouter();

const confirm = useConfirm();
const filePicker = useFilePicker();
const { fluent } = useI18n();

const modals = useEditorModals();

const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
const settingsStore = useSettingsStore();

const appWindow = getCurrentWebviewWindow();

const menuItems = computed<WindowMenuItem[]>(() => [
  {
    label: fluent.$t("app-menu-file"),
    children: [
      [
        {
          label: fluent.$t("app-menu-file-open"),
          kbds: ["ctrl", "o"],
          async onSelect() {
            const patternId = await patternFileStore.openPattern();
            router.push({ name: "pattern-editor", params: { patternId } });
          },
        },
        {
          label: fluent.$t("app-menu-file-create"),
          kbds: ["ctrl", "n"],
          onSelect() {
            modals.patternCreationModal.open({
              fabric: Fabric.default(),
              async onSave(fabric) {
                const patternId = await patternFileStore.createPattern(fabric);
                router.push({ name: "pattern-editor", params: { patternId } });
              },
            });
          },
        },
      ],
      [
        {
          label: fluent.$t("app-menu-file-save"),
          kbds: ["ctrl", "s"],
          disabled: !patternStore.pattern,
          onSelect: () => patternFileStore.savePattern(patternStore.pattern!.id),
        },
        {
          label: fluent.$t("app-menu-file-save-as"),
          kbds: ["ctrl", "shift", "s"],
          disabled: !patternStore.pattern,
          onSelect: () => patternFileStore.savePattern(patternStore.pattern!.id, true),
        },
      ],
      [
        {
          label: fluent.$t("app-menu-file-import"),
          children: [
            [
              {
                label: fluent.$t("app-menu-file-import-image"),
                async onSelect() {
                  const imagePath = await filePicker.open({ filters: ANY_IMAGE_FILTER });
                  if (imagePath === null) return;

                  const patternId = await modals.imageImportModal.open({
                    imagePath,
                    imageDimensions: await FilesApi.getImageDimensions(imagePath),
                  }).result;
                  if (patternId) router.push({ name: "pattern-editor", params: { patternId } });
                },
              },
            ],
          ],
        },
        {
          label: fluent.$t("app-menu-file-export"),
          disabled: !patternStore.pattern,
          children: [
            [
              {
                label: "OXS",
                async onSelect() {
                  const patternId = patternStore.pattern!.id;
                  const filePath =
                    (await FilesApi.getPatternFilePath(patternId)) ??
                    (await FilesApi.getPatternDefaultFilePath(patternId));
                  await patternFileStore.exportPatternAsOxs(patternId, filePath.replace(/\.[^.]+$/, ".oxs"));
                },
              },
              {
                label: "PDF",
                async onSelect() {
                  const { id, pdfExportOptions } = patternStore.pattern!;
                  const filePath =
                    (await FilesApi.getPatternFilePath(id)) ?? (await FilesApi.getPatternDefaultFilePath(id));
                  modals.pdfExportModal.open({
                    filePath: filePath.replace(/\.[^.]+$/, ".pdf"),
                    options: pdfExportOptions,
                    onOptionsUpdate: patternStore.updatePdfExportOptions,
                    onDocumentExport: (filePath, options) => patternFileStore.exportPatternAsPdf(id, filePath, options),
                  });
                },
              },
            ],
          ],
        },
      ],
      [
        {
          label: fluent.$t("app-menu-file-close"),
          kbds: ["ctrl", "w"],
          disabled: !patternStore.pattern,
          async onSelect() {
            await patternFileStore.closePattern(patternStore.pattern!.id);

            const openedPatternsNumber = patternFileStore.openedPatterns.length;
            const patternId = patternFileStore.openedPatterns[openedPatternsNumber - 1]?.id;

            router.push({ name: "pattern-editor", params: { patternId } });
          },
        },
      ],
      [
        {
          label: fluent.$t("app-menu-file-quit"),
          kbds: ["ctrl", "q"],
          onSelect: () => appWindow.close(),
        },
      ],
    ],
  },
  {
    label: fluent.$t("app-menu-pattern"),
    visible: patternStore.pattern !== undefined,
    children: [
      [
        {
          label: fluent.$t("pattern-info"),
          onSelect() {
            modals.patternInfoModal.open({
              patternInfo: patternStore.pattern!.info,
              onSave: patternStore.updatePatternInfo,
            });
          },
        },
        {
          label: fluent.$t("fabric-properties"),
          onSelect() {
            modals.fabricModal.open({
              fabric: patternStore.pattern!.fabric,
              onSave: patternStore.updateFabric,
            });
          },
        },
        {
          label: fluent.$t("grid-properties"),
          onSelect() {
            modals.gridModal.open({
              grid: patternStore.pattern!.grid,
              onSave: patternStore.updateGrid,
            });
          },
        },
      ],
      [
        {
          label: fluent.$t("publish-settings"),
          onSelect() {
            modals.pdfExportOptionsModal.open({
              options: patternStore.pattern!.pdfExportOptions,
              onSave: patternStore.updatePdfExportOptions,
            });
          },
        },
      ],
    ],
  },
  {
    label: fluent.$t("app-menu-tools"),
    children: [
      [{ label: fluent.$t("settings"), kbds: ["ctrl", ","], onSelect: () => settingsStore.openSettingsModal() }],
      [
        {
          label: fluent.$t("updater-check-for-updates"),
          onSelect: () => settingsStore.checkForUpdates(),
        },
      ],
    ],
  },
  {
    label: fluent.$t("app-menu-help"),
    children: [
      [{ label: fluent.$t("app-menu-help-about"), onSelect: showSystemInfo }],
      [
        {
          label: fluent.$t("app-menu-help-guide"),
          async onSelect() {
            const documentPath = await resolveResource(`help/embroiderly.${settingsStore.ui.language}.pdf`);
            await openPath(documentPath);
          },
        },
        {
          label: fluent.$t("app-menu-help-license"),
          async onSelect() {
            await openUrl("https://github.com/embroidery-space/embroiderly/blob/main/LICENSE");
          },
        },
        {
          label: fluent.$t("app-menu-help-website"),
          async onSelect() {
            await openUrl(`https://embroiderly.niusia.me`);
          },
        },
      ],
    ],
  },
]);
useShortcuts(extractShortcuts(menuItems));

const manageOptions = computed<DropdownMenuItem[][]>(() => [
  [{ label: fluent.$t("settings"), kbds: ["ctrl", ","], onSelect: () => settingsStore.openSettingsModal() }],
  [
    {
      label: fluent.$t("updater-check-for-updates"),
      onSelect: () => settingsStore.checkForUpdates(),
    },
  ],
]);

async function showSystemInfo() {
  // @ts-expect-error Ignore the lack of index signature of the system info object.
  const systemInfo = fluent.$ta("system-info", await SystemApi.getSystemInfo());
  const { title, description } = systemInfo as { title: string; description: string };

  const accepted = await confirm.open({
    title,
    description,
    yesButton: { label: fluent.$t("modal-copy") },
    noButton: { label: fluent.$t("modal-close") },
  }).result;
  if (accepted) await writeText(description);
}
</script>

<template>
  <WindowTitlebar :items="menuItems">
    <template #end>
      <div class="flex items-center gap-2">
        <template v-if="patternStore.pattern">
          <ToolButton
            data-testid="undo-button"
            tooltip-side="bottom"
            :tooltip-arrow="false"
            icon="i-lucide:undo"
            :label="$t('history-undo')"
            :kbds="['ctrl', 'z']"
            :on-click="patternStore.undo"
          />
          <ToolButton
            data-testid="redo-button"
            tooltip-side="bottom"
            :tooltip-arrow="false"
            icon="i-lucide:redo"
            :label="$t('history-redo')"
            :kbds="['ctrl', 'y']"
            :on-click="patternStore.redo"
          />
          <USeparator orientation="vertical" />
        </template>

        <UDropdownMenu :items="manageOptions" :modal="false">
          <UTooltip :text="$t('app-menu-manage')">
            <UButton :loading="settingsStore.loadingUpdate" variant="ghost" color="neutral" icon="i-lucide:settings" />
          </UTooltip>
        </UDropdownMenu>
      </div>
    </template>
  </WindowTitlebar>
</template>

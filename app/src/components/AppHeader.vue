<script setup lang="ts">
import { useShortcuts, extractShortcuts } from "@embroiderly/shortcuts";
import { ButtonIcon, DropdownMenu, Menubar, Separator, useConfirm } from "@embroiderly/ui";
import type { DropdownMenuItem, MenubarItem, MenubarMenu } from "@embroiderly/ui";
import { resolveResource } from "@tauri-apps/api/path";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { openPath, openUrl } from "@tauri-apps/plugin-opener";

import { computed } from "vue";

import { FilesApi, SystemApi } from "~/api/";
import { useEditorModals, useFilePicker, useI18n } from "~/composables/";
import { ANY_IMAGE_FILTER } from "~/constants/";
import { Fabric } from "~/lib/pattern/";
import { usePatternFileStore, usePatternStore } from "~/stores/";
import { useSettingsStore } from "~/stores/";

import WindowControls from "./WindowControls.vue";

const confirm = useConfirm();
const filePicker = useFilePicker();
const { fluent } = useI18n();

const modals = useEditorModals();

const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
const settingsStore = useSettingsStore();

const appWindow = getCurrentWebviewWindow();

const menus = computed<MenubarMenu[]>(() => [
  {
    label: fluent.$t("app-menu-file"),
    items: [
      [
        {
          label: fluent.$t("app-menu-file-open"),
          shortcut: "Ctrl+O",
          async onSelect() {
            const patternId = await patternFileStore.openPattern();
            if (patternId) patternFileStore.switchPattern(patternId);
          },
        },
        {
          label: fluent.$t("app-menu-file-create"),
          shortcut: "Ctrl+N",
          onSelect() {
            modals.patternCreationModal.open({
              fabric: Fabric.default(),
              async onSave(fabric) {
                patternFileStore.switchPattern(await patternFileStore.createPattern(fabric));
              },
            });
          },
        },
      ],
      [
        {
          label: fluent.$t("app-menu-file-save"),
          shortcut: "Ctrl+S",
          disabled: !patternStore.pattern,
          onSelect: () => patternFileStore.savePattern(patternStore.pattern!.id),
        },
        {
          label: fluent.$t("app-menu-file-save-as"),
          shortcut: "Ctrl+Shift+S",
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
                  if (patternId) patternFileStore.switchPattern(patternId);
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
          shortcut: "Ctrl+W",
          disabled: !patternStore.pattern,
          onSelect: () => patternFileStore.closePattern(patternStore.pattern!.id),
        },
      ],
      [
        {
          label: fluent.$t("app-menu-file-quit"),
          shortcut: "Ctrl+Q",
          onSelect: () => appWindow.close(),
        },
      ],
    ],
  },
  {
    label: fluent.$t("app-menu-pattern"),
    hidden: patternStore.pattern === undefined,
    items: [
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
    items: [
      [{ label: fluent.$t("settings"), shortcut: "Ctrl+,", onSelect: () => settingsStore.openSettingsModal() }],
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
    items: [
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
useShortcuts(extractShortcuts(() => menus.value.flatMap((menu) => menu.items as MenubarItem[][])));

const manageOptions = computed<DropdownMenuItem[][]>(() => [
  [{ label: fluent.$t("settings"), shortcut: "Ctrl+,", onSelect: () => settingsStore.openSettingsModal() }],
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
  <header class="flex border-b border-default">
    <div data-tauri-drag-region class="flex h-full grow items-center gap-x-2 p-1">
      <Menubar :menus="menus" />

      <div class="ml-auto flex h-full items-center gap-2">
        <template v-if="patternStore.pattern">
          <ButtonIcon
            data-testid="undo-button"
            icon="lucide:undo"
            color="neutral"
            variant="ghost"
            :tooltip="$t('history-undo')"
            shortcut="Ctrl+Z"
            @click="() => patternStore.undo()"
          />
          <ButtonIcon
            data-testid="redo-button"
            icon="lucide:redo"
            color="neutral"
            variant="ghost"
            :tooltip="$t('history-redo')"
            shortcut="Ctrl+Y"
            @click="() => patternStore.redo()"
          />
          <Separator orientation="vertical" />
        </template>

        <DropdownMenu :items="manageOptions" :modal="false">
          <ButtonIcon
            :loading="settingsStore.loadingUpdate"
            variant="ghost"
            color="neutral"
            icon="lucide:settings"
            :tooltip="$t('app-menu-manage')"
          />
        </DropdownMenu>
      </div>
    </div>

    <WindowControls />
  </header>
</template>

<script setup lang="ts">
import { ButtonIcon, DropdownMenu, Menubar, Separator, useConfirm } from "@embroiderly/ui";
import type { DropdownMenuItem, MenubarItem, MenubarMenu } from "@embroiderly/ui";
import { resolveResource } from "@tauri-apps/api/path";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { openPath } from "@tauri-apps/plugin-opener";

import { computed } from "vue";

import { IconRedo, IconSettings, IconUndo } from "~/assets/icons/";
import { useEditorModals, useFilePicker, useI18n, useShortcuts, extractShortcuts } from "~/composables/";
import { Fabric } from "~/lib/pattern/";
import { usePatternFileStore, usePatternStore } from "~/stores/";
import { useSettingsStore } from "~/stores/";
import { getSystemInfo } from "~/utils/system.ts";

import WindowControls from "./WindowControls.vue";

const confirm = useConfirm();
const { fluent } = useI18n();

const modals = useEditorModals();
const filePicker = useFilePicker();

const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
const settingsStore = useSettingsStore();

// This variable is needed for the conditional component rendering.
// We must declare it in the setup function, since template doesn't have access to global variables.
const isTauri = __TAURI__;

const menus = computed<MenubarMenu[]>(() => {
  const fileMenu: MenubarMenu = {
    label: fluent.$t("app-menu-file"),
    items: [
      [
        {
          label: fluent.$t("app-menu-file-open"),
          shortcut: "Control+O",
          async onSelect() {
            const patternId = await patternFileStore.openPattern();
            if (patternId) patternFileStore.switchPattern(patternId);
          },
        },
        {
          label: fluent.$t("app-menu-file-create"),
          shortcut: "Control+N",
          onSelect() {
            modals.patternCreationModal.open({
              fabric: new Fabric(),
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
          shortcut: "Control+S",
          disabled: patternStore.pattern.isNil,
          onSelect: () => patternFileStore.savePattern(patternStore.pattern.id),
        },
        {
          label: fluent.$t("app-menu-file-save-as"),
          shortcut: "Control+Shift+S",
          disabled: patternStore.pattern.isNil,
          onSelect: () => patternFileStore.savePattern(patternStore.pattern.id, true),
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
                  const handle = await filePicker.open({
                    types: filePicker.filters.image,
                    id: filePicker.ids.image,
                  });
                  if (!handle) return;

                  const patternBytes = await modals.imageImportModal.open({ imageFile: await handle.getFile() }).result;
                  if (patternBytes) {
                    const patternId = await patternFileStore.addPattern(patternBytes);
                    patternFileStore.switchPattern(patternId);
                  }
                },
              },
            ],
          ],
        },
        {
          label: fluent.$t("app-menu-file-export"),
          disabled: patternStore.pattern.isNil,
          children: [
            [
              {
                label: "OXS",
                async onSelect() {
                  await patternFileStore.exportPatternAsOxs(patternStore.pattern.id);
                },
              },
              {
                label: "PDF",
                onSelect() {
                  modals.pdfExportModal.open({
                    options: patternStore.pattern.pdfExportOptions,
                    onOptionsUpdate: patternStore.updatePdfExportOptions,
                    onDocumentExport: (variant) =>
                      patternFileStore.exportPatternAsPdf(patternStore.pattern.id, variant),
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
          shortcut: "Control+W",
          disabled: patternStore.pattern.isNil,
          onSelect: () => patternFileStore.closePattern(patternStore.pattern.id),
        },
      ],
    ],
  };
  if (__TAURI__) {
    fileMenu.items.push([
      {
        label: fluent.$t("app-menu-file-quit"),
        shortcut: "Control+Q",
        onSelect: () => getCurrentWebviewWindow().close(),
      },
    ]);
  }

  const patternMenu: MenubarMenu = {
    label: fluent.$t("app-menu-pattern"),
    hidden: patternStore.pattern.isNil,
    items: [
      [
        {
          label: fluent.$t("pattern-info"),
          onSelect() {
            modals.patternInfoModal.open({
              patternInfo: patternStore.pattern.info,
              onSave: patternStore.updatePatternInfo,
            });
          },
        },
        {
          label: fluent.$t("fabric-properties"),
          onSelect() {
            modals.fabricModal.open({
              fabric: patternStore.pattern.fabric,
              onSave: patternStore.updateFabric,
            });
          },
        },
        {
          label: fluent.$t("grid-properties"),
          onSelect() {
            modals.gridModal.open({
              grid: patternStore.pattern.grid,
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
              options: patternStore.pattern.pdfExportOptions,
              onSave: patternStore.updatePdfExportOptions,
            });
          },
        },
      ],
    ],
  };

  const toolsMenu: MenubarMenu = {
    label: fluent.$t("app-menu-tools"),
    items: [
      [{ label: fluent.$t("settings"), shortcut: "Control+,", onSelect: () => settingsStore.openSettingsModal() }],
      [{ label: fluent.$t("updater-check-for-updates"), onSelect: () => settingsStore.checkForUpdates() }],
    ],
  };

  const helpMenu: MenubarMenu = {
    label: fluent.$t("app-menu-help"),
    items: [
      [{ label: fluent.$t("app-menu-help-about"), onSelect: showSystemInfo }],
      [
        __TAURI__
          ? {
              label: fluent.$t("app-menu-help-guide"),
              async onSelect() {
                const documentPath = await resolveResource(`help/embroiderly.${settingsStore.ui.language}.pdf`);
                await openPath(documentPath);
              },
            }
          : {
              type: "link",
              label: fluent.$t("app-menu-help-guide"),
              href: "https://docs.embroiderly.niusia.me",
              target: "_blank",
            },
        {
          type: "link",
          label: fluent.$t("app-menu-help-license"),
          href: "https://github.com/embroidery-space/embroiderly/blob/main/LICENSE",
          target: "_blank",
        },
      ],
    ],
  };

  return [fileMenu, patternMenu, toolsMenu, helpMenu];
});
useShortcuts(extractShortcuts(() => menus.value.flatMap((menu) => menu.items as MenubarItem[][])));

const manageOptions = computed<DropdownMenuItem[][]>(() => [
  [{ label: fluent.$t("settings"), shortcut: "Control+,", onSelect: () => settingsStore.openSettingsModal() }],
  [{ label: fluent.$t("updater-check-for-updates"), onSelect: () => settingsStore.checkForUpdates() }],
]);

async function showSystemInfo() {
  // @ts-expect-error Ignore the lack of index signature of the system info object.
  const systemInfo = fluent.$ta("system-info", getSystemInfo());
  const { title, description } = systemInfo as { title: string; description: string };

  const accepted = await confirm.open({
    title,
    description,
    yesButton: { label: fluent.$t("modal-copy") },
    noButton: { label: fluent.$t("modal-close") },
  }).result;
  if (accepted) await navigator.clipboard.writeText(description);
}
</script>

<template>
  <header class="flex border-b border-default">
    <div data-tauri-drag-region class="flex h-full grow items-center gap-x-2 p-1">
      <Menubar :menus="menus" />

      <div class="ml-auto flex h-full items-center gap-2">
        <template v-if="!patternStore.pattern.isNil">
          <ButtonIcon
            data-testid="undo-button"
            :icon="IconUndo"
            color="neutral"
            variant="ghost"
            :tooltip="$t('history-undo')"
            shortcut="Control+Z"
            @click="() => patternStore.undo()"
          />
          <ButtonIcon
            data-testid="redo-button"
            :icon="IconRedo"
            color="neutral"
            variant="ghost"
            :tooltip="$t('history-redo')"
            shortcut="Control+Y"
            @click="() => patternStore.redo()"
          />
          <Separator orientation="vertical" />
        </template>

        <DropdownMenu :items="manageOptions" :modal="false">
          <ButtonIcon
            :loading="settingsStore.loadingUpdate"
            variant="ghost"
            color="neutral"
            :icon="IconSettings"
            :tooltip="$t('app-menu-manage')"
          />
        </DropdownMenu>
      </div>
    </div>

    <WindowControls v-if="isTauri" />
  </header>
</template>

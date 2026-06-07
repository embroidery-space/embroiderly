<script setup lang="ts">
import { Button, ButtonIcon, DropdownMenu, Menubar, Separator, Tabs, useConfirm, useShortcuts } from "@embroiderly/ui";
import type { DropdownMenuItem, MenubarMenu } from "@embroiderly/ui";
import { resolveResource } from "@tauri-apps/api/path";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { openPath } from "@tauri-apps/plugin-opener";

import { useMediaQuery } from "@vueuse/core";
import { computed, ref } from "vue";

import {
  IconClose,
  IconDot,
  IconFullscreen,
  IconFullscreenExit,
  IconMenu,
  IconRedo,
  IconSettings,
  IconUndo,
} from "~/assets/icons/";
import { useEditorModals, useFilePicker, useI18n } from "~/composables/";
import { useTour } from "~/composables/core/";
import { Fabric } from "~/lib/pattern/";
import { usePatternFileStore, usePatternStore } from "~/stores/";
import { useSettingsStore } from "~/stores/";
import { getSystemInfo } from "~/utils/system.ts";

import WindowControls from "./WindowControls.vue";

const confirm = useConfirm();
const tour = useTour();
const { fluent } = useI18n();

const modals = useEditorModals();
const filePicker = useFilePicker();

const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
const settingsStore = useSettingsStore();

// This variable is needed for the conditional component rendering.
// We must declare it in the setup function, since template doesn't have access to global variables.
const isTauri = __TAURI__;

const appMenu = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileItems: any[][] = [
    [
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
      {
        label: fluent.$t("app-menu-file-open"),
        shortcut: "Control+O",
        async onSelect() {
          const patternId = await patternFileStore.openPattern();
          if (patternId) patternFileStore.switchPattern(patternId);
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
                  fabricWidth: patternStore.pattern.fabric.width,
                  fabricHeight: patternStore.pattern.fabric.height,
                  onOptionsUpdate: patternStore.updatePdfExportOptions,
                  onDocumentExport: (variant) => patternFileStore.exportPatternAsPdf(patternStore.pattern.id, variant),
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
  ];

  if (settingsStore.other.showOpenDemoPatternOption) {
    fileItems[0]!.push({
      label: fluent.$t("app-menu-file-open-demo"),
      children: [
        [
          {
            label: fluent.$t("demo-pattern-piggies"),
            async onSelect() {
              const id = await patternFileStore.openPattern({ demo: "Piggies.oxs" });
              if (id) patternFileStore.switchPattern(id);
            },
          },
          {
            label: fluent.$t("demo-pattern-festive-capy"),
            async onSelect() {
              const id = await patternFileStore.openPattern({ demo: "Festive Capy.oxs" });
              if (id) patternFileStore.switchPattern(id);
            },
          },
          {
            label: fluent.$t("demo-pattern-pumpkin-cupcake"),
            async onSelect() {
              const id = await patternFileStore.openPattern({ demo: "Pumpkin Cupcake.oxs" });
              if (id) patternFileStore.switchPattern(id);
            },
          },
          {
            label: fluent.$t("demo-pattern-whisper-of-the-board"),
            async onSelect() {
              const id = await patternFileStore.openPattern({ demo: "The Whisper of the Board.xsd" });
              if (id) patternFileStore.switchPattern(id);
            },
          },
        ],
      ],
    });
  }

  if (__TAURI__) {
    fileItems.push([
      {
        label: fluent.$t("app-menu-file-quit"),
        shortcut: "Control+Q",
        onSelect: () => getCurrentWebviewWindow().close(),
      },
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patternItems: any[][] = [
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
            fabricWidth: patternStore.pattern.fabric.width,
            fabricHeight: patternStore.pattern.fabric.height,
            onSave: patternStore.updatePdfExportOptions,
          });
        },
      },
    ],
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const helpItems: any[][] = [
    [{ label: fluent.$t("app-menu-help-about"), onSelect: showSystemInfo }],
    [
      {
        label: fluent.$t("tour-start"),
        async onSelect() {
          if (patternStore.pattern.isNil) {
            patternFileStore.switchPattern(await patternFileStore.createPattern(new Fabric()));
          }
          void tour.restart();
        },
      },
    ],
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
  ];

  const desktopMenubarMenus: MenubarMenu[] = [
    { label: fluent.$t("app-menu-file"), items: fileItems },
    { label: fluent.$t("app-menu-pattern"), hidden: patternStore.pattern.isNil, items: patternItems },
    { label: fluent.$t("app-menu-help"), items: helpItems },
  ];

  const mobileDropdownMenuItems: DropdownMenuItem[][] = [
    [
      { label: fluent.$t("app-menu-file"), children: fileItems as DropdownMenuItem[][] },
      ...(patternStore.pattern.isNil
        ? []
        : [{ label: fluent.$t("app-menu-pattern"), children: patternItems as DropdownMenuItem[][] }]),
      { label: fluent.$t("app-menu-help"), children: helpItems as DropdownMenuItem[][] },
    ],
  ];

  return { desktopMenubarMenus, mobileDropdownMenuItems };
});

const manageOptions = computed<DropdownMenuItem[][]>(() => [
  [{ label: fluent.$t("settings"), shortcut: "Control+,", onSelect: () => settingsStore.openSettingsModal() }],
  [{ label: fluent.$t("updater-check-for-updates"), onSelect: () => settingsStore.checkForUpdates() }],
]);

// Matches Tailwind's `lg` breakpoint (1024px).
const isLargeScreen = useMediaQuery("(min-width: 64rem)");

const isFullscreen = ref(!!document.fullscreenElement);
document.addEventListener("fullscreenchange", () => {
  isFullscreen.value = !!document.fullscreenElement;
});

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
}

async function showSystemInfo() {
  // @ts-expect-error Ignore the lack of index signature of the system info object.
  const systemInfo = fluent.$ta("system-info", await getSystemInfo());
  const { title, description } = systemInfo as { title: string; description: string };

  const accepted = await confirm.open({
    title,
    description,
    yesButton: { label: fluent.$t("modal-copy") },
    noButton: { label: fluent.$t("modal-close") },
  }).result;
  if (accepted) await navigator.clipboard.writeText(description);
}

useShortcuts({
  "Control+Shift+Z": () => patternStore.undo({ single: true }),
  "Control+Shift+Y": () => patternStore.redo({ single: true }),
});
</script>

<template>
  <header class="grid grid-cols-[1fr_auto] border-b border-default">
    <div data-tauri-drag-region class="grid h-full grid-cols-[auto_1fr_auto]">
      <div class="p-1">
        <Menubar v-if="isLargeScreen" :menus="appMenu.desktopMenubarMenus" />
        <DropdownMenu v-else :items="appMenu.mobileDropdownMenuItems">
          <ButtonIcon :icon="IconMenu" variant="ghost" color="neutral" :tooltip="$t('app-menu-open')" />
        </DropdownMenu>
      </div>

      <Tabs
        :model-value="patternStore.pattern.id"
        :items="patternFileStore.openedPatterns.map(({ id, title, dirty }) => ({ label: title, value: id, dirty }))"
        :content="false"
        color="neutral"
        activation-mode="manual"
        :ui="{
          root: 'overflow-hidden pt-1',
          wrapper: 'h-full overflow-hidden rounded-t-lg',
          list: 'rounded-none bg-transparent p-0',
          indicator: 'inset-0 h-full rounded-b-none shadow-none',
          trigger: 'h-full min-w-20 rounded-b-none hover:data-[state=inactive]:bg-accented',
        }"
        @update:model-value="patternFileStore.switchPattern($event as string)"
      >
        <template #leading="{ item }">
          <IconDot aria-hidden="true" class="size-3 shrink-0" :class="{ invisible: !item.dirty }" />
        </template>

        <template #trailing="{ item }">
          <Button
            size="sm"
            variant="ghost"
            :icon="IconClose"
            class="p-0"
            :class="{
              'text-inverted': patternStore.pattern.id === item.value,
              'text-default': patternStore.pattern.id !== item.value,
            }"
            @click.stop="patternFileStore.closePattern(item.value as string)"
          />
        </template>
      </Tabs>

      <div class="flex h-full items-center gap-2 p-1">
        <template v-if="!patternStore.pattern.isNil">
          <ButtonIcon
            data-testid="undo-button"
            :icon="IconUndo"
            color="neutral"
            variant="ghost"
            shortcut="Control+Z"
            :tooltip="$t('history-undo')"
            @click="() => patternStore.undo()"
          />
          <ButtonIcon
            data-testid="redo-button"
            :icon="IconRedo"
            color="neutral"
            variant="ghost"
            shortcut="Control+Y"
            :tooltip="$t('history-redo')"
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

        <ButtonIcon
          v-if="!isTauri"
          variant="ghost"
          color="neutral"
          shortcut="F11"
          :icon="isFullscreen ? IconFullscreenExit : IconFullscreen"
          :tooltip="isFullscreen ? $t('app-fullscreen-exit') : $t('app-fullscreen-enter')"
          @click="toggleFullscreen"
        />
      </div>
    </div>

    <WindowControls v-if="isTauri" />
  </header>
</template>

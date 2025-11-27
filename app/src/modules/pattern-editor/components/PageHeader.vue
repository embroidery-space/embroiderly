<template>
  <WindowTitlebar :items="menuItems">
    <template #end>
      <div class="flex items-center gap-2">
        <template v-if="patternStore.pattern">
          <ToolButton
            :label="$t('history-undo')"
            icon="i-lucide:undo"
            :kbds="['ctrl', 'z']"
            :on-click="patternStore.undo"
          />
          <ToolButton
            :label="$t('history-redo')"
            icon="i-lucide:redo"
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

<script setup lang="ts">
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";
  import { openUrl } from "@tauri-apps/plugin-opener";

  import type { DropdownMenuItem } from "@nuxt/ui";
  import { computed } from "vue";
  import { useRouter } from "vue-router";

  import { FilesApi, UtilityApi } from "~/api/";
  import { Fabric } from "~/core/pattern/";
  import { useEditorModals } from "~/modules/pattern-editor/composables/";
  import { usePatternFileStore, usePatternStore } from "~/modules/pattern-editor/stores/";
  import { WindowTitlebar } from "~/shared/components/";
  import type { WindowMenuItem } from "~/shared/components/";
  import { useConfirm, useI18n } from "~/shared/composables/";
  import { useSettingsStore } from "~/shared/stores/";

  const router = useRouter();

  const confirm = useConfirm();
  const modals = useEditorModals();

  const { fluent } = useI18n();

  const patternStore = usePatternStore();
  const patternFileStore = usePatternFileStore();
  const settingsStore = useSettingsStore();

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
            async onSelect() {
              const fabric = await modals.openFabricModal(Fabric.default());
              if (!fabric) return;

              const patternId = await patternFileStore.createPattern(fabric);
              router.push({ name: "pattern-editor", params: { patternId } });
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
                    const patternId = await modals.openImageImportModal();
                    router.push({ name: "pattern-editor", params: { patternId } });
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
                    const filePath = (await FilesApi.getPatternFilePath(patternId)).replace(/\.[^.]+$/, ".oxs");
                    await patternFileStore.exportPatternAsOxs(patternId, filePath);
                  },
                },
                {
                  label: "PDF",
                  async onSelect() {
                    const { id, pdfExportOptions } = patternStore.pattern!;
                    await modals.openPdfExportModal(id, pdfExportOptions);
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

              router.push({ name: "pattern-editor", params: { patternId: patternId } });
            },
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
            async onSelect() {
              const patternInfo = await modals.openPatternInfoModal(patternStore.pattern!.info);
              if (patternInfo) await patternStore.updatePatternInfo(patternInfo);
            },
          },
          {
            label: fluent.$t("fabric-properties"),
            async onSelect() {
              const fabric = await modals.openFabricModal(patternStore.pattern!.fabric);
              if (fabric) await patternStore.updateFabric(fabric);
            },
          },
          {
            label: fluent.$t("grid-properties"),
            async onSelect() {
              const grid = await modals.openGridModal(patternStore.pattern!.grid);
              if (grid) await patternStore.updateGrid(grid);
            },
          },
        ],
        [
          {
            label: fluent.$t("publish-settings"),
            async onSelect() {
              const options = await modals.openPdfExportOptionsModal(patternStore.pattern!.pdfExportOptions);
              if (options) await patternStore.updatePdfExportOptions(options);
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
        [
          { label: fluent.$t("app-menu-help-learn-more"), onSelect: () => openUrl("https://embroiderly.niusia.me") },
          {
            label: fluent.$t("app-menu-help-license"),
            onSelect: () => openUrl("https://github.com/embroidery-space/embroiderly/blob/main/LICENSE"),
          },
        ],
        [{ label: fluent.$t("app-menu-help-about"), onSelect: () => showSystemInfo() }],
      ],
    },
  ]);

  const manageOptions = computed<DropdownMenuItem[][]>(() => [
    [{ label: fluent.$t("settings"), kbds: ["ctrl", ","], onSelect: () => settingsStore.openSettingsModal() }],
    [
      {
        label: fluent.$t("updater-check-for-updates"),
        onSelect: () => settingsStore.checkForUpdates(),
      },
    ],
  ]);

  defineShortcuts(extractShortcuts(menuItems.value));

  async function showSystemInfo() {
    // @ts-expect-error Ignore the lack of index signature of the system info object.
    const systemInfo = fluent.$ta("system-info", await UtilityApi.getSystemInfo());
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

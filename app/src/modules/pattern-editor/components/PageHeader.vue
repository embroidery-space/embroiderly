<template>
  <WindowTitlebar :items="menuItems">
    <template #end>
      <div class="flex items-center gap-2">
        <template v-if="patternsStore.pattern !== undefined">
          <ToolButton
            :label="$t('history-undo')"
            icon="i-lucide:undo"
            :kbds="['ctrl', 'z']"
            :on-click="patternsStore.undo"
          />
          <ToolButton
            :label="$t('history-redo')"
            icon="i-lucide:redo"
            :kbds="['ctrl', 'y']"
            :on-click="patternsStore.redo"
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

  import { UtilityApi } from "~/api/";
  import { WindowTitlebar } from "~/shared/components/";
  import type { WindowMenuItem } from "~/shared/components/";
  import { useConfirm, useI18n } from "~/shared/composables/";

  const confirm = useConfirm();
  const { fluent } = useI18n();

  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const menuItems = computed<WindowMenuItem[]>(() => [
    {
      label: fluent.$t("app-menu-file"),
      children: [
        [
          { label: fluent.$t("app-menu-file-open"), kbds: ["ctrl", "o"], onSelect: () => patternsStore.openPattern() },
          {
            label: fluent.$t("app-menu-file-create"),
            kbds: ["ctrl", "n"],
            onSelect: () => patternsStore.openFabricModal(),
          },
        ],
        [
          {
            label: fluent.$t("app-menu-file-save"),
            kbds: ["ctrl", "s"],
            disabled: !patternsStore.pattern,
            onSelect: () => patternsStore.savePattern(),
          },
          {
            label: fluent.$t("app-menu-file-save-as"),
            kbds: ["ctrl", "shift", "s"],
            disabled: !patternsStore.pattern,
            onSelect: () => patternsStore.savePattern(true),
          },
        ],
        [
          {
            label: fluent.$t("app-menu-file-import"),
            children: [
              [
                {
                  label: fluent.$t("app-menu-file-import-image"),
                  onSelect: () => patternsStore.openImageImportModal(),
                },
              ],
            ],
          },
          {
            label: fluent.$t("app-menu-file-export"),
            disabled: !patternsStore.pattern,
            children: [
              [
                { label: "OXS", onSelect: () => patternsStore.openExportModal("oxs") },
                { label: "PDF", onSelect: () => patternsStore.openExportModal("pdf") },
              ],
            ],
          },
        ],
        [
          {
            label: fluent.$t("app-menu-file-close"),
            kbds: ["ctrl", "w"],
            disabled: !patternsStore.pattern,
            onSelect: () => patternsStore.closePattern(),
          },
        ],
      ],
    },
    {
      label: fluent.$t("app-menu-pattern"),
      visible: patternsStore.pattern !== undefined,
      children: [
        [
          { label: fluent.$t("pattern-info"), onSelect: () => patternsStore.openPatternInfoModal() },
          {
            label: fluent.$t("fabric-properties"),
            onSelect: () => patternsStore.openFabricModal(patternsStore.pattern?.fabric),
          },
          { label: fluent.$t("grid-properties"), onSelect: () => patternsStore.openGridModal() },
        ],
        [{ label: fluent.$t("publish-settings"), onSelect: () => patternsStore.openPublishModal() }],
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

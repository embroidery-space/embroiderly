<template>
  <div class="flex border-b border-default">
    <div data-tauri-drag-region class="flex grow items-center gap-x-2 px-2">
      <UDropdownMenu :items="fileOptions" :modal="false">
        <template #default="{ open }">
          <UButton
            :variant="open ? 'soft' : 'ghost'"
            color="neutral"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('app-menu-file')"
            :ui="{ base: 'px-2 py-1 text-default font-normal' }"
          />
        </template>
      </UDropdownMenu>
      <UDropdownMenu v-if="patternsStore.pattern !== undefined" :items="patternOptions" :modal="false">
        <template #default="{ open }">
          <UButton
            :variant="open ? 'soft' : 'ghost'"
            color="neutral"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('app-menu-pattern')"
            :ui="{ base: 'px-2 py-1 text-default font-normal' }"
          />
        </template>
      </UDropdownMenu>
      <UDropdownMenu :items="toolsOptions" :modal="false">
        <template #default="{ open }">
          <UButton
            :variant="open ? 'soft' : 'ghost'"
            color="neutral"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('app-menu-tools')"
            :ui="{ base: 'px-2 py-1 text-default font-normal' }"
          />
        </template>
      </UDropdownMenu>
      <UDropdownMenu :items="helpOptions" :modal="false">
        <template #default="{ open }">
          <UButton
            :variant="open ? 'soft' : 'ghost'"
            color="neutral"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('app-menu-help')"
            :ui="{ base: 'px-2 py-1 text-default font-normal' }"
          />
        </template>
      </UDropdownMenu>
    </div>

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

      <Suspense> <WindowControls /> </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";
  import { openUrl } from "@tauri-apps/plugin-opener";

  import type { DropdownMenuItem } from "@nuxt/ui";
  import { computed } from "vue";

  import { UtilityApi } from "~/api/";
  import { useConfirm, useI18n } from "~/shared/composables/";

  const confirm = useConfirm();
  const { fluent } = useI18n();

  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const fileOptions = computed<DropdownMenuItem[][]>(() => [
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
          { label: fluent.$t("app-menu-file-import-image"), onSelect: () => patternsStore.openImageImportModal() },
        ],
      },
      {
        label: fluent.$t("app-menu-file-export"),
        disabled: !patternsStore.pattern,
        children: [
          { label: "OXS", onSelect: () => patternsStore.openExportModal("oxs") },
          { label: "PDF", onSelect: () => patternsStore.openExportModal("pdf") },
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
  ]);
  const patternOptions = computed<DropdownMenuItem[][]>(() => [
    [
      { label: fluent.$t("pattern-info"), onSelect: () => patternsStore.openPatternInfoModal() },
      {
        label: fluent.$t("fabric-properties"),
        onSelect: () => patternsStore.openFabricModal(patternsStore.pattern?.fabric),
      },
      { label: fluent.$t("grid-properties"), onSelect: () => patternsStore.openGridModal() },
    ],
    [{ label: fluent.$t("publish-settings"), onSelect: () => patternsStore.openPublishModal() }],
  ]);
  const toolsOptions = computed<DropdownMenuItem[][]>(() => [
    [{ label: fluent.$t("settings"), kbds: ["ctrl", ","], onSelect: () => settingsStore.openSettingsModal() }],
    [
      {
        label: fluent.$t("updater-check-for-updates"),
        onSelect: () => settingsStore.checkForUpdates(),
      },
    ],
  ]);
  const helpOptions = computed<DropdownMenuItem[][]>(() => [
    [
      { label: fluent.$t("app-menu-help-learn-more"), onSelect: () => openUrl("https://embroiderly.niusia.me") },
      {
        label: fluent.$t("app-menu-help-license"),
        onSelect: () => openUrl("https://github.com/embroidery-space/embroiderly/blob/main/LICENSE"),
      },
    ],
    [{ label: fluent.$t("app-menu-help-about"), onSelect: () => showSystemInfo() }],
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

  defineShortcuts(extractShortcuts(fileOptions.value));
  defineShortcuts(extractShortcuts(toolsOptions.value));

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

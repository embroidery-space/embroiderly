<template>
  <div class="flex border-b border-default">
    <div data-tauri-drag-region class="grow flex items-center gap-x-2 px-2">
      <UDropdownMenu :items="fileOptions" :modal="false">
        <template #default="{ open }">
          <UButton
            :variant="open ? 'soft' : 'ghost'"
            color="neutral"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('label-file')"
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
            :label="$t('label-pattern')"
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
            :label="$t('label-tools')"
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
            :label="$t('label-help')"
            :ui="{ base: 'px-2 py-1 text-default font-normal' }"
          />
        </template>
      </UDropdownMenu>
    </div>

    <div class="flex items-center gap-2">
      <template v-if="patternsStore.pattern !== undefined">
        <ToolButton
          :label="$t('label-undo')"
          icon="i-lucide:undo"
          :kbds="['ctrl', 'z']"
          :on-click="patternsStore.undo"
        />
        <ToolButton
          :label="$t('label-redo')"
          icon="i-lucide:redo"
          :kbds="['ctrl', 'y']"
          :on-click="patternsStore.redo"
        />
        <USeparator orientation="vertical" />
      </template>

      <UDropdownMenu :items="manageOptions" :modal="false">
        <UTooltip :text="$t('label-manage')">
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
  import { computed } from "vue";
  import type { DropdownMenuItem } from "@nuxt/ui";
  import { SystemApi } from "#/api/";

  const confirm = useConfirm();

  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const fluent = useFluent();

  const fileOptions = computed<DropdownMenuItem[][]>(() => [
    [
      { label: fluent.$t("label-open"), kbds: ["ctrl", "o"], onSelect: () => patternsStore.openPattern() },
      { label: fluent.$t("label-create"), kbds: ["ctrl", "n"], onSelect: () => patternsStore.openFabricModal() },
    ],
    [
      {
        label: fluent.$t("label-save"),
        kbds: ["ctrl", "s"],
        disabled: !patternsStore.pattern,
        onSelect: () => patternsStore.savePattern(),
      },
      {
        label: fluent.$t("label-save-as"),
        kbds: ["ctrl", "shift", "s"],
        disabled: !patternsStore.pattern,
        onSelect: () => patternsStore.savePattern(true),
      },
    ],
    [
      {
        label: fluent.$t("label-export"),
        disabled: !patternsStore.pattern,
        children: [
          { label: "OXS", onSelect: () => patternsStore.openExportModal("oxs") },
          { label: "PDF", onSelect: () => patternsStore.openExportModal("pdf") },
        ],
      },
    ],
    [
      {
        label: fluent.$t("label-close"),
        kbds: ["ctrl", "w"],
        disabled: !patternsStore.pattern,
        onSelect: () => patternsStore.closePattern(),
      },
    ],
  ]);
  const patternOptions = computed<DropdownMenuItem[][]>(() => [
    [
      { label: fluent.$t("title-pattern-info"), onSelect: () => patternsStore.openPatternInfoModal() },
      {
        label: fluent.$t("title-fabric-properties"),
        onSelect: () => patternsStore.openFabricModal(patternsStore.pattern?.fabric),
      },
      { label: fluent.$t("title-grid-properties"), onSelect: () => patternsStore.openGridModal() },
    ],
    [{ label: fluent.$t("title-publish-settings"), onSelect: () => patternsStore.openPublishModal() }],
  ]);
  const toolsOptions = computed<DropdownMenuItem[][]>(() => [
    [{ label: fluent.$t("title-settings"), kbds: ["ctrl", ","], onSelect: () => settingsStore.openSettingsModal() }],
    [
      {
        label: fluent.$t("label-check-for-updates"),
        onSelect: () => settingsStore.checkForUpdates(),
      },
    ],
  ]);
  const helpOptions = computed<DropdownMenuItem[][]>(() => [
    [
      { label: fluent.$t("label-learn-more"), onSelect: () => openUrl("https://embroiderly.niusia.me") },
      {
        label: fluent.$t("label-license"),
        onSelect: () => openUrl("https://github.com/embroidery-space/embroiderly/blob/main/LICENSE"),
      },
    ],
    [{ label: fluent.$t("label-about"), onSelect: () => showSystemInfo() }],
  ]);

  const manageOptions = computed<DropdownMenuItem[][]>(() => [
    [{ label: fluent.$t("title-settings"), kbds: ["ctrl", ","], onSelect: () => settingsStore.openSettingsModal() }],
    [
      {
        label: fluent.$t("label-check-for-updates"),
        onSelect: () => settingsStore.checkForUpdates(),
      },
    ],
  ]);

  defineShortcuts(extractShortcuts(fileOptions.value));
  defineShortcuts(extractShortcuts(toolsOptions.value));

  async function showSystemInfo() {
    const systemInfo = await SystemApi.getSystemInfo();
    const systemInfoMessage = fluent.$t("message-system-info", { ...systemInfo });

    const accepted = await confirm.open({
      title: fluent.$t("title-system-info"),
      message: systemInfoMessage,
      acceptLabel: fluent.$t("label-copy"),
      rejectLabel: fluent.$t("label-close"),
    }).result;
    if (accepted) await writeText(systemInfoMessage);
  }
</script>

<template>
  <div class="flex border-b border-default">
    <div data-tauri-drag-region class="grow flex items-center gap-x-2 px-2">
      <NuxtDropdownMenu :items="fileOptions" :modal="false">
        <template #default="{ open }">
          <NuxtButton
            :variant="open ? 'soft' : 'ghost'"
            color="neutral"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('label-file')"
            :ui="{ base: 'px-2 py-1 text-default font-normal' }"
          />
        </template>
      </NuxtDropdownMenu>
      <NuxtDropdownMenu v-if="patternsStore.pattern !== undefined" :items="patternOptions" :modal="false">
        <template #default="{ open }">
          <NuxtButton
            :variant="open ? 'soft' : 'ghost'"
            color="neutral"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('label-pattern')"
            :ui="{ base: 'px-2 py-1 text-default font-normal' }"
          />
        </template>
      </NuxtDropdownMenu>
      <NuxtDropdownMenu :items="toolsOptions" :modal="false">
        <template #default="{ open }">
          <NuxtButton
            :variant="open ? 'soft' : 'ghost'"
            color="neutral"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('label-tools')"
            :ui="{ base: 'px-2 py-1 text-default font-normal' }"
          />
        </template>
      </NuxtDropdownMenu>
      <NuxtDropdownMenu :items="helpOptions" :modal="false">
        <template #default="{ open }">
          <NuxtButton
            :variant="open ? 'soft' : 'ghost'"
            color="neutral"
            trailing-icon="i-lucide:chevron-down"
            :label="$t('label-help')"
            :ui="{ base: 'px-2 py-1 text-default font-normal' }"
          />
        </template>
      </NuxtDropdownMenu>
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
        <NuxtSeparator orientation="vertical" />
      </template>

      <NuxtDropdownMenu :items="manageOptions" :modal="false">
        <NuxtTooltip :text="$t('label-manage')">
          <NuxtButton :loading="settingsStore.loadingUpdate" variant="ghost" color="neutral" icon="i-lucide:settings" />
        </NuxtTooltip>
      </NuxtDropdownMenu>

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
      { label: fluent.$t("label-create"), kbds: ["ctrl", "n"], onSelect: () => patternsStore.createPattern() },
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
      { label: fluent.$t("title-pattern-info"), onSelect: () => patternsStore.updatePatternInfo() },
      { label: fluent.$t("title-fabric-properties"), onSelect: () => patternsStore.updateFabric() },
      { label: fluent.$t("title-grid-properties"), onSelect: () => patternsStore.updateGrid() },
    ],
    [{ label: fluent.$t("title-publish-settings"), onSelect: () => patternsStore.openPublishModal() }],
  ]);
  const toolsOptions = computed<DropdownMenuItem[][]>(() => [
    [{ label: fluent.$t("title-settings"), kbds: ["ctrl", ","], onSelect: () => settingsStore.openSettings() }],
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
    [{ label: fluent.$t("title-settings"), kbds: ["ctrl", ","], onSelect: () => settingsStore.openSettings() }],
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

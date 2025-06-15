<template>
  <div class="flex">
    <div data-tauri-drag-region class="grow flex items-center gap-x-2 p-2">
      <UDropdownMenu :items="fileOptions" :modal="false">
        <UButton variant="ghost" color="neutral" :label="$t('label-file')" />
      </UDropdownMenu>
      <UDropdownMenu v-if="patternsStore.pattern !== undefined" :items="patternOptions" :modal="false">
        <UButton variant="ghost" color="neutral" :label="$t('label-pattern')" />
      </UDropdownMenu>
      <UDropdownMenu :items="helpOptions" :modal="false">
        <UButton variant="ghost" color="neutral" :label="$t('label-help')" />
      </UDropdownMenu>
    </div>

    <PatternSelector
      v-if="appStateStore.openedPatterns?.length"
      @switch="(patternId) => patternsStore.loadPattern(patternId)"
    />

    <div class="h-full flex items-center gap-2">
      <UDropdownMenu :items="manageOptions" :modal="false">
        <UTooltip :text="$t('label-manage')">
          <UButton :loading="settingsStore.loadingUpdate" variant="ghost" color="neutral" icon="i-prime:cog" />
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
  import { useFluent } from "fluent-vue";
  import { useConfirm } from "primevue";
  import type { NavigationMenuItem, DropdownMenuItem } from "@nuxt/ui";

  import { SystemApi } from "#/api/";
  import { useAppStateStore, usePatternsStore, useSettingsStore } from "#/stores/";

  import PatternSelector from "./toolbar/PatternSelector.vue";
  import WindowControls from "./toolbar/WindowControls.vue";

  const confirm = useConfirm();

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const fluent = useFluent();

  const fileOptions = computed<NavigationMenuItem[][]>(() => [
    [
      { label: fluent.$t("label-open"), onSelect: () => patternsStore.openPattern() },
      { label: fluent.$t("label-create"), onSelect: () => patternsStore.createPattern },
    ],

    [
      {
        label: fluent.$t("label-save"),
        disabled: !patternsStore.pattern,
        onSelect: () => patternsStore.savePattern(),
      },
      {
        label: fluent.$t("label-save-as"),
        disabled: !patternsStore.pattern,
        onSelect: () => patternsStore.savePattern(true),
      },
    ],
    [
      {
        label: fluent.$t("label-export"),
        disabled: !patternsStore.pattern,
        children: [
          { label: "OXS", onSelect: () => patternsStore.exportPattern("oxs") },
          { label: "PDF", onSelect: () => patternsStore.exportPattern("pdf") },
        ],
      },
    ],

    [
      {
        label: fluent.$t("label-close"),
        disabled: !patternsStore.pattern,
        onSelect: () => patternsStore.closePattern(),
      },
    ],
  ]);
  const patternOptions = computed<NavigationMenuItem[][]>(() => [
    [
      { label: fluent.$t("title-pattern-info"), onSelect: () => patternsStore.updatePatternInfo() },
      { label: fluent.$t("title-fabric-properties"), onSelect: () => patternsStore.updateFabric() },
      { label: fluent.$t("title-grid-properties"), onSelect: () => patternsStore.updateGrid() },
    ],
  ]);
  const helpOptions = computed<NavigationMenuItem[][]>(() => [
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
    [{ label: fluent.$t("title-settings"), onSelect: () => settingsStore.openSettings() }],
    [
      {
        label: fluent.$t("label-check-for-updates"),
        onSelect: () => settingsStore.checkForUpdates(),
      },
    ],
  ]);

  async function showSystemInfo() {
    const systemInfo = await SystemApi.getSystemInfo();
    const systemInfoMessage = fluent.$t("message-system-info", { ...systemInfo });
    confirm.require({
      header: fluent.$t("title-system-info"),
      message: systemInfoMessage,
      acceptLabel: fluent.$t("label-copy"),
      rejectLabel: fluent.$t("label-close"),
      accept: async () => {
        await writeText(systemInfoMessage);
      },
    });
  }
</script>

<template>
  <Toolbar data-tauri-drag-region class="border-0 border-b rounded-none p-0" pt:end:class="h-full">
    <template #start>
      <Menubar :model="menuOptions" class="border-0 rounded-none" />
    </template>

    <template v-if="appStateStore.openedPatterns?.length" #center>
      <PatternSelector @switch="(patternId) => patternsStore.loadPattern(patternId)" />
    </template>

    <template #end>
      <Suspense> <WindowControls /> </Suspense>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
  import { writeText } from "@tauri-apps/plugin-clipboard-manager";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { ref } from "vue";
  import { useFluent } from "fluent-vue";
  import { Menubar, Toolbar, useConfirm } from "primevue";
  import type { MenuItem } from "primevue/menuitem";

  import { SystemApi } from "#/api/";
  import { useAppStateStore, usePatternsStore, useSettingsStore } from "#/stores/";

  import PatternSelector from "./toolbar/PatternSelector.vue";
  import WindowControls from "./toolbar/WindowControls.vue";

  const confirm = useConfirm();

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const fluent = useFluent();

  const menuOptions = ref<MenuItem[]>([
    {
      label: () => fluent.$t("label-file"),
      items: [
        { label: () => fluent.$t("label-open"), command: () => patternsStore.openPattern() },
        { label: () => fluent.$t("label-create"), command: () => patternsStore.createPattern },
        { separator: true },
        {
          label: () => fluent.$t("label-save"),
          command: () => patternsStore.savePattern(),
          disabled: () => !patternsStore.pattern,
        },
        {
          label: () => fluent.$t("label-save-as"),
          command: () => patternsStore.savePattern(true),
          disabled: () => !patternsStore.pattern,
        },
        { separator: true },
        {
          label: () => fluent.$t("label-export"),
          disabled: () => !patternsStore.pattern,
          items: [{ label: "OXS", command: () => patternsStore.exportPattern("oxs") }],
        },
        { separator: true },
        {
          label: () => fluent.$t("label-close"),
          command: () => patternsStore.closePattern(),
          disabled: () => !patternsStore.pattern,
        },
      ],
    },
    {
      label: () => fluent.$t("label-pattern"),
      visible: () => patternsStore.pattern !== undefined,
      items: [
        { label: () => fluent.$t("title-pattern-info"), command: () => patternsStore.updatePatternInfo() },
        { label: () => fluent.$t("title-fabric-properties"), command: () => patternsStore.updateFabric() },
        { label: () => fluent.$t("title-grid-properties"), command: () => patternsStore.updateGrid() },
      ],
    },
    {
      label: () => fluent.$t("label-help"),
      items: [
        { label: () => fluent.$t("label-learn-more"), command: () => openUrl("https://embroiderly.niusia.me") },
        {
          label: () => fluent.$t("label-license"),
          command: () => openUrl("https://github.com/embroidery-space/embroiderly/blob/main/LICENSE"),
        },
        { separator: true },
        { label: () => fluent.$t("label-about"), command: () => showSystemInfo() },
      ],
    },
    { label: () => fluent.$t("title-settings"), command: () => settingsStore.openSettings() },
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

<template>
  <Toolbar data-tauri-drag-region class="border-0 border-b rounded-none p-0" pt:end:class="h-full">
    <template #start>
      <Menubar :model="menuOptions" class="border-0 rounded-none" />
    </template>

    <template v-if="appStateStore.openedPatterns?.length" #center>
      <PatternSelector @switch="(patternPath) => patternsStore.openPattern(patternPath)" />
    </template>

    <template #end>
      <Suspense> <WindowControls /> </Suspense>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useFluent } from "fluent-vue";
  import { Menubar, Toolbar } from "primevue";
  import type { MenuItem } from "primevue/menuitem";
  import PatternSelector from "./toolbar/PatternSelector.vue";
  import WindowControls from "./toolbar/WindowControls.vue";
  import { useAppStateStore } from "#/stores/state";
  import { usePatternsStore } from "#/stores/patterns";
  import { usePreferencesStore } from "#/stores/preferences";

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();
  const preferencesStore = usePreferencesStore();

  const fluent = useFluent();

  const menuOptions = ref<MenuItem[]>([
    {
      label: () => fluent.$t("label-file"),
      items: [
        { label: () => fluent.$t("label-open"), command: patternsStore.loadPattern },
        { label: () => fluent.$t("label-create"), command: patternsStore.createPattern },
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
          command: patternsStore.closePattern,
          disabled: () => !patternsStore.pattern,
        },
      ],
    },
    {
      label: () => fluent.$t("label-pattern"),
      visible: () => patternsStore.pattern !== undefined,
      items: [
        { label: () => fluent.$t("title-pattern-info"), command: patternsStore.updatePatternInfo },
        { label: () => fluent.$t("title-fabric-properties"), command: patternsStore.updateFabric },
        { label: () => fluent.$t("title-grid-properties"), command: patternsStore.updateGrid },
      ],
    },
    { label: () => fluent.$t("title-preferences"), command: preferencesStore.openPreferences },
  ]);
</script>

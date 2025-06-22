<template>
  <div class="flex flex-col gap-1 p-1">
    <ToolSelector
      v-for="option in displayModeOptions"
      :key="option.value"
      v-model="displayMode"
      :options="[option]"
      :disabled="disabled"
    />
    <NuxtSeparator />
    <ToolToggle
      v-model="showSymbols"
      :option="{
        icon: markRaw(IconSymbol),
        label: showSymbols ? fluent.$t('label-hide-symbols') : fluent.$t('label-show-symbols'),
      }"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, markRaw } from "vue";
  import { useFluent } from "fluent-vue";
  import { DisplayMode } from "#/schemas/";
  import { usePatternsStore } from "#/stores/patterns";

  import { IconMix, IconSquare, IconSymbol, IconFullStitch } from "../icons/stitches/";

  const fluent = useFluent();

  const patternsStore = usePatternsStore();

  const disabled = computed(() => patternsStore.pattern === undefined);

  const displayMode = computed({
    get: () => patternsStore.pattern?.displayMode,
    set: async (value) => {
      const mode = value === patternsStore.pattern?.displayMode ? undefined : value;
      await patternsStore.setDisplayMode(mode);
    },
  });
  const displayModeOptions = computed(() => [
    { icon: markRaw(IconMix), label: fluent.$t("label-view-as-mix"), value: DisplayMode.Mixed },
    { icon: markRaw(IconSquare), label: fluent.$t("label-view-as-solid"), value: DisplayMode.Solid },
    { icon: markRaw(IconFullStitch), label: fluent.$t("label-view-as-stitches"), value: DisplayMode.Stitches },
  ]);

  const showSymbols = computed({
    get: () => patternsStore.pattern?.showSymbols ?? false,
    set: patternsStore.showSymbols,
  });
</script>

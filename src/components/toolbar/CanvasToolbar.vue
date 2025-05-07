<template>
  <div class="bg-content flex flex-col gap-1 p-1">
    <ToolSelector
      v-for="option in displayModeOptions"
      :key="option.value"
      v-model="displayMode"
      :options="[option]"
      :disabled="disabled"
    />
    <Divider class="m-0" />
    <ToolToggle
      v-for="option in layersVisibilityOptions"
      :key="option.label()"
      v-model="option.modelValue"
      :option="{ icon: option.icon, label: option.label }"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import { useFluent } from "fluent-vue";
  import { Divider } from "primevue";
  import { DisplayMode } from "#/schemas/index.ts";
  import { usePatternsStore } from "#/stores/patterns";
  import ToolSelector from "./ToolSelector.vue";
  import ToolToggle from "./ToolToggle.vue";

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
  const displayModeOptions = ref([
    { icon: "i-stitches:mix", label: () => fluent.$t("label-view-as-mix"), value: DisplayMode.Mixed },
    { icon: "i-stitches:square", label: () => fluent.$t("label-view-as-solid"), value: DisplayMode.Solid },
    { icon: "i-stitches:full", label: () => fluent.$t("label-view-as-stitches"), value: DisplayMode.Stitches },
  ]);

  const showSymbols = computed({
    get: () => patternsStore.pattern?.showSymbols ?? false,
    set: patternsStore.showSymbols,
  });

  const layersVisibilityOptions = ref([
    {
      modelValue: showSymbols,
      icon: "i-stitches:symbol",
      label: () => (showSymbols.value ? fluent.$t("label-hide-symbols") : fluent.$t("label-show-symbols")),
    },
  ]);
</script>

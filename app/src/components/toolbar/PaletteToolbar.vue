<template>
  <div class="inline-grid grid-cols-[repeat(4,2rem)] gap-2">
    <ToolSelector
      v-model="appStateStore.selectedTool"
      :options="fullstitches"
      :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
      :disabled="disabled"
    />
    <ToolSelector
      v-model="appStateStore.selectedTool"
      :options="partstitches"
      :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
      :disabled="disabled"
    />
    <ToolSelector
      v-model="appStateStore.selectedTool"
      :options="linestitches"
      :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
      :disabled="disabled"
    />
    <ToolSelector
      v-model="appStateStore.selectedTool"
      :options="nodestitches"
      :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
      :disabled="disabled"
    />

    <ToolSelector v-model="appStateStore.selectedTool" :options="cursor" :disabled="disabled" />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from "vue";
  import { tools } from "~/core/tools/";

  const fluent = useFluent();

  const appStateStore = useAppStateStore();
  const settingsStore = useSettingsStore();

  const { disabled } = defineProps<{
    disabled?: boolean;
  }>();

  const fullstitches = computed(() => [
    { icon: "i-stitches:full", label: fluent.$t("label-stitch-full"), value: tools.FullStitch },
    { icon: "i-stitches:petite", label: fluent.$t("label-stitch-petite"), value: tools.PetiteStitch },
  ]);
  const partstitches = computed(() => [
    { icon: "i-stitches:half", label: fluent.$t("label-stitch-half"), value: tools.HalfStitch },
    { icon: "i-stitches:quarter", label: fluent.$t("label-stitch-quarter"), value: tools.QuarterStitch },
  ]);
  const linestitches = computed(() => [
    { icon: "i-stitches:back", label: fluent.$t("label-stitch-back"), value: tools.BackStitch },
    { icon: "i-stitches:straight", label: fluent.$t("label-stitch-straight"), value: tools.StraightStitch },
  ]);
  const nodestitches = computed(() => [
    { icon: "i-stitches:french-knot", label: fluent.$t("label-stitch-french-knot"), value: tools.FrenchKnot },
    { icon: "i-stitches:bead", label: fluent.$t("label-stitch-bead"), value: tools.Bead },
  ]);

  const cursor = computed(() => [
    { icon: "i-material-symbols:arrow-selector-tool", label: fluent.$t("label-tool-cursor"), value: tools.Cursor },
  ]);
</script>

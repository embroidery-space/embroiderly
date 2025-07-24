<template>
  <div class="flex gap-x-2">
    <ToolSelector
      v-model="appStateStore.selectedStitchTool"
      :options="fullstitches"
      :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
      :disabled="disabled"
    />
    <ToolSelector
      v-model="appStateStore.selectedStitchTool"
      :options="partstitches"
      :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
      :disabled="disabled"
    />
    <ToolSelector
      v-model="appStateStore.selectedStitchTool"
      :options="linestitches"
      :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
      :disabled="disabled"
    />
    <ToolSelector
      v-model="appStateStore.selectedStitchTool"
      :options="nodestitches"
      :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
      :disabled="disabled"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from "vue";
  import { FullStitchKind, LineStitchKind, NodeStitchKind, PartStitchKind } from "#/core/pattern/";

  const fluent = useFluent();

  const appStateStore = useAppStateStore();
  const settingsStore = useSettingsStore();

  const { disabled } = defineProps<{
    disabled?: boolean;
  }>();

  const fullstitches = computed(() => [
    { icon: "i-stitches:full", label: fluent.$t("label-stitch-full"), value: FullStitchKind.Full },
    { icon: "i-stitches:petite", label: fluent.$t("label-stitch-petite"), value: FullStitchKind.Petite },
  ]);
  const partstitches = computed(() => [
    { icon: "i-stitches:half", label: fluent.$t("label-stitch-half"), value: PartStitchKind.Half },
    { icon: "i-stitches:quarter", label: fluent.$t("label-stitch-quarter"), value: PartStitchKind.Quarter },
  ]);
  const linestitches = computed(() => [
    { icon: "i-stitches:back", label: fluent.$t("label-stitch-back"), value: LineStitchKind.Back },
    { icon: "i-stitches:straight", label: fluent.$t("label-stitch-straight"), value: LineStitchKind.Straight },
  ]);
  const nodestitches = computed(() => [
    { icon: "i-stitches:french-knot", label: fluent.$t("label-stitch-french-knot"), value: NodeStitchKind.FrenchKnot },
    { icon: "i-stitches:bead", label: fluent.$t("label-stitch-bead"), value: NodeStitchKind.Bead },
  ]);
</script>

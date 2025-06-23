<template>
  <div class="flex flex-col gap-y-2">
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
    <div class="flex gap-x-2">
      <ToolButton
        :label="$t('label-undo')"
        icon="i-lucide:undo"
        :kbds="['ctrl', 'z']"
        :disabled="disabled"
        :on-click="patternsStore.undo"
      />
      <ToolButton
        :label="$t('label-redo')"
        icon="i-lucide:redo"
        :kbds="['ctrl', 'y']"
        :disabled="disabled"
        :on-click="patternsStore.redo"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, markRaw } from "vue";
  import { FullStitchKind, LineStitchKind, NodeStitchKind, PartStitchKind } from "#/schemas/pattern.ts";

  import {
    IconFullStitch,
    IconPetiteStitch,
    IconHalfStitch,
    IconQuarterStitch,
    IconStraightStitch,
    IconBackStitch,
    IconFrenchKnot,
    IconBead,
  } from "../icons/stitches/";

  const fluent = useFluent();

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const { disabled } = defineProps<{
    disabled?: boolean;
  }>();

  const fullstitches = computed(() => [
    { icon: markRaw(IconFullStitch), label: fluent.$t("label-stitch-full"), value: FullStitchKind.Full },
    { icon: markRaw(IconPetiteStitch), label: fluent.$t("label-stitch-petite"), value: FullStitchKind.Petite },
  ]);
  const partstitches = computed(() => [
    { icon: markRaw(IconHalfStitch), label: fluent.$t("label-stitch-half"), value: PartStitchKind.Half },
    { icon: markRaw(IconQuarterStitch), label: fluent.$t("label-stitch-quarter"), value: PartStitchKind.Quarter },
  ]);
  const linestitches = computed(() => [
    { icon: markRaw(IconBackStitch), label: fluent.$t("label-stitch-back"), value: LineStitchKind.Back },
    { icon: markRaw(IconStraightStitch), label: fluent.$t("label-stitch-straight"), value: LineStitchKind.Straight },
  ]);
  const nodestitches = computed(() => [
    { icon: markRaw(IconFrenchKnot), label: fluent.$t("label-stitch-french-knot"), value: NodeStitchKind.FrenchKnot },
    { icon: markRaw(IconBead), label: fluent.$t("label-stitch-bead"), value: NodeStitchKind.Bead },
  ]);
</script>

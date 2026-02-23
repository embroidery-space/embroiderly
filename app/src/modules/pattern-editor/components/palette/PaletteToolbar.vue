<script lang="ts" setup>
import { useShortcuts } from "@embroiderly/shortcuts";

import { computed } from "vue";

import { useI18n } from "~/composables/";
import { tools } from "~/modules/pattern-editor/lib/tools/";
import { useEditorStateStore, usePatternStore } from "~/modules/pattern-editor/stores/";
import { useSettingsStore } from "~/shared/stores/";

import { ToolSelect } from "../toolbar/";
import type { ToolSelectItem } from "../toolbar/";

const { disabled } = defineProps<{
  disabled?: boolean;
}>();

const { fluent } = useI18n();

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();
const settingsStore = useSettingsStore();

const selectionColor = computed(() => {
  if (!settingsStore.other.usePaletteItemColorForStitchTools) return undefined;

  const palindex = editorStateStore.selectedPaletteItemIndex;
  if (!patternStore.pattern || palindex === undefined) return undefined;

  return patternStore.pattern.palette.items[palindex]?.hex;
});

const fullstitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.FullStitch,
    label: fluent.$t("stitch-full"),
    icon: "stitches:full",
    shortcut: "F",
  },
]);

const petitestitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.PetiteStitch,
    label: fluent.$t("stitch-petite"),
    icon: "stitches:petite",
    shortcut: "P",
  },
  {
    value: tools.PetiteStitchTL,
    label: fluent.$t("stitch-petite-tl"),
    icon: "stitches:petite-tl",
    shortcut: "P-T-L",
  },
  {
    value: tools.PetiteStitchTR,
    label: fluent.$t("stitch-petite-tr"),
    icon: "stitches:petite-tr",
    shortcut: "P-T-R",
  },
  {
    value: tools.PetiteStitchBR,
    label: fluent.$t("stitch-petite-br"),
    icon: "stitches:petite-br",
    shortcut: "P-B-R",
  },
  {
    value: tools.PetiteStitchBL,
    label: fluent.$t("stitch-petite-bl"),
    icon: "stitches:petite-bl",
    shortcut: "P-B-L",
  },
]);

const halfstitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.HalfStitch,
    label: fluent.$t("stitch-half"),
    icon: "stitches:half",
    shortcut: "H",
  },
  {
    value: tools.HalfStitchForward,
    label: fluent.$t("stitch-half-forward"),
    icon: "stitches:half-forward",
    shortcut: "H-F",
  },
  {
    value: tools.HalfStitchBackward,
    label: fluent.$t("stitch-half-backward"),
    icon: "stitches:half-backward",
    shortcut: "H-B",
  },
]);

const quarterstitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.QuarterStitch,
    label: fluent.$t("stitch-quarter"),
    icon: "stitches:quarter",
    shortcut: "Q",
  },
  {
    value: tools.QuarterStitchTL,
    label: fluent.$t("stitch-quarter-tl"),
    icon: "stitches:quarter-tl",
    shortcut: "Q-T-L",
  },
  {
    value: tools.QuarterStitchTR,
    label: fluent.$t("stitch-quarter-tr"),
    icon: "stitches:quarter-tr",
    shortcut: "Q-T-R",
  },
  {
    value: tools.QuarterStitchBR,
    label: fluent.$t("stitch-quarter-br"),
    icon: "stitches:quarter-br",
    shortcut: "Q-B-R",
  },
  {
    value: tools.QuarterStitchBL,
    label: fluent.$t("stitch-quarter-bl"),
    icon: "stitches:quarter-bl",
    shortcut: "Q-B-L",
  },
]);

const linestitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.BackStitch,
    label: fluent.$t("stitch-back"),
    icon: "stitches:back",
    shortcut: "S",
  },
  {
    value: tools.StraightStitch,
    label: fluent.$t("stitch-straight"),
    icon: "stitches:straight",
    shortcut: "S-S",
  },
]);

const nodestitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.FrenchKnot,
    label: fluent.$t("stitch-french-knot"),
    icon: "stitches:french-knot",
    shortcut: "K",
  },
  {
    value: tools.Bead,
    label: fluent.$t("stitch-bead"),
    icon: "stitches:bead",
    shortcut: "B",
  },
]);

const cursor = computed<ToolSelectItem[]>(() => [
  {
    value: tools.Cursor,
    label: fluent.$t("palette-toolbar-cursor"),
    icon: "material-symbols:arrow-selector-tool",
    shortcut: "C",
  },
]);

// Define shorter key sequences for enabling top-left and bottom-left positional stitch tools if the user hasn't typed the full shortcut.
useShortcuts({
  "P-T": () => (editorStateStore.selectedTool = tools.PetiteStitchTL),
  "P-B": () => (editorStateStore.selectedTool = tools.PetiteStitchBL),

  "Q-T": () => (editorStateStore.selectedTool = tools.QuarterStitchTL),
  "Q-B": () => (editorStateStore.selectedTool = tools.QuarterStitchBL),
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <ToolSelect
        v-model="editorStateStore.selectedTool"
        :items="fullstitches"
        :selection-color="selectionColor"
        :disabled="disabled"
      />
      <ToolSelect
        v-model="editorStateStore.selectedTool"
        :items="petitestitches"
        :selection-color="selectionColor"
        :disabled="disabled"
      />
      <ToolSelect
        v-model="editorStateStore.selectedTool"
        :items="halfstitches"
        :selection-color="selectionColor"
        :disabled="disabled"
      />
      <ToolSelect
        v-model="editorStateStore.selectedTool"
        :items="quarterstitches"
        :selection-color="selectionColor"
        :disabled="disabled"
      />
      <ToolSelect
        v-model="editorStateStore.selectedTool"
        :items="linestitches"
        :selection-color="selectionColor"
        :disabled="disabled"
      />
      <ToolSelect
        v-model="editorStateStore.selectedTool"
        :items="nodestitches"
        :selection-color="selectionColor"
        :disabled="disabled"
      />
    </div>

    <div class="flex gap-2">
      <ToolSelect v-model="editorStateStore.selectedTool" :items="cursor" :disabled="disabled" />
    </div>
  </div>
</template>

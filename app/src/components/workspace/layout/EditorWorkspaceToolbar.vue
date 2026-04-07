<script lang="ts" setup>
import { Separator, ToolSelect } from "@embroiderly/ui";
import type { ToolSelectItem } from "@embroiderly/ui";

import { computed } from "vue";

import {
  IconCursor,
  IconStitchBack,
  IconStitchBead,
  IconStitchFrenchKnot,
  IconStitchFull,
  IconStitchHalf,
  IconStitchHalfBackward,
  IconStitchHalfForward,
  IconStitchPetite,
  IconStitchPetiteBL,
  IconStitchPetiteBR,
  IconStitchPetiteTL,
  IconStitchPetiteTR,
  IconStitchQuarter,
  IconStitchQuarterBL,
  IconStitchQuarterBR,
  IconStitchQuarterTL,
  IconStitchQuarterTR,
  IconStitchStraight,
} from "~/assets/icons/";
import { useI18n, useShortcuts, extractShortcuts } from "~/composables/";
import { tools } from "~/lib/tools/";
import type { PatternEditorTool } from "~/lib/tools/";
import { useEditorStateStore, usePatternStore } from "~/stores/";
import { useSettingsStore } from "~/stores/";

export interface EditorWorkspaceToolbarProps {
  /** Whether the toolbar is disabled. */
  disabled?: boolean;
}

const { disabled } = defineProps<EditorWorkspaceToolbarProps>();

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
    icon: IconStitchFull,
    shortcut: "F",
  },
]);

const petitestitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.PetiteStitch,
    label: fluent.$t("stitch-petite"),
    icon: IconStitchPetite,
    shortcut: "P",
  },
  {
    value: tools.PetiteStitchTL,
    label: fluent.$t("stitch-petite-tl"),
    icon: IconStitchPetiteTL,
    shortcut: "P-T-L",
  },
  {
    value: tools.PetiteStitchTR,
    label: fluent.$t("stitch-petite-tr"),
    icon: IconStitchPetiteTR,
    shortcut: "P-T-R",
  },
  {
    value: tools.PetiteStitchBR,
    label: fluent.$t("stitch-petite-br"),
    icon: IconStitchPetiteBR,
    shortcut: "P-B-R",
  },
  {
    value: tools.PetiteStitchBL,
    label: fluent.$t("stitch-petite-bl"),
    icon: IconStitchPetiteBL,
    shortcut: "P-B-L",
  },
]);

const halfstitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.HalfStitch,
    label: fluent.$t("stitch-half"),
    icon: IconStitchHalf,
    shortcut: "H",
  },
  {
    value: tools.HalfStitchForward,
    label: fluent.$t("stitch-half-forward"),
    icon: IconStitchHalfForward,
    shortcut: "H-F",
  },
  {
    value: tools.HalfStitchBackward,
    label: fluent.$t("stitch-half-backward"),
    icon: IconStitchHalfBackward,
    shortcut: "H-B",
  },
]);

const quarterstitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.QuarterStitch,
    label: fluent.$t("stitch-quarter"),
    icon: IconStitchQuarter,
    shortcut: "Q",
  },
  {
    value: tools.QuarterStitchTL,
    label: fluent.$t("stitch-quarter-tl"),
    icon: IconStitchQuarterTL,
    shortcut: "Q-T-L",
  },
  {
    value: tools.QuarterStitchTR,
    label: fluent.$t("stitch-quarter-tr"),
    icon: IconStitchQuarterTR,
    shortcut: "Q-T-R",
  },
  {
    value: tools.QuarterStitchBR,
    label: fluent.$t("stitch-quarter-br"),
    icon: IconStitchQuarterBR,
    shortcut: "Q-B-R",
  },
  {
    value: tools.QuarterStitchBL,
    label: fluent.$t("stitch-quarter-bl"),
    icon: IconStitchQuarterBL,
    shortcut: "Q-B-L",
  },
]);

const linestitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.BackStitch,
    label: fluent.$t("stitch-back"),
    icon: IconStitchBack,
    shortcut: "S",
  },
  {
    value: tools.StraightStitch,
    label: fluent.$t("stitch-straight"),
    icon: IconStitchStraight,
    shortcut: "S-S",
  },
]);

const nodestitches = computed<ToolSelectItem[]>(() => [
  {
    value: tools.FrenchKnot,
    label: fluent.$t("stitch-french-knot"),
    icon: IconStitchFrenchKnot,
    shortcut: "K",
  },
  {
    value: tools.Bead,
    label: fluent.$t("stitch-bead"),
    icon: IconStitchBead,
    shortcut: "B",
  },
]);

const cursor = computed<ToolSelectItem[]>(() => [
  {
    value: tools.Cursor,
    label: fluent.$t("palette-toolbar-cursor"),
    icon: IconCursor,
    shortcut: "C",
  },
]);

// Register keyboard shortcuts for all tool groups.
useShortcuts(
  extractShortcuts(() =>
    [
      ...fullstitches.value,
      ...petitestitches.value,
      ...halfstitches.value,
      ...quarterstitches.value,
      ...linestitches.value,
      ...nodestitches.value,
      ...cursor.value,
    ].map((item) => ({
      shortcut: item.shortcut,
      onSelect() {
        editorStateStore.selectedTool = item.value as PatternEditorTool;
      },
    })),
  ),
);

// Define shorter key sequences for enabling top-left and bottom-left positional stitch tools if the user hasn't typed the full shortcut.
useShortcuts({
  "P-T": () => (editorStateStore.selectedTool = tools.PetiteStitchTL),
  "P-B": () => (editorStateStore.selectedTool = tools.PetiteStitchBL),

  "Q-T": () => (editorStateStore.selectedTool = tools.QuarterStitchTL),
  "Q-B": () => (editorStateStore.selectedTool = tools.QuarterStitchBL),
});
</script>

<template>
  <div class="flex flex-col gap-1 p-1">
    <ToolSelect
      v-model="editorStateStore.selectedTool"
      :items="fullstitches"
      :disabled="disabled"
      :selection-color="selectionColor"
      :delay-duration="200"
      :tooltip-options="{ side: 'right' }"
    />
    <ToolSelect
      v-model="editorStateStore.selectedTool"
      :items="petitestitches"
      :disabled="disabled"
      :selection-color="selectionColor"
      :delay-duration="200"
      :tooltip-options="{ side: 'right' }"
    />
    <ToolSelect
      v-model="editorStateStore.selectedTool"
      :items="halfstitches"
      :disabled="disabled"
      :selection-color="selectionColor"
      :delay-duration="200"
      :tooltip-options="{ side: 'right' }"
    />
    <ToolSelect
      v-model="editorStateStore.selectedTool"
      :items="quarterstitches"
      :disabled="disabled"
      :selection-color="selectionColor"
      :delay-duration="200"
      :tooltip-options="{ side: 'right' }"
    />
    <ToolSelect
      v-model="editorStateStore.selectedTool"
      :items="linestitches"
      :disabled="disabled"
      :selection-color="selectionColor"
      :delay-duration="200"
      :tooltip-options="{ side: 'right' }"
    />
    <ToolSelect
      v-model="editorStateStore.selectedTool"
      :items="nodestitches"
      :disabled="disabled"
      :selection-color="selectionColor"
      :delay-duration="200"
      :tooltip-options="{ side: 'right' }"
    />

    <Separator decorative />

    <ToolSelect
      v-model="editorStateStore.selectedTool"
      :items="cursor"
      :disabled="disabled"
      :delay-duration="200"
      :tooltip-options="{ side: 'right' }"
    />
  </div>
</template>

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

<script lang="ts" setup>
  import { computed } from "vue";

  import { tools } from "#pattern-editor/lib/tools/";
  import { useEditorStateStore, usePatternStore } from "#pattern-editor/stores/";
  import { useI18n } from "#shared/composables/";
  import { useSettingsStore } from "#shared/stores/";

  import { ToolSelect } from "../toolbar/";
  import type { ToolSelectItem } from "../toolbar/";

  const { fluent } = useI18n();

  const editorStateStore = useEditorStateStore();
  const patternStore = usePatternStore();
  const settingsStore = useSettingsStore();

  const { disabled } = defineProps<{
    disabled?: boolean;
  }>();

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
      icon: "i-stitches:full",
      kbds: ["f"],
    },
  ]);

  const petitestitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.PetiteStitch,
      label: fluent.$t("stitch-petite"),
      icon: "i-stitches:petite",
      kbds: ["p"],
    },
    {
      value: tools.PetiteStitchTL,
      label: fluent.$t("stitch-petite-tl"),
      icon: "i-stitches:petite-tl",
      kbds: ["p", "t", "l"],
    },
    {
      value: tools.PetiteStitchTR,
      label: fluent.$t("stitch-petite-tr"),
      icon: "i-stitches:petite-tr",
      kbds: ["p", "t", "r"],
    },
    {
      value: tools.PetiteStitchBR,
      label: fluent.$t("stitch-petite-br"),
      icon: "i-stitches:petite-br",
      kbds: ["p", "b", "r"],
    },
    {
      value: tools.PetiteStitchBL,
      label: fluent.$t("stitch-petite-bl"),
      icon: "i-stitches:petite-bl",
      kbds: ["p", "b", "l"],
    },
  ]);

  const halfstitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.HalfStitch,
      label: fluent.$t("stitch-half"),
      icon: "i-stitches:half",
      kbds: ["h"],
    },
    {
      value: tools.HalfStitchForward,
      label: fluent.$t("stitch-half-forward"),
      icon: "i-stitches:half-forward",
      kbds: ["h", "f"],
    },
    {
      value: tools.HalfStitchBackward,
      label: fluent.$t("stitch-half-backward"),
      icon: "i-stitches:half-backward",
      kbds: ["h", "b"],
    },
  ]);

  const quarterstitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.QuarterStitch,
      label: fluent.$t("stitch-quarter"),
      icon: "i-stitches:quarter",
      kbds: ["q"],
    },
    {
      value: tools.QuarterStitchTL,
      label: fluent.$t("stitch-quarter-tl"),
      icon: "i-stitches:quarter-tl",
      kbds: ["q", "t", "l"],
    },
    {
      value: tools.QuarterStitchTR,
      label: fluent.$t("stitch-quarter-tr"),
      icon: "i-stitches:quarter-tr",
      kbds: ["q", "t", "r"],
    },
    {
      icon: "i-stitches:quarter-br",
      label: fluent.$t("stitch-quarter-br"),
      value: tools.QuarterStitchBR,
      kbds: ["q", "b", "r"],
    },
    {
      value: tools.QuarterStitchBL,
      label: fluent.$t("stitch-quarter-bl"),
      icon: "i-stitches:quarter-bl",
      kbds: ["q", "b", "l"],
    },
  ]);

  const linestitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.BackStitch,
      label: fluent.$t("stitch-back"),
      icon: "i-stitches:back",
      kbds: ["s"],
    },
    {
      value: tools.StraightStitch,
      label: fluent.$t("stitch-straight"),
      icon: "i-stitches:straight",
      kbds: ["s", "s"],
    },
  ]);

  const nodestitches = computed<ToolSelectItem[]>(() => [
    {
      value: tools.FrenchKnot,
      label: fluent.$t("stitch-french-knot"),
      icon: "i-stitches:french-knot",
      kbds: ["k"],
    },
    {
      value: tools.Bead,
      label: fluent.$t("stitch-bead"),
      icon: "i-stitches:bead",
      kbds: ["b"],
    },
  ]);

  const cursor = computed<ToolSelectItem[]>(() => [
    {
      value: tools.Cursor,
      label: fluent.$t("palette-toolbar-cursor"),
      icon: "i-material-symbols:arrow-selector-tool",
      kbds: ["c"],
    },
  ]);
</script>

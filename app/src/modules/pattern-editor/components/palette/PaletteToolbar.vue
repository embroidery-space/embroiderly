<template>
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <ToolSelector
        v-model="editorStateStore.selectedTool"
        :options="fullstitches"
        :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
        :disabled="disabled"
      />
      <ToolSelector
        v-model="editorStateStore.selectedTool"
        :options="petitestitches"
        :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
        :disabled="disabled"
      />
      <ToolSelector
        v-model="editorStateStore.selectedTool"
        :options="halfstitches"
        :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
        :disabled="disabled"
      />
      <ToolSelector
        v-model="editorStateStore.selectedTool"
        :options="quarterstitches"
        :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
        :disabled="disabled"
      />
      <ToolSelector
        v-model="editorStateStore.selectedTool"
        :options="linestitches"
        :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
        :disabled="disabled"
      />
      <ToolSelector
        v-model="editorStateStore.selectedTool"
        :options="nodestitches"
        :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
        :disabled="disabled"
      />
    </div>

    <div class="flex gap-2">
      <ToolSelector v-model="editorStateStore.selectedTool" :options="cursor" :disabled="disabled" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from "vue";

  import { tools } from "~/pattern-editor/lib/tools/";
  import { useEditorStateStore } from "~/pattern-editor/stores/";
  import { useI18n } from "~/shared/composables/";
  import { useSettingsStore } from "~/shared/stores/";

  import { ToolSelector } from "../toolbar/";

  const { fluent } = useI18n();

  const editorStateStore = useEditorStateStore();
  const settingsStore = useSettingsStore();

  const { disabled } = defineProps<{
    disabled?: boolean;
  }>();

  const fullstitches = computed(() => [
    { icon: "i-stitches:full", label: fluent.$t("stitch-full"), value: tools.FullStitch },
  ]);

  const petitestitches = computed(() => [
    { icon: "i-stitches:petite", label: fluent.$t("stitch-petite"), value: tools.PetiteStitch },
    { icon: "i-stitches:petite-tl", label: fluent.$t("stitch-petite-tl"), value: tools.PetiteStitchTL },
    { icon: "i-stitches:petite-tr", label: fluent.$t("stitch-petite-tr"), value: tools.PetiteStitchTR },
    { icon: "i-stitches:petite-br", label: fluent.$t("stitch-petite-br"), value: tools.PetiteStitchBR },
    { icon: "i-stitches:petite-bl", label: fluent.$t("stitch-petite-bl"), value: tools.PetiteStitchBL },
  ]);

  const halfstitches = computed(() => [
    { icon: "i-stitches:half-forward", label: fluent.$t("stitch-half"), value: tools.HalfStitch },
    { icon: "i-stitches:half-forward", label: fluent.$t("stitch-half-forward"), value: tools.HalfStitchForward },
    { icon: "i-stitches:half-backward", label: fluent.$t("stitch-half-backward"), value: tools.HalfStitchBackward },
  ]);

  const quarterstitches = computed(() => [
    { icon: "i-stitches:quarter", label: fluent.$t("stitch-quarter"), value: tools.QuarterStitch },
    { icon: "i-stitches:quarter-tl", label: fluent.$t("stitch-quarter-tl"), value: tools.QuarterStitchTL },
    { icon: "i-stitches:quarter-tr", label: fluent.$t("stitch-quarter-tr"), value: tools.QuarterStitchTR },
    { icon: "i-stitches:quarter-br", label: fluent.$t("stitch-quarter-br"), value: tools.QuarterStitchBR },
    { icon: "i-stitches:quarter-bl", label: fluent.$t("stitch-quarter-bl"), value: tools.QuarterStitchBL },
  ]);

  const linestitches = computed(() => [
    { icon: "i-stitches:back", label: fluent.$t("stitch-back"), value: tools.BackStitch },
    { icon: "i-stitches:straight", label: fluent.$t("stitch-straight"), value: tools.StraightStitch },
  ]);

  const nodestitches = computed(() => [
    { icon: "i-stitches:french-knot", label: fluent.$t("stitch-french-knot"), value: tools.FrenchKnot },
    { icon: "i-stitches:bead", label: fluent.$t("stitch-bead"), value: tools.Bead },
  ]);

  const cursor = computed(() => [
    { icon: "i-material-symbols:arrow-selector-tool", label: fluent.$t("palette-toolbar-cursor"), value: tools.Cursor },
  ]);
</script>

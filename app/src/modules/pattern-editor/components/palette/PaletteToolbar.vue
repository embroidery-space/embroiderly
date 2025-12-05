<template>
  <div class="inline-grid grid-cols-[repeat(4,2rem)] gap-2">
    <ToolSelector
      v-model="editorStateStore.selectedTool"
      :options="fullstitches"
      :use-palitem-color="settingsStore.other.usePaletteItemColorForStitchTools"
      :disabled="disabled"
    />
    <ToolSelector
      v-model="editorStateStore.selectedTool"
      :options="partstitches"
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

    <ToolSelector v-model="editorStateStore.selectedTool" :options="cursor" :disabled="disabled" />
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
    { icon: "i-stitches:petite", label: fluent.$t("stitch-petite"), value: tools.PetiteStitch },
  ]);
  const partstitches = computed(() => [
    { icon: "i-stitches:half-forward", label: fluent.$t("stitch-half"), value: tools.HalfStitch },
    { icon: "i-stitches:quarter", label: fluent.$t("stitch-quarter"), value: tools.QuarterStitch },
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

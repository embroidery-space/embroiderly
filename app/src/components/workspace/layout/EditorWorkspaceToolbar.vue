<script lang="ts" setup>
import { Separator, ToolSelect, useRemToPx, useShortcuts } from "@embroiderly/ui";
import type { ToolSelectProps } from "@embroiderly/ui";

import { computed } from "vue";

import { useToolItems } from "~/composables/";
import { tools } from "~/lib/tools/";
import { useSettingsStore } from "~/settings/";
import { useEditorStateStore, usePatternStore } from "~/stores/";

export interface EditorWorkspaceToolbarProps {
  /** Whether the toolbar is disabled. */
  disabled?: boolean;
}

const { disabled } = defineProps<EditorWorkspaceToolbarProps>();

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();
const settingsStore = useSettingsStore();

const { remToPx } = useRemToPx();

const selectionColor = computed(() => {
  if (!settingsStore.other.usePaletteItemColorForStitchTools) return undefined;

  const palindex = editorStateStore.selectedPaletteItemIndex;
  if (patternStore.pattern.isNil || palindex === undefined) return undefined;

  return patternStore.pattern.palette.items[palindex]?.hex;
});

const toolSelectProps = computed<Partial<ToolSelectProps>>(() => ({
  disabled,
  selectionColor: selectionColor.value,
  delayDuration: 200,
  tooltipOptions: { side: "right" },
  dropdownOptions: { side: "right", align: "start", alignOffset: remToPx(-0.25) },
}));

const { fullstitches, petitestitches, halfstitches, quarterstitches, linestitches, nodestitches, eraser, cursor } =
  useToolItems();

// Define shorter key sequences for enabling top-left and bottom-left positional stitch tools if the user hasn't typed the full shortcut.
useShortcuts({
  "P-T": () => (editorStateStore.selectedTool = tools.PetiteStitchTL),
  "P-B": () => (editorStateStore.selectedTool = tools.PetiteStitchBL),

  "Q-T": () => (editorStateStore.selectedTool = tools.QuarterStitchTL),
  "Q-B": () => (editorStateStore.selectedTool = tools.QuarterStitchBL),
});
</script>

<template>
  <div :class="$style.root">
    <ToolSelect v-model="editorStateStore.selectedTool" v-bind="toolSelectProps" :items="fullstitches" />
    <ToolSelect v-model="editorStateStore.selectedTool" v-bind="toolSelectProps" :items="petitestitches" />
    <ToolSelect v-model="editorStateStore.selectedTool" v-bind="toolSelectProps" :items="halfstitches" />
    <ToolSelect v-model="editorStateStore.selectedTool" v-bind="toolSelectProps" :items="quarterstitches" />
    <ToolSelect v-model="editorStateStore.selectedTool" v-bind="toolSelectProps" :items="linestitches" />
    <ToolSelect v-model="editorStateStore.selectedTool" v-bind="toolSelectProps" :items="nodestitches" />

    <Separator decorative />

    <ToolSelect
      v-model="editorStateStore.selectedTool"
      v-bind="toolSelectProps"
      :items="eraser"
      :selection-color="undefined"
    />
    <ToolSelect
      v-model="editorStateStore.selectedTool"
      v-bind="toolSelectProps"
      :items="cursor"
      :selection-color="undefined"
    />
  </div>
</template>

<style module>
.root {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 1);

  height: 100%;
}
</style>

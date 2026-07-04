<script lang="ts" setup>
import { BlockUI, Splitter, SplitterPanel, useToast } from "@embroiderly/ui";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { useDropZone } from "@vueuse/core";
import { round } from "es-toolkit";
import { onMounted, useTemplateRef, watch } from "vue";

import { useI18n, useEditor } from "~/composables/";
import { useAppStartup, useCloseGuard } from "~/composables/core/";
import { usePercentOfContainer } from "~/composables/utils/";
import { useSettingsStore } from "~/settings/";
import { PaletteMode, useEditorStateStore, usePatternFileStore, usePatternStore } from "~/stores/";

import { WorkspaceCanvasPanel, WorkspacePalettePanel, PatternWorkspace, WelcomeScreen } from "./workspace/";
import { EditorWorkspaceToolbar, EditorWorkspaceFooter } from "./workspace/layout/";

const toast = useToast();
const { fluent } = useI18n();
const { editor, events } = useEditor();

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
const settingsStore = useSettingsStore();

const { isOverDropZone } = useDropZone(useTemplateRef("drop-zone"), {
  multiple: true,
  async onDrop(files) {
    if (!files) return;

    let lastPatternId: string | undefined;
    for (const file of files) {
      const patternId = await patternFileStore.openPattern({ file });
      if (patternId) lastPatternId = patternId;
    }

    if (lastPatternId) patternFileStore.switchPattern(lastPatternId);
  },
});

const { toPercent } = usePercentOfContainer(useTemplateRef("splitter"));

const palettePanelDefaultSize = toPercent(12, "rem");
const palettePanelCollapsedSize = toPercent(2.25, "rem");

const canvasToolbarDefaultSize = toPercent(12, "rem");
const canvasToolbarCollapsedSize = toPercent(2.25, "rem");

useAppStartup();
useCloseGuard();

watch(
  () => patternFileStore.currentPatternId,
  async (patternId) => {
    const pattern = patternId ? await patternFileStore.loadPattern(patternId) : undefined;
    patternStore.setPattern(pattern);

    editorStateStore.$reset();

    document.title = pattern ? `${pattern.info.title} | Embroiderly` : "Embroiderly";
    if (__TAURI__) await getCurrentWebviewWindow().setTitle(document.title);
  },
  { immediate: true },
);

watch(
  () => settingsStore.autoSaveIntervalInMillis,
  (ms) => editor.setAutoSaveInterval(ms),
  { immediate: true },
);

events.on("app:pattern-saved", (patternId) => {
  if (patternId === patternStore.pattern.id) {
    toast.add({ type: "background", color: "success", title: fluent.$t("pattern-save-success"), duration: 3000 });
  }
});

onMounted(async () => {
  // In production, the app window is hidden by default to prevent the blank screen appearance.
  if (__TAURI__) await getCurrentWebviewWindow().show();
});
</script>

<template>
  <main class="overflow-hidden">
    <Splitter ref="splitter" direction="horizontal" class="size-full">
      <WorkspacePalettePanel
        :aria-label="$t('palette-panel')"
        collapsible
        :collapsed-size="palettePanelCollapsedSize"
        :min-size="palettePanelDefaultSize"
        :default-size="editorStateStore.palettePanelSize ?? palettePanelDefaultSize"
        @collapse="editorStateStore.palettePanelCollapsed = true"
        @expand="editorStateStore.palettePanelCollapsed = false"
        @resize="editorStateStore.palettePanelSize = round($event, 2)"
      />

      <SplitterPanel class="grid min-h-0 min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto]">
        <EditorWorkspaceToolbar
          :disabled="patternStore.pattern.isNil"
          class="border-r border-default p-1"
          data-tour="toolbar"
        />

        <BlockUI ref="drop-zone" :blocked="editorStateStore.paletteMode === PaletteMode.Editing || isOverDropZone">
          <WelcomeScreen v-if="patternStore.pattern.isNil" class="size-full" />
          <PatternWorkspace v-else v-bind="settingsStore.canvas" data-tour="canvas" class="size-full" />
        </BlockUI>

        <EditorWorkspaceFooter :disabled="patternStore.pattern.isNil" class="col-span-2" />
      </SplitterPanel>

      <WorkspaceCanvasPanel
        :aria-label="$t('canvas-panel')"
        data-tour="canvas-panel"
        collapsible
        :collapsed-size="canvasToolbarCollapsedSize"
        :min-size="canvasToolbarDefaultSize"
        :default-size="editorStateStore.canvasPanelSize ?? canvasToolbarDefaultSize"
        @collapse="editorStateStore.canvasPanelCollapsed = true"
        @expand="editorStateStore.canvasPanelCollapsed = false"
        @resize="editorStateStore.canvasPanelSize = round($event, 2)"
      />
    </Splitter>
  </main>
</template>

<script lang="ts" setup>
import { useShortcuts } from "@embroiderly/shortcuts";
import { BlockUI, Splitter, SplitterPanel, useConfirm, useToast } from "@embroiderly/ui";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { onMounted, toRaw, useTemplateRef, watch } from "vue";

import { StartupApi } from "~/api/";
import { useDragDrop, useI18n, useTauriListener } from "~/composables/";
import { usePercentOfContainer } from "~/composables/utils/";
import { PaletteMode, useEditorStateStore, usePatternFileStore, usePatternStore, useSettingsStore } from "~/stores/";

import { WorkspaceCanvasPanel, WorkspacePalettePanel, PatternWorkspace, WelcomeScreen } from "./workspace/";

const appWindow = getCurrentWebviewWindow();

const confirm = useConfirm();
const toast = useToast();
const { fluent } = useI18n();

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
const settingsStore = useSettingsStore();

const { toPercent } = usePercentOfContainer(useTemplateRef("splitter"));

const palettePanelDefaultSize = toPercent(15.5, "rem");
const palettePanelCollapsedSize = toPercent(2.75, "rem");

const canvasToolbarDefaultSize = toPercent(12, "rem");
const canvasToolbarCollapsedSize = toPercent(2.25, "rem");

const dropZoneContainer = useTemplateRef("drop-zone");
const { isOverDropZone } = useDragDrop(dropZoneContainer, async (paths) => {
  for (const [index, path] of paths.entries()) {
    const patternId = await patternFileStore.openPattern(path);
    if (index === paths.length - 1 && patternId) {
      patternFileStore.switchPattern(patternId);
    }
  }
});

watch(
  () => patternFileStore.currentPatternId,
  async (patternId) => {
    if (patternId) patternStore.pattern = await patternFileStore.loadPattern(patternId);
    else patternStore.pattern = undefined;
    editorStateStore.$reset();
  },
  { immediate: true },
);

useTauriListener(
  appWindow.onCloseRequested(async (event) => {
    const unsavedPatterns = await patternFileStore.getUnsavedPatterns();
    for (const pattern of structuredClone(toRaw(patternFileStore.openedPatterns.map((op) => toRaw(op))))) {
      const hasUnsavedChanges = unsavedPatterns.some((p) => p.id === pattern.id);
      if (hasUnsavedChanges) {
        const accepted = await confirm.open(fluent.$ta("unsaved-changes", { pattern: pattern.title })).result;
        if (accepted === undefined) {
          event.preventDefault();
          return;
        } else if (accepted) {
          const saved = await patternFileStore.savePattern(pattern.id);
          if (!saved) {
            event.preventDefault();
            return;
          }
        } else {
          // The user doesn't want to save the pattern. Continue.
        }
      }
      await patternFileStore.closePattern(pattern.id, { force: true });
    }
  }),
);

useTauriListener(
  appWindow.listen<string>("app:pattern-saved", ({ payload: patternId }) => {
    if (patternId === patternStore.pattern?.id) {
      toast.add({ type: "background", color: "success", title: fluent.$t("pattern-save-success"), duration: 3000 });
    }
  }),
);

useShortcuts({
  "Ctrl+Z": () => patternStore.undo(),
  "Ctrl+Shift+Z": () => patternStore.undo({ single: true }),
  "Ctrl+Y": () => patternStore.redo(),
  "Ctrl+Shift+Y": () => patternStore.redo({ single: true }),
});

onMounted(async () => {
  await patternFileStore.fetchOpenedPatterns();
  if (!patternFileStore.currentPatternId && patternFileStore.openedPatterns.length) {
    patternFileStore.switchPattern(patternFileStore.openedPatterns[0]!.id);
  }

  const notifications = await StartupApi.getStartupNotifications();
  for (const notification of notifications) {
    let message: string;
    if ("fileAssociationFailed" in notification) {
      message = fluent.$t("startup-file-association-failure", { filePath: notification.fileAssociationFailed });
    } else if ("templateFailed" in notification) {
      message = fluent.$t("startup-template-failure", { filePath: notification.templateFailed });
    } else {
      throw new Error(`Unknown notification: ${JSON.stringify(notification)}`);
    }

    toast.add({
      type: "foreground",
      color: "error",
      title: fluent.$t("error"),
      description: message,
    });
  }

  await appWindow.show();
});
</script>

<template>
  <main class="flex overflow-y-auto">
    <Splitter ref="splitter" direction="horizontal">
      <WorkspacePalettePanel
        collapsible
        :collapsed-size="palettePanelCollapsedSize"
        :min-size="palettePanelDefaultSize"
        :default-size="editorStateStore.palettePanelSize ?? palettePanelDefaultSize"
      />

      <SplitterPanel>
        <BlockUI
          ref="drop-zone"
          :blocked="editorStateStore.paletteMode === PaletteMode.Editing || isOverDropZone"
          class="size-full"
        >
          <WelcomeScreen v-if="!patternStore.pattern" class="size-full" />
          <PatternWorkspace
            :options="{
              render: {
                antialias: settingsStore.viewport.antialias,
              },
              viewport: {
                wheelAction: settingsStore.viewport.wheelAction,
              },
            }"
            class="size-full"
          />
        </BlockUI>
      </SplitterPanel>

      <WorkspaceCanvasPanel
        collapsible
        :collapsed-size="canvasToolbarCollapsedSize"
        :min-size="canvasToolbarDefaultSize"
        :default-size="editorStateStore.canvasPanelSize ?? canvasToolbarDefaultSize"
      />
    </Splitter>
  </main>
</template>

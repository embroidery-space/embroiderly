<script lang="ts" setup>
import { BlockUI, Splitter, SplitterPanel, useConfirm, useToast } from "@embroiderly/ui";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { useSessionStorage } from "@vueuse/core";
import { onMounted, toRaw, useTemplateRef, watch } from "vue";

import { useI18n, useTauriListener, useShortcuts } from "~/composables/";
import { usePercentOfContainer } from "~/composables/utils/";
import { Fabric } from "~/lib/pattern";
import { LoggerService } from "~/services";
import {
  PaletteMode,
  StartupAction,
  useEditorStateStore,
  usePatternFileStore,
  usePatternStore,
  useSettingsStore,
} from "~/stores/";

import { WorkspaceCanvasPanel, WorkspacePalettePanel, PatternWorkspace, WelcomeScreen } from "./workspace/";
import { EditorWorkspaceTabs, EditorWorkspaceToolbar, EditorWorkspaceFooter } from "./workspace/layout/";

const appWindow = getCurrentWebviewWindow();

const confirm = useConfirm();
const toast = useToast();
const { fluent } = useI18n();

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
const settingsStore = useSettingsStore();

const startupHandled = useSessionStorage("embroiderly-startup-handled", false);

const { toPercent } = usePercentOfContainer(useTemplateRef("splitter"));

const palettePanelDefaultSize = toPercent(15.5, "rem");
const palettePanelCollapsedSize = toPercent(2.75, "rem");

const canvasToolbarDefaultSize = toPercent(12, "rem");
const canvasToolbarCollapsedSize = toPercent(2.25, "rem");

watch(
  () => patternFileStore.currentPatternId,
  async (patternId) => {
    patternStore.setPattern(patternId ? await patternFileStore.loadPattern(patternId) : undefined);
    editorStateStore.$reset();
  },
  { immediate: true },
);

useTauriListener(
  appWindow.onCloseRequested(async (event) => {
    for (const pattern of structuredClone(toRaw(patternFileStore.openedPatterns.map((op) => toRaw(op))))) {
      const hasUnsavedChanges = pattern.dirty;
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
    if (patternId === patternStore.pattern.id) {
      toast.add({ type: "background", color: "success", title: fluent.$t("pattern-save-success"), duration: 3000 });
    }
  }),
);

useShortcuts({
  "Control+Z": () => patternStore.undo(),
  "Control+Shift+Z": () => patternStore.undo({ single: true }),
  "Control+Y": () => patternStore.redo(),
  "Control+Shift+Y": () => patternStore.redo({ single: true }),
});

async function handleFileAssociations(files: string[]) {
  for (const filePath of files) {
    try {
      const patternId = await patternFileStore.openPatternFromPath(filePath);
      if (patternId) patternFileStore.switchPattern(patternId);
    } catch (error) {
      LoggerService.error(`Failed to open pattern from path (${filePath}): ${error}`);
      toast.add({
        type: "foreground",
        color: "error",
        title: fluent.$t("error"),
        description: fluent.$t("startup-file-association-failure", {
          filePath: filePath.replaceAll("\\", "/").split("/").pop() ?? filePath,
        }),
      });
    }
  }
}

async function handleOpenOnStartup() {
  switch (settingsStore.startup.action) {
    case StartupAction.NewPattern: {
      const id = await patternFileStore.createPattern(new Fabric());
      patternFileStore.switchPattern(id);
      break;
    }
    case StartupAction.CustomTemplate: {
      if (settingsStore.startup.patternTemplate) {
        try {
          const id = await patternFileStore.openPatternFromTemplate(settingsStore.startup.patternTemplate);
          patternFileStore.switchPattern(id);
        } catch (error) {
          LoggerService.error(`Failed to open pattern from template: ${error}`);
          toast.add({
            type: "foreground",
            color: "error",
            title: fluent.$t("error"),
            description: fluent.$t("startup-template-failure", {
              filePath: settingsStore.startup.patternTemplate,
            }),
          });
        }
      }
      break;
    }
  }
}

onMounted(async () => {
  if (!startupHandled.value) {
    startupHandled.value = true;

    const openedFiles = window.openedFiles ?? [];
    if (__TAURI__) await handleFileAssociations(openedFiles);

    if (openedFiles.length === 0 && !patternFileStore.openedPatterns.length) {
      await handleOpenOnStartup();
    }
  }

  if (!patternFileStore.currentPatternId && patternFileStore.openedPatterns.length) {
    patternFileStore.switchPattern(patternFileStore.openedPatterns[0]!.id);
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

      <SplitterPanel class="flex flex-col">
        <EditorWorkspaceTabs :disabled="patternStore.pattern.isNil" class="border-b border-default" />

        <div class="flex grow">
          <EditorWorkspaceToolbar :disabled="patternStore.pattern.isNil" class="border-r border-default p-1" />

          <BlockUI ref="drop-zone" :blocked="editorStateStore.paletteMode === PaletteMode.Editing" class="grow">
            <WelcomeScreen v-if="patternStore.pattern.isNil" class="size-full" />
            <PatternWorkspace
              v-else
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
        </div>

        <EditorWorkspaceFooter :disabled="patternStore.pattern.isNil" />
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

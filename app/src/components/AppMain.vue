<script lang="ts" setup>
import { BlockUI, Splitter, SplitterPanel, useConfirm, useToast } from "@embroiderly/ui";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { useDropZone, useEventListener, useSessionStorage } from "@vueuse/core";
import { onMounted, toRaw, useTemplateRef, watch } from "vue";

import { useI18n, useShortcuts, useEditor, useTauriListener } from "~/composables/";
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

const confirm = useConfirm();
const toast = useToast();
const { fluent } = useI18n();
const { events } = useEditor();

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
const settingsStore = useSettingsStore();

const startupHandled = useSessionStorage("embroiderly-startup-handled", false);

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
);

if (__TAURI__) {
  useTauriListener(
    getCurrentWebviewWindow().onCloseRequested(async (event) => {
      const patterns = structuredClone(toRaw(patternFileStore.openedPatterns).map((op) => toRaw(op)));
      for (const pattern of patterns) {
        if (pattern.dirty) {
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
          }
        }
        await patternFileStore.closePattern(pattern.id, { force: true });
      }
    }),
  );
} else {
  // In browsers, we can't handle pattern closing/saving during this hook.
  // This is the user's responsibility to handle the patterns.
  useEventListener(window, "beforeunload", (event: BeforeUnloadEvent) => {
    if (patternFileStore.openedPatterns.some((p) => p.dirty)) {
      event.preventDefault();
    }
  });
}

events.on("app:pattern-checkpoint", (patternId) => {
  if (patternId === patternStore.pattern.id) {
    toast.add({ type: "background", color: "success", title: fluent.$t("pattern-save-success"), duration: 3000 });
  }
});

useShortcuts({
  "Control+Z": () => patternStore.undo(),
  "Control+Shift+Z": () => patternStore.undo({ single: true }),
  "Control+Y": () => patternStore.redo(),
  "Control+Shift+Y": () => patternStore.redo({ single: true }),
});

async function handleFileAssociations(files: string[]) {
  for (const filePath of files) {
    try {
      const patternId = await patternFileStore.openPattern({ filePath });
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
          const id = await patternFileStore.openPattern({ template: settingsStore.startup.patternTemplate });
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
  await patternFileStore.restoreSession();

  if (!startupHandled.value) {
    startupHandled.value = true;

    const openedFiles = window.openedFiles ?? [];
    if (__TAURI__) await handleFileAssociations(openedFiles);

    if (openedFiles.length === 0 && !patternFileStore.openedPatterns.length) {
      await handleOpenOnStartup();
    }
  }

  if (patternFileStore.currentPatternId) {
    const pattern = await patternFileStore.loadPattern(patternFileStore.currentPatternId);
    patternStore.setPattern(pattern);
  } else if (patternFileStore.openedPatterns.length) {
    patternFileStore.switchPattern(patternFileStore.openedPatterns[0]!.id);
  }

  if (__TAURI__) await getCurrentWebviewWindow().show();
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

          <BlockUI
            ref="drop-zone"
            :blocked="editorStateStore.paletteMode === PaletteMode.Editing || isOverDropZone"
            class="grow"
          >
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

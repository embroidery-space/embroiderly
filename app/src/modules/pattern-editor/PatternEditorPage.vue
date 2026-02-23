<script lang="ts" setup>
import { useShortcuts } from "@embroiderly/shortcuts";
import { BlockUI, Splitter, SplitterPanel, useConfirm, useToast } from "@embroiderly/ui";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { onMounted, toRaw, useTemplateRef, watch } from "vue";
import { useRouter } from "vue-router";

import { StartupApi } from "#shared/api/";
import { useDragDrop, useI18n, useTauriListener } from "#shared/composables/";
import { useSettingsStore } from "#shared/stores/";

import { PageHeader } from "./components/";
import { CanvasToolbar } from "./components/canvas/";
import { PalettePanel, PatternWorkspace, WelcomeScreen } from "./components/workspace/";
import { PaletteMode, useEditorStateStore, usePatternFileStore, usePatternStore } from "./stores/";

const props = defineProps<{ patternId?: string }>();

const appWindow = getCurrentWebviewWindow();

const router = useRouter();

const confirm = useConfirm();
const toast = useToast();
const { fluent } = useI18n();

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
const settingsStore = useSettingsStore();

const dropZoneContainer = useTemplateRef("drop-zone");
const { isOverDropZone } = useDragDrop(dropZoneContainer, async (paths) => {
  for (const [index, path] of paths.entries()) {
    const patternId = await patternFileStore.openPattern(path);
    if (index === paths.length - 1) {
      router.push({ name: "pattern-editor", params: { patternId } });
    }
  }
});

watch(
  () => props.patternId,
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
    for (const pattern of structuredClone(toRaw(patternFileStore.openedPatterns))) {
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
  "Ctrl+Shift+Z": () => patternStore.undo({ single: true }),
  "Ctrl+Shift+Y": () => patternStore.redo({ single: true }),
});

onMounted(async () => {
  await patternFileStore.fetchOpenedPatterns();
  if (!props.patternId && patternFileStore.openedPatterns.length) {
    const pattern = patternFileStore.openedPatterns[0]!;
    router.push({ name: "pattern-editor", params: { patternId: pattern.id } });
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
  <div class="flex h-full flex-col">
    <PageHeader />
    <div class="flex grow overflow-y-auto">
      <Splitter direction="horizontal">
        <SplitterPanel :default-size="15" :style="{ overflow: 'visible clip' }">
          <PalettePanel />
        </SplitterPanel>
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
            />
          </BlockUI>
        </SplitterPanel>
      </Splitter>
      <CanvasToolbar class="h-full border-l border-default" />
    </div>
  </div>
</template>

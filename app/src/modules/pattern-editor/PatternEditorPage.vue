<template>
  <div class="flex h-full flex-col">
    <PageHeader />
    <div class="flex grow overflow-y-auto">
      <RSplitterGroup direction="horizontal">
        <RSplitterPanel :default-size="15" :style="{ overflow: 'visible clip' }">
          <PalettePanel />
        </RSplitterPanel>
        <RSplitterResizeHandle class="border-2 border-default" />
        <RSplitterPanel>
          <BlockUI :blocked="editorStateStore.paletteMode === PaletteMode.Editing" class="size-full">
            <DropZone class="size-full" @drop="handleFilesDrop">
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
            </DropZone>
          </BlockUI>
        </RSplitterPanel>
      </RSplitterGroup>
      <CanvasToolbar class="h-full border-l border-default" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

  import { onMounted, watch } from "vue";
  import { useRouter } from "vue-router";

  import { useShortcuts } from "#plugins/shortcuts/";
  import { BlockUI, DropZone } from "#shared/components/";
  import { useConfirm, useI18n, useTauriListener } from "#shared/composables/";
  import { useSettingsStore } from "#shared/stores/";

  import { PageHeader } from "./components/";
  import { CanvasToolbar } from "./components/canvas/";
  import { PalettePanel, PatternWorkspace, WelcomeScreen } from "./components/workspace/";
  import { PaletteMode, useEditorStateStore, usePatternFileStore, usePatternStore } from "./stores/";

  const appWindow = getCurrentWebviewWindow();

  const props = defineProps<{ patternId?: string }>();

  const router = useRouter();

  const confirm = useConfirm();
  const toast = useToast();
  const { fluent } = useI18n();

  const editorStateStore = useEditorStateStore();
  const patternStore = usePatternStore();
  const patternFileStore = usePatternFileStore();
  const settingsStore = useSettingsStore();

  watch(
    () => props.patternId,
    async (patternId) => {
      if (patternId) patternStore.pattern = await patternFileStore.loadPattern(patternId);
      else patternStore.pattern = undefined;
    },
    { immediate: true },
  );

  async function handleFilesDrop(paths: string[]) {
    for (const [index, path] of paths.entries()) {
      const patternId = await patternFileStore.openPattern(path);
      if (index === paths.length - 1) {
        router.push({ name: "pattern-editor", params: { patternId } });
      }
    }
  }

  useTauriListener(
    appWindow.onCloseRequested(async (event) => {
      const unsavedPatterns = await patternFileStore.getUnsavedPatterns();
      if (unsavedPatterns.length) {
        const patterns = unsavedPatterns.map(({ title }) => `- ${title}`).join("\n");
        const savePatterns = await confirm.open(fluent.$ta("unsaved-patterns", { patterns })).result;

        // If the user dismissed the dialog, prevent the window from closing.
        if (savePatterns === undefined) return event.preventDefault();

        if (savePatterns) await patternFileStore.saveAllPatterns();
        await patternFileStore.closeAllPatterns();
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
    ctrl_shift_z: () => patternStore.undo({ single: true }),
    ctrl_shift_y: () => patternStore.redo({ single: true }),
  });

  onMounted(async () => {
    await patternFileStore.fetchOpenedPatterns();
    await appWindow.show();
  });
</script>

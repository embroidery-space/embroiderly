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
          <BlockUI :blocked="patternsStore.loading || patternsStore.blocked" class="size-full">
            <DropZone class="size-full" @drop="handleFilesDrop">
              <WelcomePanel v-if="!patternsStore.pattern" class="size-full" />
              <CanvasPanel ref="pattern-canvas" />
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

  import { onMounted, useTemplateRef } from "vue";

  import { FilesApi } from "~/api/index.ts";
  import { BlockUI, DropZone } from "~/shared/components/";

  import { PageHeader } from "./components/";

  const appWindow = getCurrentWebviewWindow();

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const patternCanvas = useTemplateRef("pattern-canvas");

  async function handleFilesDrop(paths: string[]) {
    for (const [index, path] of paths.entries()) {
      // Assign only the last opened pattern to not abuse the `PatternCanvas`.
      const assignToCurrent = paths.length - 1 === index;
      await patternsStore.openPattern(path, { assignToCurrent });
    }
  }

  defineShortcuts({
    ctrl_shift_z: () => patternsStore.undo({ single: true }),
    ctrl_shift_y: () => patternsStore.redo({ single: true }),
  });

  onMounted(async () => {
    // 1. Initialize the pattern canvas.
    await patternCanvas.value!.initPatternApplication({
      render: {
        antialias: settingsStore.viewport.antialias,
      },
      viewport: {
        wheelAction: settingsStore.viewport.wheelAction,
      },
    });

    // 2. Initially load opened patterns.
    if (!appStateStore.openedPatterns.length) {
      // If there are no opened patterns, it means the app was just started.
      // So we should load those patterns that were opened via file associations.
      const openedPatterns = await FilesApi.getOpenedPatterns();
      for (const [id, title] of openedPatterns) appStateStore.addOpenedPattern(id, title);
    }

    // 3. Load the current pattern if it exists.
    const currentPattern = appStateStore.currentPattern;
    if (currentPattern) await patternsStore.loadPattern(currentPattern.id);

    // 4. Make the app window visible (it is invisible by default).
    await appWindow.show();
  });
</script>

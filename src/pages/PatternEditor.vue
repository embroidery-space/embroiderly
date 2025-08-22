<template>
  <div class="h-full flex flex-col">
    <AppHeader />
    <div class="flex grow overflow-y-auto">
      <RSplitterGroup direction="horizontal">
        <RSplitterPanel :default-size="15" :style="{ overflow: 'visible clip' }">
          <PalettePanel />
        </RSplitterPanel>
        <RSplitterResizeHandle class="border-2 border-default" />
        <RSplitterPanel class="relative">
          <BlockUI :blocked="patternsStore.loading || patternsStore.blocked || isDragging" class="size-full">
            <div
              v-if="isDragging"
              class="bg-default absolute left-1/2 top-1/2 z-10 flex items-center justify-center rounded-full p-6 -translate-x-1/2 -translate-y-1/2"
            >
              <UIcon name="i-lucide:upload" class="size-16" />
            </div>

            <!--
              The `CanvasPanel` is always visible but hidden when there is no pattern opened.
              Since both `WelcomePanel` and `CanvasPanel` are full-size components,
              the `CanvasPanel` will be off the screen when the `WelcomePanel` is visible.
            -->
            <WelcomePanel v-if="!patternsStore.pattern" class="size-full" />
            <CanvasPanel ref="pattern-canvas" />
          </BlockUI>
        </RSplitterPanel>
      </RSplitterGroup>
      <CanvasToolbar class="h-full border-l border-default" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PatternApi } from "#/api/index.ts";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { onMounted, ref, useTemplateRef } from "vue";

  const appWindow = getCurrentWebviewWindow();

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const patternCanvas = useTemplateRef("pattern-canvas");

  const isDragging = ref(false);
  appWindow.onDragDropEvent(async ({ payload }) => {
    switch (payload.type) {
      case "over": {
        isDragging.value = true;
        break;
      }

      case "drop": {
        isDragging.value = false;
        const paths: [number, string][] = payload.paths.map((path, index) => [index, path]);
        for (const [index, path] of paths) {
          // Assign only the last opened pattern to not abuse the `PatternCanvas`.
          const assignToCurrent = paths.length - 1 === index;
          await patternsStore.openPattern(path, { assignToCurrent });
        }
        break;
      }

      default: {
        isDragging.value = false;
        break;
      }
    }
  });

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
      const openedPatterns = await PatternApi.getOpenedPatterns();
      for (const [id, title] of openedPatterns) appStateStore.addOpenedPattern(id, title);
    }

    // 3. Load the current pattern if it exists.
    const currentPattern = appStateStore.currentPattern;
    if (currentPattern) await patternsStore.loadPattern(currentPattern.id);

    // 4. Make the app window visible (it is invisible by default).
    await appWindow.show();
  });
</script>

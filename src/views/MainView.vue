<template>
  <div class="h-full flex flex-col">
    <AppHeader />
    <div class="flex grow overflow-y-auto">
      <USplitterGroup direction="horizontal">
        <USplitterPanel :default-size="15" :style="{ overflow: 'visible clip' }">
          <PalettePanel />
        </USplitterPanel>
        <USplitterResizeHandle class="border-2 border-default" />
        <USplitterPanel class="relative">
          <BlockUI :blocked="patternsStore.loading || patternsStore.blocked || isDragging" class="size-full">
            <div
              v-if="isDragging"
              class="bg-default absolute left-1/2 top-1/2 z-10 flex items-center justify-center rounded-full p-6 -translate-x-1/2 -translate-y-1/2"
            >
              <UIcon name="i-prime:upload" class="size-16" />
            </div>
            <Suspense v-if="patternsStore.pattern"><CanvasPanel /></Suspense>
            <WelcomePanel v-else class="size-full" />
          </BlockUI>
        </USplitterPanel>
      </USplitterGroup>
      <CanvasToolbar class="h-full border-l border-default" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { ref } from "vue";
  import { usePatternsStore } from "#/stores/";

  const patternsStore = usePatternsStore();

  const appWindow = getCurrentWebviewWindow();

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
</script>

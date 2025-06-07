<template>
  <div class="h-full flex flex-col">
    <AppHeader />
    <div class="flex grow overflow-y-auto">
      <Splitter class="size-full border-0 rounded-none" pt:gutter:class="z-auto">
        <SplitterPanel :size="15" class="overflow-x-visible overflow-y-clip">
          <PalettePanel />
        </SplitterPanel>

        <SplitterPanel :size="85">
          <BlockUI
            :blocked="patternsStore.loading || patternsStore.blocked || isDragging"
            :auto-z-index="false"
            pt:mask:class="z-0"
            class="size-full"
          >
            <ProgressSpinner
              v-if="patternsStore.loading"
              class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            />
            <div
              v-if="isDragging"
              class="bg-content absolute left-1/2 top-1/2 z-10 flex items-center justify-center rounded-full p-6 -translate-x-1/2 -translate-y-1/2"
            >
              <i class="i-prime:upload size-16"></i>
            </div>
            <Suspense v-if="patternsStore.pattern"><CanvasPanel /></Suspense>
            <WelcomePanel v-else class="size-full" />
          </BlockUI>
        </SplitterPanel>
      </Splitter>

      <CanvasToolbar class="border-content h-full border-l" />
    </div>
  </div>
  <DynamicDialog />
  <ConfirmDialog />
  <Toast position="bottom-right" />
</template>

<script lang="ts" setup>
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { defineAsyncComponent, onMounted, ref } from "vue";
  import { useSessionStorage } from "@vueuse/core";
  import {
    ConfirmDialog,
    Splitter,
    SplitterPanel,
    DynamicDialog,
    BlockUI,
    ProgressSpinner,
    Toast,
    useToast,
    useConfirm,
  } from "primevue";
  import { useFluent } from "fluent-vue";
  import { PatternApi } from "./api/";
  import { useAppStateStore, usePatternsStore, useSettingsStore } from "./stores/";

  const AppHeader = defineAsyncComponent(() => import("./components/AppHeader.vue"));
  const WelcomePanel = defineAsyncComponent(() => import("./components/WelcomePanel.vue"));
  const PalettePanel = defineAsyncComponent(() => import("./components/PalettePanel.vue"));
  const CanvasPanel = defineAsyncComponent(() => import("./components/CanvasPanel.vue"));
  const CanvasToolbar = defineAsyncComponent(() => import("./components/toolbar/CanvasToolbar.vue"));

  const confirm = useConfirm();
  const toast = useToast();

  const fluent = useFluent();

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();
  const settingsStore = useSettingsStore();

  const appWindow = getCurrentWebviewWindow();

  appWindow.listen<string>("app:pattern-saved", ({ payload: patternId }) => {
    if (patternId === patternsStore.pattern?.id) {
      toast.add({ severity: "success", detail: fluent.$t("message-pattern-saved"), life: 3000 });
    }
  });

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

  appWindow.onCloseRequested(async (e) => {
    const unsavedPatterns = await PatternApi.getUnsavedPatterns();
    if (unsavedPatterns.length) {
      e.preventDefault();
      const patterns = appStateStore.openedPatterns
        .filter(({ id }) => unsavedPatterns.includes(id))
        .map(({ title }) => `- ${title}`)
        .join("\n");
      confirm.require({
        header: fluent.$t("title-unsaved-changes"),
        message: fluent.$t("message-unsaved-patterns", { patterns }),
        accept: async () => {
          await PatternApi.saveAllPatterns();
          await PatternApi.closeAllPatterns();
          await appWindow.destroy();
        },
        reject: async () => {
          await PatternApi.closeAllPatterns();
          await appWindow.destroy();
        },
      });
    }
  });

  const openedFilesProcessed = useSessionStorage("openedFilesProcessed", false);
  async function processOpenedFiles() {
    // @ts-expect-error This property is injected on the Rust side when handling file associations.
    const openedFiles: string[] = window.openedFiles;

    // Process opened files only if we haven't processed them yet.
    if (openedFiles.length && !openedFilesProcessed.value) {
      for (const file of openedFiles) await patternsStore.openPattern(file);
      openedFilesProcessed.value = true;
    } else {
      const currentPattern = appStateStore.currentPattern;
      if (currentPattern) await patternsStore.loadPattern(currentPattern.id);
    }
  }

  async function checkForUpdates() {
    await settingsStore.$tauri.start();
    if (settingsStore.updater.autoCheck) {
      await settingsStore.checkForUpdates({ auto: true });
    }
  }

  onMounted(async () => {
    await Promise.all([processOpenedFiles(), checkForUpdates()]);
  });

  window.onunhandledrejection = (event) => {
    const err = event.reason;
    if (err instanceof Error) {
      error(`Error: ${err.message}`);
      toast.add({ severity: "error", summary: fluent.$t("title-error"), detail: err.message });
    } else error(`Error: ${err}`);
  };
</script>

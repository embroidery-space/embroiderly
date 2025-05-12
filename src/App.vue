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
            :blocked="patternsStore.loading || patternsStore.blocked"
            :auto-z-index="false"
            pt:mask:class="z-0"
            class="size-full"
          >
            <ProgressSpinner
              v-if="patternsStore.loading"
              class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            />
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
</template>

<script lang="ts" setup>
  import { defineAsyncComponent, onMounted } from "vue";
  import { ConfirmDialog, Splitter, SplitterPanel, DynamicDialog, BlockUI, ProgressSpinner } from "primevue";
  import { useAppStateStore } from "./stores/state";
  import { usePatternsStore } from "./stores/patterns";

  const AppHeader = defineAsyncComponent(() => import("./components/AppHeader.vue"));
  const WelcomePanel = defineAsyncComponent(() => import("./components/WelcomePanel.vue"));
  const PalettePanel = defineAsyncComponent(() => import("./components/PalettePanel.vue"));
  const CanvasPanel = defineAsyncComponent(() => import("./components/CanvasPanel.vue"));
  const CanvasToolbar = defineAsyncComponent(() => import("./components/toolbar/CanvasToolbar.vue"));

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();

  onMounted(async () => {
    const currentPattern = appStateStore.currentPattern;
    if (currentPattern) await patternsStore.openPattern(currentPattern.key);
  });
</script>

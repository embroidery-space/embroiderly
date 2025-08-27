<template>
  <div class="flex items-center justify-center">
    <button
      :title="$t('label-minimize')"
      class="inline-flex size-10 items-center justify-center text-black hover:cursor-pointer hover:bg-black/[.06] focus-visible:bg-black/[.06] active:bg-black/[.12] dark:text-white dark:hover:bg-white/[.06] dark:active:bg-white/[.12]"
      @click="appWindow.minimize()"
    >
      <UIcon name="i-window:minimize" class="size-3" />
    </button>

    <button
      :title="isMaximized ? $t('label-restore') : $t('label-maximize')"
      class="inline-flex size-10 items-center justify-center text-black hover:cursor-pointer hover:bg-black/[.06] focus-visible:bg-black/[.06] active:bg-black/[.12] dark:text-white dark:hover:bg-white/[.06] dark:active:bg-white/[.12]"
      @click="appWindow.toggleMaximize()"
    >
      <UIcon v-if="isMaximized" name="i-window:restore" class="size-3" />
      <UIcon v-else name="i-window:maximize" class="size-3" />
    </button>

    <button
      :title="$t('label-close')"
      class="inline-flex size-10 items-center justify-center text-black hover:cursor-pointer hover:bg-red-600 hover:text-white focus-visible:bg-red-600 focus-visible:text-white active:bg-red-700 dark:text-white"
      @click="appWindow.close()"
    >
      <UIcon name="i-window:close" class="size-3" />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { onUnmounted, ref } from "vue";

  // New window is maximized by default.
  const isMaximized = ref(true);

  const appWindow = getCurrentWindow();
  const maxWindowSize = await appWindow.innerSize();

  const unlistenResized = await appWindow.onResized(({ payload }) => {
    // For some reason, the event is fired twice on Linux.
    // This is a workaround to prevent the icon from flickering.
    isMaximized.value = maxWindowSize.width === payload.width && maxWindowSize.height === payload.height;
  });

  onUnmounted(() => {
    unlistenResized();
  });
</script>

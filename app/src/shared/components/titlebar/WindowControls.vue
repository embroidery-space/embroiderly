<template>
  <div class="flex items-center justify-center">
    <button
      :title="$t('window-minimize')"
      class="inline-flex size-10 items-center justify-center text-black hover:cursor-pointer hover:bg-black/6 focus-visible:bg-black/6 active:bg-black/12 dark:text-white dark:hover:bg-white/6 dark:active:bg-white/12"
      @click="appWindow.minimize()"
    >
      <UIcon name="i-window:minimize" class="size-3" />
    </button>

    <button
      :title="isMaximized ? $t('window-restore') : $t('window-maximize')"
      class="inline-flex size-10 items-center justify-center text-black hover:cursor-pointer hover:bg-black/6 focus-visible:bg-black/6 active:bg-black/12 dark:text-white dark:hover:bg-white/6 dark:active:bg-white/12"
      @click="appWindow.toggleMaximize()"
    >
      <UIcon v-if="isMaximized" name="i-window:restore" class="size-3" />
      <UIcon v-else name="i-window:maximize" class="size-3" />
    </button>

    <button
      :title="$t('window-close')"
      class="inline-flex size-10 items-center justify-center text-black hover:cursor-pointer hover:bg-red-600 hover:text-white focus-visible:bg-red-600 focus-visible:text-white active:bg-red-700 dark:text-white"
      @click="appWindow.close()"
    >
      <UIcon name="i-window:close" class="size-3" />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

  import { ref } from "vue";

  import { useTauriListener } from "#shared/composables";

  const appWindow = getCurrentWebviewWindow();

  // New window is maximized by default.
  const isMaximized = ref(true);
  useTauriListener(async () => {
    const maxWindowSize = await appWindow.innerSize();
    return await appWindow.onResized(({ payload }) => {
      // For some reason, the event is fired twice on Linux.
      // This is a workaround to prevent the icon from flickering.
      isMaximized.value = maxWindowSize.width === payload.width && maxWindowSize.height === payload.height;
    });
  });
</script>

<script setup lang="ts">
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { ref } from "vue";

import { IconWindowClose, IconWindowMaximize, IconWindowMinimize, IconWindowRestore } from "~/assets/icons/";
import { useTauriListener } from "~/composables/";

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

<template>
  <div class="flex items-center justify-center">
    <button
      :title="$t('window-minimize')"
      class="inline-flex size-10 items-center justify-center text-default hover:cursor-pointer hover:bg-current/6 focus-visible:bg-current/6 active:bg-current/12"
      @click="appWindow.minimize()"
    >
      <IconWindowMinimize class="size-3" />
    </button>

    <button
      :title="isMaximized ? $t('window-restore') : $t('window-maximize')"
      class="inline-flex size-10 items-center justify-center text-default hover:cursor-pointer hover:bg-current/6 focus-visible:bg-current/6 active:bg-current/12"
      @click="appWindow.toggleMaximize()"
    >
      <IconWindowRestore v-if="isMaximized" class="size-3" />
      <IconWindowMaximize v-else class="size-3" />
    </button>

    <button
      :title="$t('window-close')"
      class="inline-flex size-10 items-center justify-center text-default hover:cursor-pointer hover:bg-red-600 hover:text-white focus-visible:bg-red-600 focus-visible:text-white active:bg-red-700"
      @click="appWindow.close()"
    >
      <IconWindowClose class="size-3" />
    </button>
  </div>
</template>

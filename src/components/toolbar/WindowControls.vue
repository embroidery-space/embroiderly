<template>
  <div class="flex items-center justify-center">
    <button
      class="size-10 inline-flex items-center justify-center text-black hover:cursor-pointer active:bg-black/[.12] focus-visible:bg-black/[.06] hover:bg-black/[.06] dark:text-white dark:active:bg-white/[.12] dark:hover:bg-white/[.06]"
      @click="appWindow.minimize()"
    >
      <span class="size-3 inline-flex items-center justify-center">
        <IconMinimize />
      </span>
    </button>

    <button
      class="size-10 inline-flex items-center justify-center text-black hover:cursor-pointer active:bg-black/[.12] focus-visible:bg-black/[.06] hover:bg-black/[.06] dark:text-white dark:active:bg-white/[.12] dark:hover:bg-white/[.06]"
      @click="appWindow.toggleMaximize()"
    >
      <span v-if="isMaximized" class="size-3 inline-flex items-center justify-center">
        <IconRestore />
      </span>
      <span v-else class="size-3 inline-flex items-center justify-center">
        <IconMaximize />
      </span>
    </button>

    <button
      class="size-10 inline-flex items-center justify-center text-black hover:cursor-pointer active:bg-red-700 focus-visible:bg-red-600 hover:bg-red-600 dark:text-white focus-visible:text-white hover:text-white"
      @click="appWindow.close()"
    >
      <span class="size-3 inline-flex items-center justify-center">
        <IconClose />
      </span>
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

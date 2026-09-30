<script setup lang="ts">
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { ref } from "vue";

import { IconWindowClose, IconWindowMaximize, IconWindowMinimize, IconWindowRestore } from "~/assets/icons/";
import { useTauriListener } from "~/composables/tauri/";

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
  <div :class="$style.root">
    <button :title="$t('window-minimize')" :class="$style.button" @click="appWindow.minimize()">
      <IconWindowMinimize :class="$style.icon" />
    </button>

    <button
      :title="isMaximized ? $t('window-restore') : $t('window-maximize')"
      :class="$style.button"
      @click="appWindow.toggleMaximize()"
    >
      <IconWindowRestore v-if="isMaximized" :class="$style.icon" />
      <IconWindowMaximize v-else :class="$style.icon" />
    </button>

    <button :title="$t('window-close')" :class="[$style.button, $style.close]" @click="appWindow.close()">
      <IconWindowClose :class="$style.icon" />
    </button>
  </div>
</template>

<style module>
.root {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: calc(var(--spacing) * 10);
  height: calc(var(--spacing) * 10);

  color: var(--text-color-default);

  &:hover,
  &:focus-visible {
    cursor: pointer;
    background-color: color-mix(in oklab, currentcolor 6%, transparent);
  }

  &:active {
    background-color: color-mix(in oklab, currentcolor 12%, transparent);
  }

  &.close {
    &:hover,
    &:focus-visible {
      color: var(--color-white);
      background-color: red;
    }

    &:active {
      color: var(--color-white);
      background-color: darkred;
    }
  }
}

.icon {
  width: calc(var(--spacing) * 3);
  height: calc(var(--spacing) * 3);
}
</style>

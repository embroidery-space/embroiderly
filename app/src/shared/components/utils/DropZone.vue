<template>
  <div ref="container" :aria-busy="dragging" class="relative">
    <!-- Overlay -->
    <div v-if="dragging" class="absolute top-0 left-0 z-1 size-full bg-black/50"></div>

    <!-- Upload Icon -->
    <div
      v-if="dragging"
      class="absolute top-1/2 left-1/2 z-10 flex -translate-1/2 items-center justify-center rounded-full bg-default p-6"
    >
      <UIcon name="i-lucide:upload" class="size-16" />
    </div>

    <!-- Content -->
    <slot />
  </div>
</template>

<script setup lang="ts">
  import type { PhysicalPosition } from "@tauri-apps/api/dpi";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

  import { ref, useTemplateRef } from "vue";

  import { useTauriListener } from "#shared/composables/";

  const appWindow = getCurrentWebviewWindow();

  const emit = defineEmits<{
    drop: [paths: string[]];
  }>();

  const container = useTemplateRef<HTMLElement>("container");
  const dragging = ref(false);

  /**
   * Check if the given position is within the target container.
   * @param position - The position to check.
   * @param scaleFactor - The scale factor.
   */
  function checkPositionIsWithinContainer(position: PhysicalPosition, scaleFactor: number) {
    if (!container.value) return false;

    const { x, y } = position.toLogical(scaleFactor);
    const rect = container.value.getBoundingClientRect();

    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  useTauriListener(
    appWindow.onDragDropEvent(async ({ payload }) => {
      switch (payload.type) {
        case "over": {
          dragging.value = true;
          break;
        }

        case "drop": {
          dragging.value = false;

          const scaleFactor = await appWindow.scaleFactor();
          if (checkPositionIsWithinContainer(payload.position, scaleFactor)) {
            emit("drop", payload.paths);
          }

          break;
        }

        default: {
          dragging.value = false;
          break;
        }
      }
    }),
  );
</script>

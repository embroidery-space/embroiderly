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
   * Check if the given position is within the target container and the container is visible at that position.
   * This prevents covered drop zones (e.g., by modals or overlays) from processing drop events.
   * @param position - The position to check.
   * @param scaleFactor - The scale factor.
   */
  function checkPositionIsWithinContainer(position: PhysicalPosition, scaleFactor: number) {
    if (!container.value) return false;

    const { x, y } = position.toLogical(scaleFactor);
    const rect = container.value.getBoundingClientRect();

    // Check if position is within the drop zone bounds.
    if (!(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)) {
      return false;
    }

    // Check if this drop zone is actually visible at the drop point.
    // This ensures only the topmost visible drop zone processes the event.
    const elementAtPoint = document.elementFromPoint(x, y);
    if (!elementAtPoint) return false;

    // Only process if the top element is this container or one of its descendants.
    return container.value === elementAtPoint || container.value.contains(elementAtPoint);
  }

  useTauriListener(
    (() => {
      let scaleFactor: number | null = null;
      return appWindow.onDragDropEvent(async ({ payload }) => {
        switch (payload.type) {
          case "enter": {
            // Fetch scale factor once and cache it for this drag operation.
            scaleFactor = await appWindow.scaleFactor();
            break;
          }

          case "over": {
            if (scaleFactor !== null) {
              dragging.value = checkPositionIsWithinContainer(payload.position, scaleFactor);
            }
            break;
          }

          case "drop": {
            dragging.value = false;
            if (scaleFactor !== null && checkPositionIsWithinContainer(payload.position, scaleFactor)) {
              emit("drop", payload.paths);
            }
            break;
          }

          case "leave": {
            dragging.value = false;
            break;
          }
        }
      });
    })(),
  );
</script>

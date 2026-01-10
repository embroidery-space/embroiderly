import type { PhysicalPosition } from "@tauri-apps/api/dpi";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

import { unrefElement } from "@vueuse/core";
import type { MaybeComputedElementRef, MaybeElement } from "@vueuse/core";
import { computed, ref } from "vue";

import { useTauriListener } from "#shared/composables/";

/**
 * Composable for handling drag-and-drop operations.
 * Only processes drops when the drop position is within the target container and the container is visible.
 * @param target - The target element that should accept drops.
 * @param onDrop - Callback function invoked with file paths when a valid drop occurs.
 * @returns Object containing the `isOverDropZone` ref that tracks the current drag state.
 */
export function useDragDrop(
  target: MaybeComputedElementRef<MaybeElement | null | undefined>,
  onDrop: (paths: string[]) => void,
) {
  const appWindow = getCurrentWebviewWindow();

  const element = computed(() => unrefElement(target));

  const isOverDropZone = ref(false);

  /**
   * Check if the given position is within the target container and the container is visible at that position.
   * This prevents covered drop zones (e.g., by modals or overlays) from processing drop events.
   * @param position - The position to check.
   * @param scaleFactor - The scale factor.
   */
  function checkPositionIsWithinContainer(position: PhysicalPosition, scaleFactor: number) {
    if (!element.value) return false;

    const { x, y } = position.toLogical(scaleFactor);
    const rect = element.value.getBoundingClientRect();

    // Only continue if position is within the drop zone bounds.
    if (!(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)) {
      return false;
    }

    // Check if this drop zone is actually visible at the drop point.
    // This ensures only the topmost visible drop zone processes the event.
    const elementAtPoint = document.elementFromPoint(x, y);
    if (!elementAtPoint) return false;

    // Only process if the top element is this container or one of its descendants.
    return element.value === elementAtPoint || element.value.contains(elementAtPoint);
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
              isOverDropZone.value = checkPositionIsWithinContainer(payload.position, scaleFactor);
            }
            break;
          }

          case "drop": {
            isOverDropZone.value = false;
            if (scaleFactor !== null && checkPositionIsWithinContainer(payload.position, scaleFactor)) {
              onDrop(payload.paths);
            }
            break;
          }

          case "leave": {
            isOverDropZone.value = false;
            break;
          }
        }
      });
    })(),
  );

  return { isOverDropZone };
}

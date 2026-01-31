import { useEventListener, useThrottleFn } from "@vueuse/core";
import type { MaybeRefOrGetter, Ref } from "vue";
import { ref, toValue, watch } from "vue";

export interface UseColorDraggableOptions {
  /** The target element for dragging. */
  target: MaybeRefOrGetter<HTMLElement | null>;

  /** Initial X position (0-100). */
  initialX?: MaybeRefOrGetter<number>;
  /** Initial Y position (0-100). */
  initialY?: MaybeRefOrGetter<number>;

  /** Throttle time in milliseconds. */
  throttle?: MaybeRefOrGetter<number>;
  /** Whether dragging is disabled. */
  disabled?: MaybeRefOrGetter<boolean>;

  /** Callback when position updates. */
  onUpdate?: (position: { x: number; y: number }) => void;
}

export interface UseColorDraggableReturn {
  /** X position (0-100). */
  x: Ref<number>;
  /** Y position (0-100). */
  y: Ref<number>;

  /** Whether the user is currently dragging. */
  isDragging: Ref<boolean>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function useColorDraggable(options: UseColorDraggableOptions): UseColorDraggableReturn {
  const x = ref(toValue(options.initialX) ?? 0);
  const y = ref(toValue(options.initialY) ?? 0);

  const isDragging = ref(false);

  watch(
    () => toValue(options.initialX),
    (newX) => {
      if (!isDragging.value && newX !== undefined) {
        x.value = newX;
      }
    },
  );

  watch(
    () => toValue(options.initialY),
    (newY) => {
      if (!isDragging.value && newY !== undefined) {
        y.value = newY;
      }
    },
  );

  function calculatePosition(clientX: number, clientY: number): { x: number; y: number } {
    const target = toValue(options.target);
    if (!target) return { x: x.value, y: y.value };

    const rect = target.getBoundingClientRect();
    const newX = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const newY = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);

    return { x: newX, y: newY };
  }

  function updatePosition(clientX: number, clientY: number) {
    if (toValue(options.disabled)) return;

    const position = calculatePosition(clientX, clientY);

    x.value = position.x;
    y.value = position.y;

    options.onUpdate?.(position);
  }

  const throttledUpdatePosition = useThrottleFn(
    (clientX: number, clientY: number) => updatePosition(clientX, clientY),
    () => toValue(options.throttle) ?? 50,
  );

  useEventListener(
    () => toValue(options.target),
    "mousedown",
    (event: MouseEvent) => {
      event.preventDefault();

      if (toValue(options.disabled)) return;

      isDragging.value = true;
      updatePosition(event.clientX, event.clientY);
    },
  );
  useEventListener("mousemove", (event: MouseEvent) => {
    if (!isDragging.value) return;
    throttledUpdatePosition(event.clientX, event.clientY);
  });
  useEventListener("mouseup", () => {
    isDragging.value = false;
  });

  return { x, y, isDragging };
}

import { createSharedComposable } from "@vueuse/core";
import { ref } from "vue";

import type { ButtonProps } from "../components/Button/Button.vue";
import type { ToastProps } from "../components/Toast/Toast.vue";

export interface Toast extends Pick<ToastProps, "title" | "description" | "color" | "duration" | "type"> {
  id: string | number;
  open: boolean;
  actions?: ButtonProps[];
  "onUpdate:open"?: (value: boolean) => void;
}

const MAX_TOASTS = 5;

export const useToast = createSharedComposable(() => {
  const toasts = ref<Toast[]>([]);

  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function add(toast: Partial<Toast>): Toast {
    const body: Toast = {
      id: generateId(),
      open: true,
      ...toast,
    };

    toasts.value = [...toasts.value, body].slice(-MAX_TOASTS);

    return body;
  }

  function update(id: string | number, toast: Omit<Partial<Toast>, "id">): void {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value[index] = {
        ...toasts.value[index]!,
        ...toast,
        open: true,
      };
    }
  }

  function remove(id: string | number): void {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value[index] = {
        ...toasts.value[index]!,
        open: false,
      };
    }

    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 200);
  }

  function clear(): void {
    toasts.value = [];
  }

  return { toasts, add, update, remove, clear };
});

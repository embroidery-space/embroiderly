import { createSharedComposable } from "@vueuse/core";
import { markRaw, reactive, shallowReactive } from "vue";
import type { Component } from "vue";

export interface OverlayOptions {
  defaultOpen?: boolean;
  props?: Record<string, unknown>;
  destroyOnClose?: boolean;
}

export interface Overlay extends OverlayOptions {
  id: symbol;
  component?: Component;
  isMounted: boolean;
  isOpen: boolean;
  originalProps?: Record<string, unknown>;
  resolvePromise?: (value: unknown) => void;
}

export interface OverlayInstance {
  id: symbol;
  isMounted: boolean;
  isOpen: boolean;
  originalProps?: Record<string, unknown>;
  open: (props?: Record<string, unknown>) => OpenedOverlay;
  close: (value?: unknown) => void;
  patch: (props: Record<string, unknown>) => void;
}

export type OpenedOverlay = Pick<OverlayInstance, "id" | "isMounted" | "isOpen"> & {
  result: Promise<unknown>;
} & Promise<unknown>;

export const useOverlay = createSharedComposable(() => {
  const overlays = shallowReactive<Overlay[]>([]);

  function getOverlay(id: symbol): Overlay {
    const overlay = overlays.find((o) => o.id === id);
    if (!overlay) throw new Error("Overlay not found");
    return overlay;
  }

  function create(component: Component, _options?: OverlayOptions): OverlayInstance {
    const { props, defaultOpen, destroyOnClose } = _options ?? {};

    const options = reactive<Overlay>({
      id: Symbol("useOverlay"),
      isOpen: !!defaultOpen,
      component: markRaw(component),
      isMounted: !!defaultOpen,
      destroyOnClose: !!destroyOnClose,
      originalProps: props ?? {},
      props: { ...props },
    });

    overlays.push(options);

    return {
      ...options,
      open: (props?) => open(options.id, props),
      close: (value?) => close(options.id, value),
      patch: (props) => patch(options.id, props),
    };
  }

  function open(id: symbol, props?: Record<string, unknown>): OpenedOverlay {
    const overlay = getOverlay(id);

    overlay.props = props ? { ...overlay.originalProps, ...props } : { ...overlay.originalProps };
    overlay.isOpen = true;
    overlay.isMounted = true;

    const result = new Promise<unknown>((resolve) => {
      overlay.resolvePromise = resolve;
    });

    return Object.assign(result, {
      id,
      isMounted: overlay.isMounted,
      isOpen: overlay.isOpen,
      result,
    });
  }

  function close(id: symbol, value?: unknown): void {
    const overlay = getOverlay(id);

    overlay.isOpen = false;

    if (overlay.resolvePromise) {
      overlay.resolvePromise(value);
      overlay.resolvePromise = undefined;
    }
  }

  function closeAll(): void {
    overlays.forEach((overlay) => close(overlay.id));
  }

  function unmount(id: symbol): void {
    const overlay = getOverlay(id);

    overlay.isMounted = false;

    if (overlay.destroyOnClose) {
      const index = overlays.findIndex((o) => o.id === id);
      overlays.splice(index, 1);
    }
  }

  function patch(id: symbol, props: Record<string, unknown>): void {
    const overlay = getOverlay(id);

    overlay.props = { ...overlay.props, ...props };
  }

  function isOpen(id: symbol): boolean {
    return getOverlay(id).isOpen;
  }

  return { overlays, create, open, close, closeAll, patch, unmount, isOpen };
});

import { createSharedComposable } from "@vueuse/core";
import { markRaw, reactive, shallowReactive } from "vue";
import type { Component } from "vue";
import type { ComponentEmit, ComponentProps } from "vue-component-type-helpers";

type CloseEventArgTypeSimple<T> = T extends (event: "close", arg_0: infer Arg, ...args: any[]) => void ? Arg : never;

/**
 * This is a workaround for a design limitation in TypeScript.
 *
 * Conditional types only match the last function overload, not a union of all possible
 * parameter types. This workaround forces TypeScript to properly extract the 'close'
 * event argument type from component emits with multiple event signatures.
 *
 * @see https://github.com/microsoft/TypeScript/issues/32164
 */
type CloseEventArgTypeComplex<T> = T extends {
  (event: "close", arg_0: infer Arg, ...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
}
  ? Arg
  : never;

type CloseEventArgType<T> = CloseEventArgTypeSimple<T> | CloseEventArgTypeComplex<T>;

export interface OverlayOptions<OverlayProps = Record<string, unknown>> {
  defaultOpen?: boolean;
  props?: OverlayProps;
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

export interface OverlayInstance<T extends Component> {
  id: symbol;
  isMounted: boolean;
  isOpen: boolean;
  originalProps?: ComponentProps<T>;
  open: (props?: ComponentProps<T>) => OpenedOverlay<T>;
  close: (value?: CloseEventArgType<ComponentEmit<T>>) => void;
  patch: (props: Partial<ComponentProps<T>>) => void;
}

export type OpenedOverlay<T extends Component> = Pick<OverlayInstance<T>, "id" | "isMounted" | "isOpen"> & {
  result: Promise<CloseEventArgType<ComponentEmit<T>>>;
} & Promise<CloseEventArgType<ComponentEmit<T>>>;

export const useOverlay = createSharedComposable(() => {
  const overlays = shallowReactive<Overlay[]>([]);

  function getOverlay(id: symbol): Overlay {
    const overlay = overlays.find((o) => o.id === id);
    if (!overlay) throw new Error("Overlay not found");
    return overlay;
  }

  function create<T extends Component>(component: T, _options?: OverlayOptions<ComponentProps<T>>): OverlayInstance<T> {
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
      id: options.id,
      isMounted: options.isMounted,
      isOpen: options.isOpen,
      originalProps: options.originalProps as ComponentProps<T> | undefined,
      open: (props?) => open<T>(options.id, props),
      close: (value?) => close(options.id, value),
      patch: (props) => patch<T>(options.id, props),
    };
  }

  function open<T extends Component>(id: symbol, props?: ComponentProps<T>): OpenedOverlay<T> {
    const overlay = getOverlay(id);

    overlay.props = props ? { ...overlay.originalProps, ...props } : { ...overlay.originalProps };
    overlay.isOpen = true;
    overlay.isMounted = true;

    const result = new Promise<CloseEventArgType<ComponentEmit<T>>>((resolve) => {
      overlay.resolvePromise = resolve as (value: unknown) => void;
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

  function patch<T extends Component>(id: symbol, props: Partial<ComponentProps<T>>): void {
    const overlay = getOverlay(id);

    overlay.props = { ...overlay.props, ...props };
  }

  function isOpen(id: symbol): boolean {
    return getOverlay(id).isOpen;
  }

  return { overlays, create, open, close, closeAll, patch, unmount, isOpen };
});

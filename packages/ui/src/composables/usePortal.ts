import type { InjectionKey } from "vue";
import type { Ref } from "vue";
import { computed, inject } from "vue";

export const GLOBAL_PORTAL = "body";
export const PORTAL_TARGET_INJECTION_KEY: InjectionKey<Ref<boolean | string | HTMLElement>> =
  Symbol("embroiderly-ui.portal-target");

export function usePortal(portal: Ref<boolean | string | HTMLElement | undefined>) {
  const globalPortal = inject(PORTAL_TARGET_INJECTION_KEY, undefined);

  const value = computed(() => (portal.value === true ? globalPortal?.value : portal.value));
  return computed(() => ({
    to: typeof value.value === "boolean" ? GLOBAL_PORTAL : value.value,
    disabled: typeof value.value === "boolean" ? !value.value : false,
  }));
}

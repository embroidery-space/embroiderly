import type { Ref } from "vue";
import { computed } from "vue";

const GLOBAL_PORTAL = "body";

export function usePortal(portal: Ref<boolean | string | HTMLElement | undefined>) {
  const value = computed(() => (portal.value === true ? GLOBAL_PORTAL : portal.value));
  return computed(() => ({
    to: typeof value.value === "boolean" ? GLOBAL_PORTAL : value.value,
    disabled: typeof value.value === "boolean" ? !value.value : false,
  }));
}

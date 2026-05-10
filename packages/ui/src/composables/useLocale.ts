import { createSharedComposable } from "@vueuse/core";
import { computed, inject } from "vue";
import type { InjectionKey, Ref } from "vue";

import { locales } from "../locales/index.ts";
import type { Locale } from "../types/locale.ts";

export const localeInjectionKey: InjectionKey<Ref<Locale>> = Symbol.for("embroiderly-ui.locale");

export const useLocale = createSharedComposable(() => {
  const locale = inject(localeInjectionKey, undefined);
  return computed(() => locale?.value ?? locales["en"]!);
});

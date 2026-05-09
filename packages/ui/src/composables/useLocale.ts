import { createSharedComposable, toRef } from "@vueuse/core";
import { computed, inject } from "vue";
import type { InjectionKey, Ref } from "vue";

import { locales } from "../locales/index.ts";
import type { Locale } from "../types/locale.ts";

export const localeInjectionKey: InjectionKey<Ref<Locale>> = Symbol.for("embroiderly-ui.locale");

export const useLocale = createSharedComposable(() => {
  const locale = toRef(() => inject(localeInjectionKey, undefined)?.value ?? locales["en"]!);
  return {
    locale,
    messages: computed(() => locale.value.messages),
  };
});

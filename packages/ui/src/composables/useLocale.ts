import { createSharedComposable } from "@vueuse/core";
import { computed, inject, toRef } from "vue";
import type { InjectionKey, Ref } from "vue";

import { en } from "../locales/index.ts";
import type { Locale } from "../types/locale.ts";

export const localeInjectionKey: InjectionKey<Ref<Locale | undefined>> = Symbol.for("embroiderly-ui.locale");

export const useLocale = createSharedComposable(() => {
  const locale = computed(() => toRef(inject<Locale>(localeInjectionKey, en)).value ?? en);
  return {
    locale,
    messages: computed(() => locale.value.messages),
  };
});

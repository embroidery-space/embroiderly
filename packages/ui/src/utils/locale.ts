import { computed, unref } from "vue";
import type { Ref, MaybeRef } from "vue";

import type { Locale, Direction } from "../types/locale.ts";

import { get } from "./object.ts";

export type LocaleContext = {
  // locale: Ref<Locale>
  lang: Ref<string>;
  dir: Ref<Direction>;
  code: Ref<string>;
  t: (path: string) => string;
};

export function translate(path: string, locale: Locale): string {
  return get(locale, `messages.${path}`, path);
}

export function buildLocaleContext(locale: MaybeRef<Locale>): LocaleContext {
  const lang = computed(() => unref(locale).name);
  const code = computed(() => unref(locale).code);
  const dir = computed(() => unref(locale).dir);
  // const localeRef = isRef(locale) ? locale : ref(locale) as Ref<Locale<M>>

  return {
    lang,
    code,
    dir,
    // locale: localeRef,
    t: (path) => translate(path, unref(locale)),
  };
}

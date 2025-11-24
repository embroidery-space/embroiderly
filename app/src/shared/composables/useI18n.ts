import { FluentBundle, FluentResource } from "@fluent/bundle";
import { en as nuxtEnLocale, uk as nuxtUkLocale } from "@nuxt/ui/locale";
import { createSharedComposable } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { ref, computed } from "vue";

import appEnLocale from "virtual:en.ftl";
import appUkLocale from "virtual:uk.ftl";

const DEFAULT_LOCALE = "en";

const APP_LOCALES: Record<string, FluentBundle> = {
  en: createFluentBundle("en", appEnLocale),
  uk: createFluentBundle("uk", appUkLocale),
};

const UI_LOCALES: Record<string, typeof nuxtEnLocale> = {
  en: nuxtEnLocale,
  uk: nuxtUkLocale,
};

export const useI18n = createSharedComposable(() => {
  const fluent = useFluent();

  const currentLocale = ref(DEFAULT_LOCALE);
  const currentUiLocale = computed(() => UI_LOCALES[currentLocale.value]!);

  /** Sets the current locale. */
  function setLocale(locale: string) {
    currentLocale.value = locale;
    fluent.bundles.value =
      locale === DEFAULT_LOCALE ? [APP_LOCALES[locale]!] : [APP_LOCALES[locale]!, APP_LOCALES[DEFAULT_LOCALE]!];
  }

  // Configure initial locale. It will be executed only once.
  setLocale(DEFAULT_LOCALE);

  return {
    fluent,

    currentLocale,
    currentUiLocale,

    setLocale,
  };
});

function createFluentBundle(locale: string, content: string) {
  const bundle = new FluentBundle(locale);
  const resource = new FluentResource(content);

  bundle.addResource(resource);

  return bundle;
}

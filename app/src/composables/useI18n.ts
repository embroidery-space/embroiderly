import { FluentBundle, FluentResource } from "@fluent/bundle";
import { createSharedComposable } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { ref } from "vue";

import appEnLocale from "virtual:en.ftl";
import appUkLocale from "virtual:uk.ftl";

const DEFAULT_LOCALE = "en";

const LOCALES: Record<string, FluentBundle> = {
  en: createFluentBundle("en", appEnLocale),
  uk: createFluentBundle("uk", appUkLocale),
};

export const useI18n = createSharedComposable(() => {
  const fluent = useFluent();

  const currentLocale = ref(DEFAULT_LOCALE);

  /** Sets the current locale. */
  function setLocale(locale: string) {
    currentLocale.value = locale;
    fluent.bundles.value =
      locale === DEFAULT_LOCALE ? [LOCALES[locale]!] : [LOCALES[locale]!, LOCALES[DEFAULT_LOCALE]!];
  }

  // Configure initial locale. It will be executed only once.
  setLocale(DEFAULT_LOCALE);

  return { fluent, currentLocale, setLocale };
});

function createFluentBundle(locale: string, content: string) {
  const bundle = new FluentBundle(locale);
  const resource = new FluentResource(content);

  bundle.addResource(resource);

  return bundle;
}

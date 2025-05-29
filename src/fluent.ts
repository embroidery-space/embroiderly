import { en as primevueEnLocale } from "primelocale/js/en.js";
import { uk as primevueUkLocale } from "primelocale/js/uk.js";
import { FluentBundle, FluentResource } from "@fluent/bundle";
import { createFluentVue } from "fluent-vue";

import enContent from "#/locales/en.ftl?raw";
import ukContent from "#/locales/uk.ftl?raw";

const en = new FluentBundle("en");
en.addResource(new FluentResource(enContent));

const uk = new FluentBundle("uk");
uk.addResource(new FluentResource(ukContent));

export const LOCALES = { en, uk } as const;
export const PRIMEVUE_LOCALES = { uk: primevueUkLocale, en: primevueEnLocale } as const;

export const fluent = createFluentVue({ bundles: [en], componentTag: false });

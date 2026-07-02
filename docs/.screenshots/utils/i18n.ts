import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FluentBundle, FluentResource } from "@fluent/bundle";
import type { FluentVariable } from "@fluent/bundle";

const ROOT_PATH = fileURLToPath(new URL("../../..", import.meta.url));

export const LANGUAGES = ["en", "uk"] as const;
export type Language = (typeof LANGUAGES)[number];

const bundles = new Map<Language, FluentBundle>();
function getBundle(language: Language) {
  let bundle = bundles.get(language);
  if (!bundle) {
    const filePath = path.join(ROOT_PATH, "app", "src", "assets", "locales", `${language}.ftl`);
    bundle = new FluentBundle(language);
    bundle.addResource(new FluentResource(fs.readFileSync(filePath, "utf-8")));
    bundles.set(language, bundle);
  }
  return bundle;
}

/** Translates a Fluent message (or one of its attributes) for the given language. */
export function $t(language: Language, key: string, args?: Record<string, FluentVariable>, attribute?: string) {
  const message = getBundle(language).getMessage(key);
  const pattern = attribute ? message?.attributes[attribute] : message?.value;
  if (!pattern) return key;

  return getBundle(language).formatPattern(pattern, args);
}

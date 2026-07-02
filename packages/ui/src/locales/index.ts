import type { Locale } from "../types/locale.ts";

import en from "./en.ts";
import uk from "./uk.ts";

export const locales: Record<string, Locale> = { en, uk };

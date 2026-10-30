<script setup lang="ts">
import { ConfigProvider, TooltipProvider } from "reka-ui";
import type { TooltipProviderProps } from "reka-ui";
import { provide, toRef, useId } from "vue";

import { iconsInjectionKey } from "../../composables/useComponentIcons.ts";
import { localeInjectionKey } from "../../composables/useLocale.ts";
import { GLOBAL_PORTAL, PORTAL_TARGET_INJECTION_KEY } from "../../composables/usePortal.ts";
import { provideShortcutsContext } from "../../composables/useShortcuts.ts";
import type { ShortcutsOptions } from "../../composables/useShortcuts.ts";
import { DEFAULT_ICONS } from "../../icons.ts";
import { locales } from "../../locales/index.ts";
import type { Icons } from "../../types/icons.ts";
import Toaster from "../Toast/Toaster.vue";
import type { ToasterProps } from "../Toast/Toaster.vue";

import OverlayProvider from "./OverlayProvider.vue";

export interface AppProps {
  /** Tooltip options. */
  tooltip?: TooltipProviderProps;
  /** Toast options. Pass `null` to disable toasts. */
  toaster?: ToasterProps | null;
  /** Shortcuts options. */
  shortcuts?: ShortcutsOptions;

  /**
   * The locale to use for the application.
   * @default "en"
   */
  locale?: string;
  /** Icons override. */
  icons?: Partial<Icons>;

  portal?: boolean | string | HTMLElement;
}

export interface AppSlots {
  default(): any;
}

const props = withDefaults(defineProps<AppProps>(), {
  locale: "en",
  portal: GLOBAL_PORTAL,
});
defineSlots<AppSlots>();

provideShortcutsContext(() => props.shortcuts);

const locale = toRef(() => locales[props.locale]!);
provide(localeInjectionKey, locale);

const icons = toRef(() => ({ ...DEFAULT_ICONS, ...props.icons }));
provide(iconsInjectionKey, icons);

const portal = toRef(() => props.portal);
provide(PORTAL_TARGET_INJECTION_KEY, portal);
</script>

<template>
  <ConfigProvider :dir="locale.dir" :locale="locale.code" :use-id="useId">
    <TooltipProvider v-bind="tooltip">
      <Toaster v-if="toaster !== null" v-bind="toaster">
        <slot />
      </Toaster>
      <slot v-else />

      <OverlayProvider />
    </TooltipProvider>
  </ConfigProvider>
</template>

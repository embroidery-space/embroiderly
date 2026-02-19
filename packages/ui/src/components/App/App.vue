<script setup lang="ts">
import { ShortcutsProvider } from "@embroiderly/shortcuts";
import type { ShortcutsProviderProps } from "@embroiderly/shortcuts";

import { reactivePick } from "@vueuse/core";
import { ConfigProvider, TooltipProvider, useForwardProps } from "reka-ui";
import type { ConfigProviderProps, TooltipProviderProps } from "reka-ui";
import { provide, toRef, useId } from "vue";

import { iconsInjectionKey } from "../../composables/useComponentIcons.ts";
import { localeInjectionKey } from "../../composables/useLocale.ts";
import { GLOBAL_PORTAL, PORTAL_TARGET_INJECTION_KEY } from "../../composables/usePortal.ts";
import { DEFAULT_ICONS } from "../../icons.ts";
import type { Icons } from "../../types/icons.ts";
import type { Locale } from "../../types/locale.ts";

import OverlayProvider from "./OverlayProvider.vue";

export interface AppProps extends Omit<ConfigProviderProps, "dir" | "locale" | "useId"> {
  tooltip?: TooltipProviderProps;
  shortcuts?: ShortcutsProviderProps | null;

  locale?: Locale;
  icons?: Partial<Icons>;

  portal?: boolean | string | HTMLElement;
}

const props = withDefaults(defineProps<AppProps>(), {
  portal: GLOBAL_PORTAL,
});

const configProps = useForwardProps(reactivePick(props, "scrollBody"));
const tooltipProps = toRef(() => props.tooltip);
const shortcutsProps = toRef(() => props.shortcuts);

const locale = toRef(() => props.locale);
provide(localeInjectionKey, locale);

const icons = toRef(() => ({ ...DEFAULT_ICONS, ...props.icons }));
provide(iconsInjectionKey, icons);

const portal = toRef(() => props.portal);
provide(PORTAL_TARGET_INJECTION_KEY, portal);
</script>

<template>
  <ConfigProvider v-bind="configProps" :dir="locale?.dir" :locale="locale?.code" :use-id="useId">
    <TooltipProvider v-bind="tooltipProps">
      <ShortcutsProvider v-if="shortcutsProps" v-bind="shortcutsProps">
        <slot />
      </ShortcutsProvider>

      <slot v-else />

      <OverlayProvider />
    </TooltipProvider>
  </ConfigProvider>
</template>

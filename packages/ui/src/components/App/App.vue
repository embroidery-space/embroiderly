<script setup lang="ts">
  import { reactivePick } from "@vueuse/core";
  import type { ConfigProviderProps, TooltipProviderProps } from "reka-ui";
  import { ConfigProvider, TooltipProvider, useForwardProps } from "reka-ui";
  import { provide, toRef, useId } from "vue";

  import { localeInjectionKey } from "../../composables/useLocale.ts";
  import { GLOBAL_PORTAL, PORTAL_TARGET_INJECTION_KEY } from "../../composables/usePortal.ts";
  import type { Locale } from "../../types/locale.ts";

  export interface AppProps extends Omit<ConfigProviderProps, "dir" | "locale" | "useId"> {
    tooltip?: TooltipProviderProps;
    locale?: Locale;
    portal?: boolean | string | HTMLElement;
  }

  export interface AppSlots {
    default(): any;
  }

  const props = withDefaults(defineProps<AppProps>(), {
    portal: GLOBAL_PORTAL,
  });

  const configProps = useForwardProps(reactivePick(props, "scrollBody"));
  const tooltipProps = toRef(() => props.tooltip);

  const locale = toRef(() => props.locale);
  provide(localeInjectionKey, locale);

  const portal = toRef(() => props.portal);
  provide(PORTAL_TARGET_INJECTION_KEY, portal);
</script>

<template>
  <ConfigProvider v-bind="configProps" :dir="locale?.dir" :locale="locale?.code" :use-id="useId">
    <TooltipProvider v-bind="tooltipProps">
      <slot />
    </TooltipProvider>
  </ConfigProvider>
</template>

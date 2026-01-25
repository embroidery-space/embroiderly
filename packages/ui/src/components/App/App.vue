<script setup lang="ts">
  import { reactivePick } from "@vueuse/core";
  import type { ConfigProviderProps, TooltipProviderProps } from "reka-ui";
  import { ConfigProvider, TooltipProvider, useForwardProps } from "reka-ui";
  import { provide, toRef, useId } from "vue";

  import { GLOBAL_PORTAL, PORTAL_TARGET_INJECTION_KEY } from "../../composables/usePortal.ts";

  export interface AppProps extends Omit<ConfigProviderProps, "useId"> {
    tooltip?: TooltipProviderProps;
    portal?: boolean | string | HTMLElement;
  }

  export interface AppSlots {
    default(): any;
  }

  const props = withDefaults(defineProps<AppProps>(), {
    portal: GLOBAL_PORTAL,
  });

  const configProps = useForwardProps(reactivePick(props, "dir", "locale", "scrollBody"));
  const tooltipProps = toRef(() => props.tooltip);

  const portal = toRef(() => props.portal);
  provide(PORTAL_TARGET_INJECTION_KEY, portal);
</script>

<template>
  <ConfigProvider v-bind="configProps" :use-id="() => useId()">
    <TooltipProvider v-bind="tooltipProps">
      <slot />
    </TooltipProvider>
  </ConfigProvider>
</template>

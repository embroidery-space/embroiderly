<template>
  <ConfigProvider>
    <TooltipProvider>
      <slot />
    </TooltipProvider>
  </ConfigProvider>
</template>

<script setup lang="ts">
  import { ConfigProvider, TooltipProvider } from "reka-ui";
  import { provide, toRef } from "vue";

  import { GLOBAL_PORTAL, PORTAL_TARGET_INJECTION_KEY } from "../composables/usePortal.ts";

  export interface AppProps {
    portal?: boolean | string | HTMLElement;
  }

  export interface AppSlots {
    default(): any;
  }

  const props = withDefaults(defineProps<AppProps>(), {
    portal: GLOBAL_PORTAL,
  });

  const portal = toRef(() => props.portal);
  provide(PORTAL_TARGET_INJECTION_KEY, portal);
</script>

<script setup lang="ts">
  import type {
    SplitterPanelEmits as RekaSplitterPanelEmits,
    SplitterPanelProps as RekaSplitterPanelProps,
  } from "reka-ui";
  import { SplitterPanel as RekaSplitterPanel, useForwardPropsEmits } from "reka-ui";
  import { inject } from "vue";

  import { SplitterContextKey } from "./context.ts";

  export interface SplitterPanelProps extends RekaSplitterPanelProps {
    class?: any;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface SplitterPanelEmits extends RekaSplitterPanelEmits {}

  export interface SplitterPanelSlots {
    default(props: { isCollapsed: boolean; isExpanded: boolean }): any;
  }

  const props = defineProps<SplitterPanelProps>();
  const emits = defineEmits<SplitterPanelEmits>();

  const forwarded = useForwardPropsEmits(props, emits);
  const context = inject(SplitterContextKey, null);
</script>

<template>
  <RekaSplitterPanel v-slot="slotProps" v-bind="forwarded" :class="context?.ui.panel({ class: props.class })">
    <slot v-bind="slotProps" />
  </RekaSplitterPanel>
</template>

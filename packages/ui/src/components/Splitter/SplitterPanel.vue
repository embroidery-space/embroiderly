<script setup lang="ts">
  import type { SplitterPanelEmits as _SplitterPanelEmits, SplitterPanelProps as _SplitterPanelProps } from "reka-ui";
  import { useForwardPropsEmits } from "reka-ui";
  import { Splitter } from "reka-ui/namespaced";
  import { inject } from "vue";

  import { SplitterContextKey } from "./context.ts";

  export interface SplitterPanelProps extends _SplitterPanelProps {
    class?: any;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface SplitterPanelEmits extends _SplitterPanelEmits {}

  export interface SplitterPanelSlots {
    default(props: { isCollapsed: boolean; isExpanded: boolean }): any;
  }

  const props = defineProps<SplitterPanelProps>();
  const emits = defineEmits<SplitterPanelEmits>();

  const forwarded = useForwardPropsEmits(props, emits);
  const context = inject(SplitterContextKey, null);
</script>

<template>
  <Splitter.Panel v-slot="slotProps" v-bind="forwarded" :class="context?.ui.panel({ class: props.class })">
    <slot v-bind="slotProps" />
  </Splitter.Panel>
</template>

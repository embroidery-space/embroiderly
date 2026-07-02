<script setup lang="ts">
import { useForwardPropsEmits } from "reka-ui";
import type { SplitterPanelEmits as _SplitterPanelEmits, SplitterPanelProps as _SplitterPanelProps } from "reka-ui";
import { Splitter } from "reka-ui/namespaced";
import { inject, useTemplateRef } from "vue";

import { SplitterContextKey } from "./context.ts";

export interface SplitterPanelProps extends _SplitterPanelProps {
  class?: any;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SplitterPanelEmits extends _SplitterPanelEmits {}

export interface SplitterPanelSlots {
  default(props: {
    isCollapsed: boolean;
    isExpanded: boolean;
    collapse: () => void;
    expand: () => void;
    resize: (size: number) => void;
  }): any;
}

const props = defineProps<SplitterPanelProps>();
const emit = defineEmits<SplitterPanelEmits>();
defineSlots<SplitterPanelSlots>();

const forwarded = useForwardPropsEmits(props, emit);
const context = inject(SplitterContextKey, null);

const panelRef = useTemplateRef("panel");

defineExpose({
  collapse: () => panelRef.value?.collapse(),
  expand: () => panelRef.value?.expand(),
  getSize: () => panelRef.value?.getSize(),
  resize: (size: number) => panelRef.value?.resize(size),
  get isCollapsed() {
    return panelRef.value?.isCollapsed ?? false;
  },
  get isExpanded() {
    return panelRef.value?.isExpanded ?? true;
  },
});
</script>

<template>
  <Splitter.Panel
    ref="panel"
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="panel"
    :class="context?.ui.panel({ class: props.class })"
  >
    <slot v-bind="slotProps" />
  </Splitter.Panel>
</template>

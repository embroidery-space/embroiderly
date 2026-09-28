<script setup lang="ts">
import { useForwardPropsEmits } from "reka-ui";
import type { SplitterPanelEmits as _SplitterPanelEmits, SplitterPanelProps as _SplitterPanelProps } from "reka-ui";
import { Splitter } from "reka-ui/namespaced";
import { useTemplateRef } from "vue";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SplitterPanelProps extends _SplitterPanelProps {}

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
  <Splitter.Panel ref="panel" v-slot="slotProps" v-bind="forwarded" data-slot="panel">
    <slot v-bind="slotProps" />
  </Splitter.Panel>
</template>

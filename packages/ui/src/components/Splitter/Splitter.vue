<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { useForwardPropsEmits } from "reka-ui";
import type { SplitterGroupEmits, SplitterGroupProps } from "reka-ui";
import { Splitter } from "reka-ui/namespaced";
import { computed, Fragment } from "vue";
import type { VNode } from "vue";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SplitterProps extends SplitterGroupProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SplitterEmits extends SplitterGroupEmits {}

export interface SplitterSlots {
  default(): any;
}

const props = defineProps<SplitterProps>();
const emit = defineEmits<SplitterEmits>();
const slots = defineSlots<SplitterSlots>();

const forwarded = useForwardPropsEmits(
  reactivePick(props, "id", "direction", "autoSaveId", "keyboardResizeBy", "storage"),
  emit,
);

const panels = computed(() => flattenChildren(slots.default?.() ?? []));

function flattenChildren(children: VNode[]): VNode[] {
  return children.flatMap((child) => {
    if (child.type === Fragment && Array.isArray(child.children)) {
      return flattenChildren(child.children as VNode[]);
    }
    return [child];
  });
}
</script>

<template>
  <Splitter.Group v-bind="forwarded" data-slot="base">
    <template v-for="(panel, index) in panels" :key="index">
      <component :is="panel" data-slot="panel" />
      <Splitter.ResizeHandle v-if="index < panels.length - 1" data-slot="handle" :class="$style.handle" />
    </template>
  </Splitter.Group>
</template>

<style module>
.handle {
  border: 2px solid var(--border-color-default);
}
</style>

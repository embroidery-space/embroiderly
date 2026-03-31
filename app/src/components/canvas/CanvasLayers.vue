<script setup lang="ts">
import { Button, ButtonIcon, ContextMenu, Editable, Tree } from "@embroiderly/ui";
import type { ContextMenuItem, TreeItem } from "@embroiderly/ui";

import { insertNodeAt, removeNode, useSortable } from "@vueuse/integrations/useSortable";
import { computed, nextTick, watchEffect, useTemplateRef } from "vue";

import type { LayerVisibility } from "~/api/";
import {
  IconLayers,
  IconPlus,
  IconTrash,
  IconVisibility,
  IconVisibilityOff,
  IconStitchFull,
  IconStitchPetite,
  IconStitchHalf,
  IconStitchQuarter,
  IconStitchBack,
  IconStitchStraight,
  IconStitchFrenchKnot,
  IconStitchBead,
  IconStitchSpecial,
} from "~/assets/icons/";
import { useI18n } from "~/composables/";
import type { Layer } from "~/lib/pattern/";

interface LayerTreeItem extends TreeItem {
  index: number;
  visible: boolean;
  toggledVisibility: LayerVisibility;
  placeholder?: string;
}

export interface CanvasLayersProps {
  layers: Layer[];
}

export interface CanvasLayersEmits {
  addLayer: [];
  removeLayer: [index: number];
  renameLayer: [layerIndex: number, name: string];
  toggleLayerVisibility: [layerIndex: number, visibility: LayerVisibility];
  moveLayer: [oldPosition: number, newPosition: number];
}

const modelValue = defineModel<number>({ required: true });
const props = defineProps<CanvasLayersProps>();
const emits = defineEmits<CanvasLayersEmits>();

const treeContainer = useTemplateRef<HTMLElement>("tree-container");
const treeRootEl = computed(() => treeContainer.value?.querySelector<HTMLElement>('[role="tree"]') ?? null);

const { fluent } = useI18n();

// Stable layer keys so Tree's state (mainly, selection and expansion) follows layer objects across reorders.
const layerKeyMap = new WeakMap<Layer, string>();
let layerKeySeq = 0;

const layerItems = computed<LayerTreeItem[]>(() =>
  props.layers.map((layer, index) => {
    const visibility = layer.getVisibility();

    function getLayerKey(layer: Layer) {
      if (!layerKeyMap.has(layer)) layerKeyMap.set(layer, `layer-${layerKeySeq++}`);
      return layerKeyMap.get(layer)!;
    }

    return {
      index,
      label: layer.name,
      placeholder: fluent.$t("canvas-layers-placeholder", { index: index + 1 }),
      value: getLayerKey(layer),
      visible: visibility.visible,
      toggledVisibility: { ...visibility, visible: !visibility.visible },
      defaultExpanded: index === 0,
      onSelect() {
        modelValue.value = index;
      },
      children: [
        {
          index,
          label: fluent.$t("canvas-layers-fullstitches"),
          value: `${getLayerKey(layer)}-fullstitches`,
          icon: IconStitchFull,
          visible: visibility.fullstitchesVisible,
          toggledVisibility: { ...visibility, fullstitchesVisible: !visibility.fullstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-petitestitches"),
          value: `${getLayerKey(layer)}-petitestitches`,
          icon: IconStitchPetite,
          visible: visibility.petitestitchesVisible,
          toggledVisibility: { ...visibility, petitestitchesVisible: !visibility.petitestitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-halfstitches"),
          value: `${getLayerKey(layer)}-halfstitches`,
          icon: IconStitchHalf,
          visible: visibility.halfstitchesVisible,
          toggledVisibility: { ...visibility, halfstitchesVisible: !visibility.halfstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-quarterstitches"),
          value: `${getLayerKey(layer)}-quarterstitches`,
          icon: IconStitchQuarter,
          visible: visibility.quarterstitchesVisible,
          toggledVisibility: { ...visibility, quarterstitchesVisible: !visibility.quarterstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-specialstitches"),
          value: `${getLayerKey(layer)}-specialstitches`,
          icon: IconStitchSpecial,
          visible: visibility.specialstitchesVisible,
          toggledVisibility: { ...visibility, specialstitchesVisible: !visibility.specialstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-backstitches"),
          value: `${getLayerKey(layer)}-backstitches`,
          icon: IconStitchBack,
          visible: visibility.backstitchesVisible,
          toggledVisibility: { ...visibility, backstitchesVisible: !visibility.backstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-straightstitches"),
          value: `${getLayerKey(layer)}-straightstitches`,
          icon: IconStitchStraight,
          visible: visibility.straightstitchesVisible,
          toggledVisibility: { ...visibility, straightstitchesVisible: !visibility.straightstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-frenchknots"),
          value: `${getLayerKey(layer)}-frenchknots`,
          icon: IconStitchFrenchKnot,
          visible: visibility.frenchknotsVisible,
          toggledVisibility: { ...visibility, frenchknotsVisible: !visibility.frenchknotsVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-beads"),
          value: `${getLayerKey(layer)}-beads`,
          icon: IconStitchBead,
          visible: visibility.beadsVisible,
          toggledVisibility: { ...visibility, beadsVisible: !visibility.beadsVisible },
        },
      ],
    };
  }),
);

const contextMenuItems = computed<ContextMenuItem[]>(() => [
  {
    label: fluent.$t("canvas-layers-add"),
    icon: IconPlus,
    onSelect: () => emits("addLayer"),
  },
  {
    label: fluent.$t("canvas-layers-remove", { name: getLayerDisplayName(modelValue.value) }),
    icon: IconTrash,
    disabled: props.layers.length <= 1,
    onSelect: () => emits("removeLayer", modelValue.value),
  },
]);

function getLayerDisplayName(index: number) {
  return props.layers[index]!.name || fluent.$t("canvas-layers-placeholder", { index: index + 1 });
}

const { option: setSortableOption } = useSortable(treeRootEl, [], {
  animation: 100,
  disabled: true, // Sortable is disabled by default.
  forceFallback: true, // Use custom implementation instead of built-in HTML5 features.
  avoidImplicitDeselect: true, // Don't deselect items on click outside.
  watchElement: true, // Watch for the the provided element, as it is rendered conditionally, so its ref isn't resolved on setup.
  filter: '[role="treeitem"]:not([aria-level="1"])', // Ignore nested tree items (_stitch_ layers). Only top-level _custom_ layers should be draggable.
  onUpdate({ from, item, oldIndex, newIndex }) {
    if (oldIndex === undefined || newIndex === undefined) return;

    // Restore the original item positions in the DOM to let Vue to properly render the tree.
    removeNode(item);
    insertNodeAt(from, item, oldIndex);

    nextTick(() => emits("moveLayer", oldIndex, newIndex));
  },
});
watchEffect(() => {
  setSortableOption("disabled", props.layers.length <= 1);
});
</script>

<template>
  <div ref="tree-container" class="flex min-h-0 flex-col gap-1">
    <div class="flex items-center gap-1">
      <IconLayers class="m-2 size-5 shrink-0" />
      <span class="ms-1 flex-1 font-medium">{{ $t("canvas-layers") }}</span>

      <ButtonIcon
        color="neutral"
        variant="ghost"
        size="lg"
        :icon="IconPlus"
        :tooltip="$t('canvas-layers-add')"
        @click="$emit('addLayer')"
      />
      <ButtonIcon
        color="neutral"
        variant="ghost"
        size="lg"
        :icon="IconTrash"
        :disabled="layers.length <= 1"
        :tooltip="$t('canvas-layers-remove', { name: getLayerDisplayName(modelValue) })"
        @click="emits('removeLayer', modelValue)"
      />
    </div>

    <ContextMenu :items="contextMenuItems">
      <Tree
        :items="layerItems"
        :default-value="layerItems[modelValue]"
        :scroll="{ type: 'hover' }"
        size="lg"
        selection-behavior="replace"
      >
        <template #item-label="{ item, level }">
          <Editable
            v-if="level === 1"
            :model-value="item.label"
            :placeholder="item.placeholder"
            activation-mode="dblclick"
            submit-mode="both"
            class="w-full min-w-0"
            @submit="(value) => emits('renameLayer', item.index, value ?? '')"
          />
          <span v-else class="truncate">{{ item.label }}</span>
        </template>

        <template #item-trailing="{ item }">
          <Button
            square
            color="neutral"
            variant="ghost"
            size="sm"
            :icon="item.visible ? IconVisibility : IconVisibilityOff"
            @click.stop="emits('toggleLayerVisibility', item.index, item.toggledVisibility)"
          />
        </template>
      </Tree>
    </ContextMenu>
  </div>
</template>

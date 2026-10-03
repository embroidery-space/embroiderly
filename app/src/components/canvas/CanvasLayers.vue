<script setup lang="ts">
import { Button, ButtonIcon, ContextMenu, Editable, Tree } from "@embroiderly/ui";
import type { ContextMenuItem, TreeItem } from "@embroiderly/ui";

import { insertNodeAt, removeNode, useSortable } from "@vueuse/integrations/useSortable";
import { computed, nextTick, watchEffect, useTemplateRef } from "vue";

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
import type { LayerVisibility } from "~/lib/pattern/";
import type { Layer } from "~/lib/pattern/";

interface LayerTreeItem extends TreeItem {
  index: number;
  visible: boolean;
  toggledVisibility: LayerVisibility;
  placeholder?: string;
}

export interface CanvasLayersProps {
  layers: Layer[];
  disabled?: boolean;
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

const { fluent } = useI18n();

const layerItems = computed<LayerTreeItem[]>(() =>
  props.layers.map((layer) => {
    const visibility = layer.getVisibility();

    return {
      index: layer.index,
      label: layer.name,
      placeholder: fluent.$t("canvas-layers-placeholder", { index: layer.index + 1 }),
      value: `layer-${layer.index}`,
      visible: visibility.visible,
      toggledVisibility: { ...visibility, visible: !visibility.visible },
      defaultExpanded: layer.index === 0,
      onSelect() {
        modelValue.value = layer.index;
      },
      children: [
        {
          index: layer.index,
          label: fluent.$t("canvas-layers-full-stitches"),
          value: `layer-${layer.index}-fullstitches`,
          icon: IconStitchFull,
          visible: visibility.fullstitchesVisible,
          toggledVisibility: { ...visibility, fullstitchesVisible: !visibility.fullstitchesVisible },
          disabled: !visibility.visible,
        },
        {
          index: layer.index,
          label: fluent.$t("canvas-layers-petite-stitches"),
          value: `layer-${layer.index}-petitestitches`,
          icon: IconStitchPetite,
          visible: visibility.petitestitchesVisible,
          toggledVisibility: { ...visibility, petitestitchesVisible: !visibility.petitestitchesVisible },
          disabled: !visibility.visible,
        },
        {
          index: layer.index,
          label: fluent.$t("canvas-layers-half-stitches"),
          value: `layer-${layer.index}-halfstitches`,
          icon: IconStitchHalf,
          visible: visibility.halfstitchesVisible,
          toggledVisibility: { ...visibility, halfstitchesVisible: !visibility.halfstitchesVisible },
          disabled: !visibility.visible,
        },
        {
          index: layer.index,
          label: fluent.$t("canvas-layers-quarter-stitches"),
          value: `layer-${layer.index}-quarterstitches`,
          icon: IconStitchQuarter,
          visible: visibility.quarterstitchesVisible,
          toggledVisibility: { ...visibility, quarterstitchesVisible: !visibility.quarterstitchesVisible },
          disabled: !visibility.visible,
        },
        {
          index: layer.index,
          label: fluent.$t("canvas-layers-special-stitches"),
          value: `layer-${layer.index}-specialstitches`,
          icon: IconStitchSpecial,
          visible: visibility.specialstitchesVisible,
          toggledVisibility: { ...visibility, specialstitchesVisible: !visibility.specialstitchesVisible },
          disabled: !visibility.visible,
        },
        {
          index: layer.index,
          label: fluent.$t("canvas-layers-back-stitches"),
          value: `layer-${layer.index}-backstitches`,
          icon: IconStitchBack,
          visible: visibility.backstitchesVisible,
          toggledVisibility: { ...visibility, backstitchesVisible: !visibility.backstitchesVisible },
          disabled: !visibility.visible,
        },
        {
          index: layer.index,
          label: fluent.$t("canvas-layers-straight-stitches"),
          value: `layer-${layer.index}-straightstitches`,
          icon: IconStitchStraight,
          visible: visibility.straightstitchesVisible,
          toggledVisibility: { ...visibility, straightstitchesVisible: !visibility.straightstitchesVisible },
          disabled: !visibility.visible,
        },
        {
          index: layer.index,
          label: fluent.$t("canvas-layers-french-knots"),
          value: `layer-${layer.index}-frenchknots`,
          icon: IconStitchFrenchKnot,
          visible: visibility.frenchknotsVisible,
          toggledVisibility: { ...visibility, frenchknotsVisible: !visibility.frenchknotsVisible },
          disabled: !visibility.visible,
        },
        {
          index: layer.index,
          label: fluent.$t("canvas-layers-beads"),
          value: `layer-${layer.index}-beads`,
          icon: IconStitchBead,
          visible: visibility.beadsVisible,
          toggledVisibility: { ...visibility, beadsVisible: !visibility.beadsVisible },
          disabled: !visibility.visible,
        },
      ],
    };
  }),
);
const selectedLayerItem = computed(() => layerItems.value.find((item) => item.index === modelValue.value));
const selectedLayerDisplayName = computed(
  () => selectedLayerItem.value?.label || (selectedLayerItem.value?.placeholder ?? ""),
);

const contextMenuItems = computed<ContextMenuItem[]>(() => [
  {
    label: fluent.$t("canvas-layers-add"),
    icon: IconPlus,
    onSelect: () => emits("addLayer"),
  },
  {
    label: fluent.$t("canvas-layers-remove", { name: selectedLayerDisplayName.value }),
    icon: IconTrash,
    disabled: props.layers.length <= 1,
    onSelect: () => emits("removeLayer", modelValue.value),
  },
]);

const treeContainer = useTemplateRef<HTMLElement>("tree-container");
const treeRootEl = computed(() => treeContainer.value?.querySelector<HTMLElement>('[role="tree"]') ?? null);
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
  <div ref="tree-container" :class="$style.root">
    <div :class="$style.header">
      <IconLayers :class="[$style.icon, { [$style.disabled]: disabled }]" />
      <span :class="[$style.title, { [$style.disabled]: disabled }]">
        {{ $t("canvas-layers") }}
      </span>

      <ButtonIcon
        color="neutral"
        variant="ghost"
        :icon="IconPlus"
        :disabled="disabled"
        :tooltip="$t('canvas-layers-add')"
        @click="$emit('addLayer')"
      />
      <ButtonIcon
        color="neutral"
        variant="ghost"
        :icon="IconTrash"
        :disabled="disabled || layers.length <= 1"
        :tooltip="$t('canvas-layers-remove', { name: selectedLayerDisplayName })"
        @click="emits('removeLayer', modelValue)"
      />
    </div>

    <ContextMenu :items="contextMenuItems" :disabled="disabled">
      <Tree
        :items="layerItems"
        :default-value="selectedLayerItem"
        scroll
        :disabled="disabled"
        selection-behavior="replace"
      >
        <template #item-label="{ item, level }">
          <Editable
            v-if="level === 1"
            :model-value="item.label"
            :placeholder="item.placeholder"
            activation-mode="dblclick"
            submit-mode="both"
            :class="$style.editable"
            @submit="(value) => emits('renameLayer', item.index, value ?? '')"
          />
          <span v-else :class="$style.label">{{ item.label }}</span>
        </template>

        <template #item-trailing="{ item, disabled: itemDisabled }">
          <Button
            square
            color="neutral"
            variant="ghost"
            size="sm"
            :icon="item.visible ? IconVisibility : IconVisibilityOff"
            :disabled="itemDisabled"
            @click.stop="emits('toggleLayerVisibility', item.index, item.toggledVisibility)"
          />
        </template>
      </Tree>
    </ContextMenu>
  </div>
</template>

<style module>
.root {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 1);

  min-height: auto;

  @media (width >= 64rem) {
    min-height: 0;
  }
}

.header {
  display: flex;
  gap: calc(var(--spacing) * 1);
  align-items: center;
}

.icon {
  flex-shrink: 0;

  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
  margin: calc(var(--spacing) * 1.5);
}

.title {
  flex: 1;

  margin-inline-start: calc(var(--spacing) * 1);

  font-size: var(--text-sm);
  font-weight: 500;
}

.disabled {
  opacity: 75%;
}

.editable {
  width: 100%;
  min-width: 0;
}

.label {
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

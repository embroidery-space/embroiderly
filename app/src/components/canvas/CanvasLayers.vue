<script setup lang="ts">
import { Button, ButtonIcon, ScrollArea, Tree } from "@embroiderly/ui";
import type { TreeItem } from "@embroiderly/ui";

import { computed } from "vue";

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
}

export interface CanvasLayersProps {
  layers: Layer[];
}

export interface CanvasLayersEmits {
  addLayer: [];
  removeLayer: [index: number];
  toggleLayerVisibility: [layerIndex: number, visibility: LayerVisibility];
}

const modelValue = defineModel<number>({ required: true });
const props = defineProps<CanvasLayersProps>();
const emits = defineEmits<CanvasLayersEmits>();

const { fluent } = useI18n();

const layerItems = computed<LayerTreeItem[]>(() =>
  props.layers.map((layer, index) => {
    const visibility = layer.getVisibility();
    return {
      index,
      label: layer.name,
      value: `layer-${index}`,
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
          value: `layer-${index}-fullstitches`,
          icon: IconStitchFull,
          visible: visibility.fullstitchesVisible,
          toggledVisibility: { ...visibility, fullstitchesVisible: !visibility.fullstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-petitestitches"),
          value: `layer-${index}-petitestitches`,
          icon: IconStitchPetite,
          visible: visibility.petitestitchesVisible,
          toggledVisibility: { ...visibility, petitestitchesVisible: !visibility.petitestitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-halfstitches"),
          value: `layer-${index}-halfstitches`,
          icon: IconStitchHalf,
          visible: visibility.halfstitchesVisible,
          toggledVisibility: { ...visibility, halfstitchesVisible: !visibility.halfstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-quarterstitches"),
          value: `layer-${index}-quarterstitches`,
          icon: IconStitchQuarter,
          visible: visibility.quarterstitchesVisible,
          toggledVisibility: { ...visibility, quarterstitchesVisible: !visibility.quarterstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-specialstitches"),
          value: `layer-${index}-specialstitches`,
          icon: IconStitchSpecial,
          visible: visibility.specialstitchesVisible,
          toggledVisibility: { ...visibility, specialstitchesVisible: !visibility.specialstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-backstitches"),
          value: `layer-${index}-backstitches`,
          icon: IconStitchBack,
          visible: visibility.backstitchesVisible,
          toggledVisibility: { ...visibility, backstitchesVisible: !visibility.backstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-straightstitches"),
          value: `layer-${index}-straightstitches`,
          icon: IconStitchStraight,
          visible: visibility.straightstitchesVisible,
          toggledVisibility: { ...visibility, straightstitchesVisible: !visibility.straightstitchesVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-frenchknots"),
          value: `layer-${index}-frenchknots`,
          icon: IconStitchFrenchKnot,
          visible: visibility.frenchknotsVisible,
          toggledVisibility: { ...visibility, frenchknotsVisible: !visibility.frenchknotsVisible },
        },
        {
          index,
          label: fluent.$t("canvas-layers-beads"),
          value: `layer-${index}-beads`,
          icon: IconStitchBead,
          visible: visibility.beadsVisible,
          toggledVisibility: { ...visibility, beadsVisible: !visibility.beadsVisible },
        },
      ],
    };
  }),
);
</script>

<template>
  <div class="flex flex-col gap-1">
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
        :tooltip="$t('canvas-layers-remove')"
        @click="emits('removeLayer', modelValue)"
      />
    </div>

    <ScrollArea type="hover" class="min-h-0 flex-1">
      <Tree :items="layerItems" :default-value="layerItems[modelValue]" size="lg" selection-behavior="replace">
        <template #item-trailing="{ item }">
          <Button
            color="neutral"
            variant="ghost"
            size="sm"
            :icon="item.visible ? IconVisibility : IconVisibilityOff"
            @click.stop="emits('toggleLayerVisibility', item.index, item.toggledVisibility)"
          />
        </template>
      </Tree>
    </ScrollArea>
  </div>
</template>

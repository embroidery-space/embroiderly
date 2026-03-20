<script setup lang="ts">
import { ButtonIcon, ScrollArea, Tree } from "@embroiderly/ui";
import type { TreeItem } from "@embroiderly/ui";

import { computed } from "vue";

import {
  IconLayers,
  IconPlus,
  IconTrash,
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

export interface CanvasLayersProps {
  layers: Layer[];
}

export interface CanvasLayersEmits {
  addLayer: [];
  removeLayer: [index: number];
}

const modelValue = defineModel<number>({ required: true });
const props = defineProps<CanvasLayersProps>();
const emits = defineEmits<CanvasLayersEmits>();

const { fluent } = useI18n();

const layerItems = computed<TreeItem[]>(() =>
  props.layers.map((layer, index) => ({
    label: layer.name,
    value: `layer-${index}`,
    defaultExpanded: index === 0,
    onSelect() {
      modelValue.value = index;
    },
    children: [
      {
        label: fluent.$t("canvas-layers-fullstitches"),
        value: `layer-${index}-fullstitches`,
        icon: IconStitchFull,
      },
      {
        label: fluent.$t("canvas-layers-petitestitches"),
        value: `layer-${index}-petitestitches`,
        icon: IconStitchPetite,
      },
      {
        label: fluent.$t("canvas-layers-halfstitches"),
        value: `layer-${index}-halfstitches`,
        icon: IconStitchHalf,
      },
      {
        label: fluent.$t("canvas-layers-quarterstitches"),
        value: `layer-${index}-quarterstitches`,
        icon: IconStitchQuarter,
      },
      {
        label: fluent.$t("canvas-layers-specialstitches"),
        value: `layer-${index}-specialstitches`,
        icon: IconStitchSpecial,
      },
      {
        label: fluent.$t("canvas-layers-backstitches"),
        value: `layer-${index}-backstitches`,
        icon: IconStitchBack,
      },
      {
        label: fluent.$t("canvas-layers-straightstitches"),
        value: `layer-${index}-straightstitches`,
        icon: IconStitchStraight,
      },
      {
        label: fluent.$t("canvas-layers-frenchknots"),
        value: `layer-${index}-frenchknots`,
        icon: IconStitchFrenchKnot,
      },
      {
        label: fluent.$t("canvas-layers-beads"),
        value: `layer-${index}-beads`,
        icon: IconStitchBead,
      },
    ],
  })),
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
      <Tree :items="layerItems" :default-value="layerItems[modelValue]" size="lg" selection-behavior="replace" />
    </ScrollArea>
  </div>
</template>

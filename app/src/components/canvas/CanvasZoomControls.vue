<script lang="ts" setup>
import { Button, ButtonIcon, DropdownMenu, FormFieldGroup, InputNumber, Slider } from "@embroiderly/ui";
import type { DropdownMenuItem } from "@embroiderly/ui";

import { computed, ref, watch } from "vue";

import { IconChevronDown, IconZoomIn, IconZoomOut } from "~/assets/icons/";
import { useI18n } from "~/composables/";
import type { ZoomState } from "~/lib/types/";

const {
  modelValue: zoom,
  min = 0,
  max = 100,
  disabled = false,
} = defineProps<{
  modelValue: ZoomState;
  min?: number;
  max?: number;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  "update:model-value": [ZoomState];
}>();

const { fluent } = useI18n();

const lastNumericZoom = ref(typeof zoom === "number" ? zoom : 100);
watch(
  () => zoom,
  (value) => {
    if (typeof value === "number") {
      lastNumericZoom.value = value;
    }
  },
  { immediate: true },
);

const zoomOptions = computed<DropdownMenuItem[]>(() => [
  { label: fluent.$t("canvas-zoom-fit"), shortcut: "Control+0", onSelect: () => emit("update:model-value", "fit") },
  { label: fluent.$t("canvas-zoom-fit-width"), onSelect: () => emit("update:model-value", "fit-width") },
  { label: fluent.$t("canvas-zoom-fit-height"), onSelect: () => emit("update:model-value", "fit-height") },
]);

function zoomIn() {
  if (disabled) return;
  emit("update:model-value", Math.min(lastNumericZoom.value + 10, max));
}

function zoomOut() {
  if (disabled) return;
  emit("update:model-value", Math.max(lastNumericZoom.value - 10, min));
}
</script>

<template>
  <div :class="$style.root">
    <FormFieldGroup :class="$style.zoom">
      <InputNumber
        :model-value="lastNumericZoom"
        variant="outline"
        size="sm"
        :min="min"
        :max="max"
        :increment="false"
        :decrement="false"
        :disabled="disabled"
        :class="$style.zoomInput"
        @update:model-value="emit('update:model-value', $event!)"
      />

      <DropdownMenu :items="zoomOptions" :disabled="disabled">
        <Button color="neutral" variant="outline" size="sm" :icon="IconChevronDown" :disabled="disabled" />
      </DropdownMenu>
    </FormFieldGroup>

    <div :class="$style.controls">
      <ButtonIcon
        color="neutral"
        variant="ghost"
        :icon="IconZoomOut"
        size="sm"
        :tooltip="$t('canvas-zoom-out')"
        shortcut="Control+-"
        :delay-duration="200"
        :disabled="disabled"
        @click="zoomOut"
      />

      <Slider
        :model-value="lastNumericZoom"
        tooltip
        size="sm"
        :min="min"
        :max="max"
        :disabled="disabled"
        :class="$style.slider"
        @update:model-value="emit('update:model-value', $event as number)"
      />

      <ButtonIcon
        color="neutral"
        variant="ghost"
        :icon="IconZoomIn"
        size="sm"
        :tooltip="$t('canvas-zoom-in')"
        shortcut="Control+="
        :delay-duration="200"
        :disabled="disabled"
        @click="zoomIn"
      />
    </div>
  </div>
</template>

<style module>
.root {
  display: flex;
  column-gap: calc(var(--spacing) * 2);
  align-items: center;
}

.zoom {
  width: calc(var(--spacing) * 16);
}

.zoom input.zoom-input[data-slot="base"] {
  padding-inline: calc(var(--spacing) * 2);
}

.controls {
  display: flex;
  flex-grow: 1;
  column-gap: calc(var(--spacing) * 1);
  align-items: center;
}

.slider {
  flex-grow: 1;
}
</style>

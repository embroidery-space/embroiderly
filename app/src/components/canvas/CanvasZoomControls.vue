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
  <div class="flex items-center gap-x-2">
    <FormFieldGroup class="w-16">
      <InputNumber
        :model-value="lastNumericZoom"
        variant="outline"
        size="sm"
        :min="min"
        :max="max"
        :increment="false"
        :decrement="false"
        :disabled="disabled"
        :ui="{ base: 'ps-2 pe-2' }"
        @update:model-value="emit('update:model-value', $event!)"
      />

      <DropdownMenu :items="zoomOptions" :disabled="disabled">
        <Button color="neutral" variant="outline" size="sm" :icon="IconChevronDown" :disabled="disabled" />
      </DropdownMenu>
    </FormFieldGroup>

    <div class="flex grow items-center gap-x-1">
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
        class="grow"
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

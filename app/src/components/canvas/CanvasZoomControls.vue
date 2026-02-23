<script lang="ts" setup>
import { useShortcuts, extractShortcuts } from "@embroiderly/shortcuts";
import { Button, ButtonIcon, DropdownMenu, FormFieldGroup, InputNumber, Slider } from "@embroiderly/ui";
import type { DropdownMenuItem } from "@embroiderly/ui";

import { computed } from "vue";

import { useI18n } from "~/composables/";
import type { ZoomState } from "~/lib/pixi/";

const {
  modelValue: zoom,
  min = 0,
  max = 100,
} = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
}>();
const emit = defineEmits<{
  "update:model-value": [ZoomState];
}>();

const { fluent } = useI18n();

const zoomOptions = computed<DropdownMenuItem[]>(() => [
  { label: fluent.$t("canvas-zoom-fit"), shortcut: "Ctrl+0", onSelect: () => emit("update:model-value", "fit") },
  { label: fluent.$t("canvas-zoom-fit-width"), onSelect: () => emit("update:model-value", "fit-width") },
  { label: fluent.$t("canvas-zoom-fit-height"), onSelect: () => emit("update:model-value", "fit-height") },
]);

function zoomIn() {
  emit("update:model-value", Math.min(zoom + 10, max));
}

function zoomOut() {
  emit("update:model-value", Math.max(zoom - 10, min));
}

useShortcuts(extractShortcuts(zoomOptions));
useShortcuts({
  // Use `=` instead of `+` for defining a shortcut since `+` is triggered by the `Shift` key.
  "ctrl+=": zoomIn,
  "ctrl+-": zoomOut,
});
</script>

<template>
  <div class="flex items-center gap-x-2">
    <FormFieldGroup class="w-16">
      <InputNumber
        :model-value="zoom"
        variant="outline"
        size="sm"
        :min="min"
        :max="max"
        :increment="false"
        :decrement="false"
        :ui="{ base: 'ps-2 pe-2' }"
        @update:model-value="emit('update:model-value', $event!)"
      />

      <DropdownMenu :items="zoomOptions">
        <Button color="neutral" variant="outline" size="sm" icon="lucide:chevron-down" />
      </DropdownMenu>
    </FormFieldGroup>

    <div class="flex grow items-center gap-x-1">
      <ButtonIcon
        color="neutral"
        variant="ghost"
        icon="lucide:zoom-out"
        size="sm"
        :tooltip="$t('canvas-zoom-out')"
        shortcut="Ctrl+-"
        :delay-duration="200"
        @click="zoomOut"
      />

      <Slider
        :model-value="zoom"
        tooltip
        size="sm"
        :min="min"
        :max="max"
        class="grow"
        @update:model-value="emit('update:model-value', $event as number)"
      />

      <ButtonIcon
        color="neutral"
        variant="ghost"
        icon="lucide:zoom-out"
        size="sm"
        :tooltip="$t('canvas-zoom-in')"
        shortcut="Ctrl++"
        :delay-duration="200"
        @click="zoomIn"
      />
    </div>
  </div>
</template>

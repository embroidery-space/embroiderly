<script lang="ts" setup>
import { useShortcuts, extractShortcuts } from "@embroiderly/shortcuts";

import type { DropdownMenuItem } from "@nuxt/ui";
import { computed } from "vue";

import type { ZoomState } from "#pattern-editor/lib/pixi/";
import { useI18n } from "#shared/composables/";

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
  { label: fluent.$t("canvas-zoom-fit"), kbds: ["ctrl", "0"], onSelect: () => emit("update:model-value", "fit") },
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
  "ctrl_=": zoomIn,
  "ctrl_-": zoomOut,
});
</script>

<template>
  <div class="flex items-center gap-x-2">
    <UFieldGroup class="w-16">
      <UInputNumber
        :model-value="zoom"
        color="neutral"
        variant="outline"
        size="xs"
        :min="min"
        :max="max"
        :ui="{ base: 'ps-2 pe-2', increment: 'hidden', decrement: 'hidden' }"
        @update:model-value="emit('update:model-value', $event!)"
      />

      <UDropdownMenu :items="zoomOptions">
        <UButton color="neutral" variant="outline" size="xs" icon="i-lucide:chevron-down" />
      </UDropdownMenu>
    </UFieldGroup>

    <div class="flex grow items-center gap-x-1">
      <UTooltip :text="$t('canvas-zoom-out')" :delay-duration="200" :kbds="['ctrl', '-']">
        <UButton color="neutral" variant="ghost" icon="i-lucide:zoom-out" size="xs" @click="zoomOut" />
      </UTooltip>

      <USlider
        :model-value="zoom"
        tooltip
        size="xs"
        :min="min"
        :max="max"
        class="grow"
        @update:model-value="emit('update:model-value', $event as number)"
      />

      <UTooltip :text="$t('canvas-zoom-in')" :delay-duration="200" :kbds="['ctrl', '+']">
        <UButton color="neutral" variant="ghost" icon="i-lucide:zoom-in" size="xs" @click="zoomIn" />
      </UTooltip>
    </div>
  </div>
</template>

<template>
  <div class="flex items-center gap-x-2">
    <NuxtButtonGroup class="w-16">
      <NuxtInputNumber
        :model-value="zoom"
        color="neutral"
        variant="outline"
        size="xs"
        :min="min"
        :max="max"
        :ui="{ base: 'px-2', increment: 'hidden', decrement: 'hidden' }"
        @update:model-value="emit('update:model-value', $event)"
      />

      <NuxtDropdownMenu :items="zoomOptions">
        <NuxtButton color="neutral" variant="outline" size="xs" icon="i-lucide:chevron-down" />
      </NuxtDropdownMenu>
    </NuxtButtonGroup>

    <div class="grow flex items-center gap-x-1">
      <NuxtTooltip :text="fluent.$t('label-zoom-out')" :delay-duration="200" :kbds="['ctrl', '-']">
        <NuxtButton color="neutral" variant="ghost" icon="i-lucide:zoom-out" size="xs" @click="zoomOut" />
      </NuxtTooltip>

      <NuxtSlider
        :model-value="zoom"
        tooltip
        size="xs"
        :min="min"
        :max="max"
        class="grow"
        @update:model-value="emit('update:model-value', $event)"
      />

      <NuxtTooltip :text="fluent.$t('label-zoom-in')" :delay-duration="200" :kbds="['ctrl', '+']">
        <NuxtButton color="neutral" variant="ghost" icon="i-lucide:zoom-in" size="xs" @click="zoomIn" />
      </NuxtTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from "vue";
  import type { DropdownMenuItem } from "@nuxt/ui";
  import type { ZoomState } from "#/pixi/";

  const fluent = useFluent();

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

  const zoomOptions = computed<DropdownMenuItem[]>(() => [
    { label: fluent.$t("label-fit"), kbds: ["ctrl", "0"], onSelect: () => emit("update:model-value", "fit") },
    { label: fluent.$t("label-fit-width"), onSelect: () => emit("update:model-value", "fit-width") },
    { label: fluent.$t("label-fit-height"), onSelect: () => emit("update:model-value", "fit-height") },
  ]);

  function zoomIn() {
    emit("update:model-value", Math.min(zoom + 10, max));
  }

  function zoomOut() {
    emit("update:model-value", Math.max(zoom - 10, min));
  }

  defineShortcuts(extractShortcuts(zoomOptions.value));
  defineShortcuts({
    // Use `=` instead of `+` for defining a shortcut since `+` is triggered by the `Shift` key.
    "ctrl_=": zoomIn,
    "ctrl_-": zoomOut,
  });
</script>

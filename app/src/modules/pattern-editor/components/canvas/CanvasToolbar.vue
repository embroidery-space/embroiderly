<template>
  <div class="flex flex-col gap-1 p-1">
    <UPopover arrow :content="{ side: 'left', align: 'start' }" :ui="{ content: 'p-2' }">
      <UTooltip
        arrow
        :text="$t('canvas-toolbar-layers')"
        :delay-duration="200"
        :disabled="disabled"
        :content="{ side: 'left' }"
      >
        <UButton color="neutral" variant="ghost" icon="i-lucide:layers" :disabled="disabled" />
      </UTooltip>

      <template #content>
        <CanvasLayers v-model="layers" />
      </template>
    </UPopover>

    <USeparator />

    <ToolToggleGroup
      :model-value="patternStore.pattern?.displayMode"
      :options="displayModeOptions"
      :disabled="disabled"
      orientation="vertical"
      class="flex flex-col gap-1"
      @update:model-value="patternStore.setDisplayMode"
    />

    <USeparator />

    <ToolToggle
      v-model="showSymbols"
      icon="i-stitches:symbol"
      :label="showSymbols ? fluent.$t('canvas-toolbar-hide-symbols') : fluent.$t('canvas-toolbar-show-symbols')"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from "vue";

  import { DisplayMode, LayersVisibility } from "#pattern-editor/lib/pattern/";
  import { usePatternStore } from "#pattern-editor/stores/";
  import { useI18n } from "#shared/composables/";

  import { ToolToggle, ToolToggleGroup } from "../toolbar/";

  import CanvasLayers from "./CanvasLayers.vue";

  const { fluent } = useI18n();

  const patternStore = usePatternStore();

  const disabled = computed(() => patternStore.pattern === undefined);

  const layers = ref(new LayersVisibility(patternStore.pattern?.layersVisibility || LayersVisibility.default()));
  watch(layers, (newLayers) => patternStore.setLayersVisibility(newLayers), { deep: true });

  const displayModeOptions = computed(() => [
    { icon: "i-stitches:mix", label: fluent.$t("canvas-toolbar-view-as-mix"), value: DisplayMode.Mixed },
    { icon: "i-stitches:square", label: fluent.$t("canvas-toolbar-view-as-solid"), value: DisplayMode.Solid },
    { icon: "i-stitches:full", label: fluent.$t("canvas-toolbar-view-as-stitches"), value: DisplayMode.Stitches },
  ]);

  const showSymbols = computed({
    get: () => patternStore.pattern?.showSymbols ?? false,
    set: patternStore.showSymbols,
  });
</script>

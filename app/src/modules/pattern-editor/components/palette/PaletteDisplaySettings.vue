<template>
  <PaletteSection :title="$t('palette-display-options')">
    <div class="flex flex-col gap-y-2 p-2">
      <UFormField :label="$t('palette-columns-number')" class="w-full">
        <UInputNumber
          :model-value="props.settings.columnsNumber"
          orientation="vertical"
          :min="1"
          :max="8"
          class="w-full"
          @update:model-value="updateSettings('columnsNumber', $event!)"
        />
      </UFormField>

      <USwitch
        :model-value="props.settings.colorOnly"
        :label="$t('palette-color-only')"
        @update:model-value="updateSettings('colorOnly', $event)"
      />

      <div class="flex flex-col gap-y-1">
        <UCheckbox
          :model-value="props.settings.showStitchSymbols"
          :disabled="props.settings.colorOnly"
          :label="$t('palette-show-stitch-symbols')"
          @update:model-value="updateSettings('showStitchSymbols', $event as boolean)"
        />
        <UCheckbox
          :model-value="props.settings.stitchSymbolsOnContrastBackground"
          :disabled="props.settings.colorOnly || !props.settings.showStitchSymbols"
          :label="$t('palette-contrast-stitch-symbols')"
          @update:model-value="updateSettings('stitchSymbolsOnContrastBackground', $event as boolean)"
        />
        <UCheckbox
          :model-value="props.settings.showColorBrands"
          :disabled="props.settings.colorOnly"
          :label="$t('palette-show-brand')"
          @update:model-value="updateSettings('showColorBrands', $event as boolean)"
        />
        <UCheckbox
          :model-value="props.settings.showColorNumbers"
          :disabled="props.settings.colorOnly"
          :label="$t('palette-show-number')"
          @update:model-value="updateSettings('showColorNumbers', $event as boolean)"
        />
        <UCheckbox
          :model-value="props.settings.showColorNames"
          :disabled="props.settings.colorOnly"
          :label="$t('palette-show-name')"
          @update:model-value="updateSettings('showColorNames', $event as boolean)"
        />
      </div>
    </div>
  </PaletteSection>
</template>

<script setup lang="ts">
  import { PaletteSettings } from "~/pattern-editor/lib/pattern/";

  import { PaletteSection } from ".";

  const props = defineProps<{ settings: PaletteSettings }>();
  const emit = defineEmits<{ (event: "update:settings", data: PaletteSettings): void }>();

  function updateSettings<K extends keyof PaletteSettings>(key: K, value: PaletteSettings[K]) {
    emit("update:settings", new PaletteSettings({ ...props.settings, [key]: value }));
  }
</script>

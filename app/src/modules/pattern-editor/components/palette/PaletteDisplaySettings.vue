<script setup lang="ts">
import { Checkbox, FormField, InputNumber, Switch } from "@embroiderly/ui";

import { PaletteSettings } from "#pattern-editor/lib/pattern/";

import { PaletteSection } from ".";

const props = defineProps<{ settings: PaletteSettings }>();
const emit = defineEmits<{ "update:settings": [data: PaletteSettings] }>();

function updateSettings<K extends keyof PaletteSettings>(key: K, value: PaletteSettings[K]) {
  emit("update:settings", new PaletteSettings({ ...props.settings, [key]: value }));
}
</script>

<template>
  <PaletteSection :title="$t('palette-display-options')">
    <div class="flex flex-col gap-y-2 p-2">
      <FormField :label="$t('palette-columns-number')" class="w-full">
        <InputNumber
          :model-value="props.settings.columnsNumber"
          :min="1"
          :max="8"
          class="w-full"
          @update:model-value="updateSettings('columnsNumber', $event!)"
        />
      </FormField>

      <Switch
        :model-value="props.settings.colorOnly"
        :label="$t('palette-color-only')"
        @update:model-value="updateSettings('colorOnly', $event as boolean)"
      />

      <div class="flex flex-col gap-y-1">
        <Checkbox
          :model-value="props.settings.showStitchSymbols"
          :disabled="props.settings.colorOnly"
          :label="$t('palette-show-stitch-symbols')"
          @update:model-value="updateSettings('showStitchSymbols', $event as boolean)"
        />
        <Checkbox
          :model-value="props.settings.stitchSymbolsOnContrastBackground"
          :disabled="props.settings.colorOnly || !props.settings.showStitchSymbols"
          :label="$t('palette-contrast-stitch-symbols')"
          @update:model-value="updateSettings('stitchSymbolsOnContrastBackground', $event as boolean)"
        />
        <Checkbox
          :model-value="props.settings.showColorBrands"
          :disabled="props.settings.colorOnly"
          :label="$t('palette-show-brand')"
          @update:model-value="updateSettings('showColorBrands', $event as boolean)"
        />
        <Checkbox
          :model-value="props.settings.showColorNumbers"
          :disabled="props.settings.colorOnly"
          :label="$t('palette-show-number')"
          @update:model-value="updateSettings('showColorNumbers', $event as boolean)"
        />
        <Checkbox
          :model-value="props.settings.showColorNames"
          :disabled="props.settings.colorOnly"
          :label="$t('palette-show-name')"
          @update:model-value="updateSettings('showColorNames', $event as boolean)"
        />
      </div>
    </div>
  </PaletteSection>
</template>

<script setup lang="ts">
import { Checkbox, FormField, InputNumber, Switch } from "@embroiderly/ui";

import { PaletteSettings } from "~/lib/pattern/";

import { PaletteSection } from ".";

const props = defineProps<{ settings: PaletteSettings }>();
const emit = defineEmits<{ "update:settings": [data: PaletteSettings] }>();

function updateSettings<K extends keyof PaletteSettings>(key: K, value: PaletteSettings[K]) {
  emit("update:settings", new PaletteSettings({ ...props.settings, [key]: value }));
}
</script>

<template>
  <PaletteSection :title="$t('palette-display-options')">
    <div :class="$style.root">
      <FormField :label="$t('palette-columns-number')">
        <InputNumber
          :model-value="props.settings.columnsNumber"
          :min="1"
          :max="8"
          @update:model-value="updateSettings('columnsNumber', $event!)"
        />
      </FormField>

      <Switch
        :model-value="props.settings.colorOnly"
        :label="$t('palette-color-only')"
        @update:model-value="updateSettings('colorOnly', $event as boolean)"
      />

      <div :class="$style.checkboxes">
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

<style module>
.root {
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--spacing) * 2);

  padding: calc(var(--spacing) * 2);
}

.checkboxes {
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--spacing) * 1);
}
</style>

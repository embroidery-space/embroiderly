<template>
  <PaletteSection :title="$t('label-palette-display-options')">
    <div class="flex flex-col gap-y-2 p-2">
      <NuxtFormField :label="$t('label-display-options-columns-number')" class="w-full">
        <NuxtInputNumber
          :model-value="props.settings.columnsNumber"
          orientation="vertical"
          :min="1"
          :max="8"
          class="w-full"
          @update:model-value="(value) => updateSettings('columnsNumber', value)"
        />
      </NuxtFormField>

      <NuxtSwitch
        :model-value="props.settings.colorOnly"
        :label="$t('label-display-options-color-only')"
        @update:model-value="(value) => updateSettings('colorOnly', value)"
      />

      <div class="flex flex-col gap-y-1">
        <NuxtCheckbox
          :model-value="props.settings.showColorBrands"
          :disabled="props.settings.colorOnly"
          :label="$t('label-display-options-show-brand')"
          @update:model-value="(value) => updateSettings('showColorBrands', value as boolean)"
        />
        <NuxtCheckbox
          :model-value="props.settings.showColorNumbers"
          :disabled="props.settings.colorOnly"
          :label="$t('label-display-options-show-number')"
          @update:model-value="(value) => updateSettings('showColorNumbers', value as boolean)"
        />
        <NuxtCheckbox
          :model-value="props.settings.showColorNames"
          :disabled="props.settings.colorOnly"
          :label="$t('label-display-options-show-name')"
          @update:model-value="(value) => updateSettings('showColorNames', value as boolean)"
        />
      </div>
    </div>
  </PaletteSection>
</template>

<script setup lang="ts">
  import { PaletteSettings } from "#/core/pattern/";

  const props = defineProps<{ settings: PaletteSettings }>();
  const emit = defineEmits<{ (event: "update:settings", data: PaletteSettings): void }>();

  function updateSettings<K extends keyof PaletteSettings>(key: K, value: PaletteSettings[K]) {
    emit("update:settings", new PaletteSettings({ ...props.settings, [key]: value }));
  }
</script>

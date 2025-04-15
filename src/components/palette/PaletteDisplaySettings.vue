<template>
  <PaletteSection :title="$t('label-palette-display-options')" @close="emit('close')">
    <div class="flex flex-col gap-y-2 p-2 pt-6">
      <FloatLabel variant="over">
        <InputNumber
          id="columns-number"
          :model-value="props.settings.columnsNumber"
          show-buttons
          :allow-empty="false"
          :min="1"
          :max="8"
          @update:model-value="(value) => updateSettings('columnsNumber', value)"
        />
        <label for="columns-number">{{ $t("label-display-options-columns-number") }}</label>
      </FloatLabel>

      <label class="flex items-center gap-x-2">
        <ToggleSwitch
          :model-value="props.settings.colorOnly"
          @update:model-value="(value) => updateSettings('colorOnly', value)"
        />
        <span>{{ $t("label-display-options-color-only") }}</span>
      </label>

      <div class="flex flex-col gap-y-1">
        <label class="flex items-start gap-x-2">
          <Checkbox
            :model-value="props.settings.showColorBrands"
            :disabled="props.settings.colorOnly"
            binary
            @update:model-value="(value) => updateSettings('showColorBrands', value)"
          />
          <span>{{ $t("label-display-options-show-brand") }}</span>
        </label>

        <label class="flex items-start gap-x-2">
          <Checkbox
            :model-value="props.settings.showColorNumbers"
            :disabled="props.settings.colorOnly"
            binary
            @update:model-value="(value) => updateSettings('showColorNumbers', value)"
          />
          <span>{{ $t("label-display-options-show-number") }}</span>
        </label>

        <label class="flex items-start gap-x-2">
          <Checkbox
            :model-value="props.settings.showColorNames"
            :disabled="props.settings.colorOnly"
            binary
            @update:model-value="(value) => updateSettings('showColorNames', value)"
          />
          <span>{{ $t("label-display-options-show-name") }}</span>
        </label>
      </div>
    </div>
  </PaletteSection>
</template>

<script setup lang="ts">
  import { Checkbox, FloatLabel, InputNumber, ToggleSwitch } from "primevue";
  import { PaletteSettings } from "#/schemas/index.ts";
  import PaletteSection from "./PaletteSection.vue";

  const props = defineProps<{ settings: PaletteSettings }>();
  const emit = defineEmits<{ (event: "close"): void; (event: "update:settings", data: PaletteSettings): void }>();

  function updateSettings<K extends keyof PaletteSettings>(key: K, value: PaletteSettings[K]) {
    emit("update:settings", new PaletteSettings({ ...props.settings, [key]: value }));
  }
</script>

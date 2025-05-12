<template>
  <Fluid>
    <div class="grid grid-flow-row grid-cols-2 gap-x-3 gap-y-6">
      <FloatLabel variant="over">
        <Select id="theme" v-model="selectedTheme" :options="themeOptions">
          <template #value="{ value }">
            <div v-if="value" class="flex items-center">
              <i class="mr-4" :class="value.icon" />
              <span>{{ $t(`label-theme-${value.theme}`) }}</span>
            </div>
          </template>

          <template #option="{ option }">
            <div class="flex items-center">
              <i class="mr-4" :class="option.icon" />
              <span>{{ $t(`label-theme-${option.theme}`) }}</span>
            </div>
          </template>
        </Select>
        <label for="theme">{{ $t("label-theme") }}</label>
      </FloatLabel>

      <FloatLabel variant="over">
        <Select
          id="scale"
          v-model="preferencesStore.scale"
          :options="scaleOptions"
          :option-label="(value) => $t(`label-scale-${value}`)"
        />
        <label for="scale">{{ $t("label-scale") }}</label>
      </FloatLabel>

      <FloatLabel variant="over">
        <Select
          id="language"
          v-model="preferencesStore.language"
          option-label="label"
          option-value="code"
          :options="languageOptions"
        />
        <label for="language">{{ $t("label-language") }}</label>
      </FloatLabel>
    </div>
  </Fluid>

  <Fieldset :legend="$t('label-other')" toggleable>
    <label class="flex items-center gap-2">
      <Checkbox v-model="preferencesStore.usePaletteItemColorForStitchTools" binary />
      <span>{{ $t("label-use-palitem-color-for-stitch-tools") }}</span>
    </label>
  </Fieldset>
</template>

<script setup lang="ts">
  import { Checkbox, Fieldset, FloatLabel, Fluid, Select } from "primevue";
  import { usePreferencesStore } from "#/stores/preferences";
  import type { Theme, Language, Scale } from "#/stores/preferences";
  import { computed } from "vue";

  const preferencesStore = usePreferencesStore();

  const selectedTheme = computed({
    get: () => themeOptions.find((option) => option.theme === preferencesStore.theme)!,
    set: (option) => (preferencesStore.theme = option.theme),
  });

  const themeOptions: { theme: Theme; icon: string }[] = [
    { theme: "dark", icon: "i-prime:moon" },
    { theme: "light", icon: "i-prime:sun" },
    { theme: "system", icon: "i-prime:desktop" },
  ];
  const scaleOptions: Scale[] = ["xx-small", "x-small", "small", "medium", "large", "x-large", "xx-large"];
  const languageOptions: { label: string; code: Language }[] = [
    { label: "English", code: "en" },
    { label: "Українська", code: "uk" },
  ];
</script>

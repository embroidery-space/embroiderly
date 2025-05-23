<template>
  <Fluid>
    <div class="grid grid-flow-row grid-cols-2 gap-2">
      <FormElement id="theme" float :label="$t('label-theme')">
        <Select v-model="selectedTheme" :options="themeOptions">
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
      </FormElement>

      <FormElement id="scale" float :label="$t('label-scale')">
        <Select
          v-model="preferencesStore.scale"
          :options="scaleOptions"
          :option-label="(value) => $t(`label-scale-${value}`)"
        />
      </FormElement>

      <FormElement id="language" float :label="$t('label-language')">
        <Select
          v-model="preferencesStore.language"
          option-label="label"
          option-value="code"
          :options="languageOptions"
        />
      </FormElement>
    </div>
  </Fluid>

  <Fieldset toggleable :legend="$t('label-viewport')">
    <div class="flex flex-col gap-2">
      <Message severity="secondary" variant="simple" size="small" class="mb-2">
        {{ $t("message-viewport-hint") }}
      </Message>
      <FormElement id="viewport-antialias" :label="$t('label-viewport-antialias')">
        <Checkbox v-model="preferencesStore.viewport.antialias" binary />
      </FormElement>

      <Fluid>
        <div class="grid grid-flow-row grid-cols-2 gap-2">
          <FormElement id="wheel-action" float :label="$t('label-viewport-wheel-action')">
            <Select
              v-model="preferencesStore.viewport.wheelAction"
              :options="wheelActionOptions"
              :option-label="(value) => $t(`label-viewport-wheel-action-${value}`)"
            />
          </FormElement>
        </div>
      </Fluid>
    </div>
  </Fieldset>

  <Fieldset toggleable :legend="$t('label-other')">
    <FormElement id="palitem-color" :label="$t('label-use-palitem-color-for-stitch-tools')">
      <Checkbox v-model="preferencesStore.usePaletteItemColorForStitchTools" binary />
    </FormElement>
  </Fieldset>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { Checkbox, Fieldset, Fluid, Message, Select } from "primevue";
  import { usePreferencesStore } from "#/stores/preferences";
  import type { Theme, Language, Scale, WheelAction } from "#/stores/preferences";

  import FormElement from "#/components/form/FormElement.vue";

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

  const wheelActionOptions: WheelAction[] = ["zoom", "scroll"];
</script>

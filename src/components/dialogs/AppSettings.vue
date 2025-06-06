<template>
  <Fluid class="grid grid-flow-row grid-cols-2 gap-2">
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
        v-model="settingsStore.ui.scale"
        :options="scaleOptions"
        :option-label="(value) => $t(`label-scale-${value}`)"
      />
    </FormElement>

    <FormElement id="language" float :label="$t('label-language')">
      <Select v-model="settingsStore.ui.language" option-label="label" option-value="code" :options="languageOptions" />
    </FormElement>
  </Fluid>

  <Fieldset toggleable :legend="$t('label-viewport')">
    <div class="flex flex-col gap-2">
      <Message severity="secondary" variant="simple" size="small" class="mb-2">
        {{ $t("message-viewport-hint") }}
      </Message>

      <FormElement id="viewport-antialias" :label="$t('label-viewport-antialias')">
        <Checkbox v-model="settingsStore.viewport.antialias" binary />
      </FormElement>

      <Fluid class="grid grid-flow-row grid-cols-2 gap-2">
        <FormElement id="wheel-action" float :label="$t('label-viewport-wheel-action')">
          <Select
            v-model="settingsStore.viewport.wheelAction"
            :options="wheelActionOptions"
            :option-label="(value) => $t(`label-viewport-wheel-action-${value}`)"
          />
        </FormElement>
      </Fluid>
    </div>
  </Fieldset>

  <Fieldset toggleable :legend="$t('label-other')">
    <div class="flex flex-col gap-2">
      <Fluid class="grid grid-flow-row grid-cols-2 gap-2">
        <FormElement
          id="autosave-interval"
          float
          :label="$t('label-autosave-interval')"
          :hint="$t('message-autosave-interval-hint')"
        >
          <InputNumber
            v-model="settingsStore.other.autoSaveInterval"
            show-buttons
            :suffix="` ${$t('label-unit-min')}`"
            :min="0"
            :max="240"
          />
        </FormElement>
      </Fluid>

      <FormElement id="palitem-color" :label="$t('label-use-palitem-color-for-stitch-tools')">
        <Checkbox v-model="settingsStore.other.usePaletteItemColorForStitchTools" binary />
      </FormElement>
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { Checkbox, Fieldset, Fluid, InputNumber, Message, Select } from "primevue";
  import { useSettingsStore } from "#/stores/settings";
  import type { Theme, Language, Scale, WheelAction } from "#/stores/settings";

  import FormElement from "#/components/form/FormElement.vue";

  const settingsStore = useSettingsStore();

  const selectedTheme = computed({
    get: () => themeOptions.find((option) => option.theme === settingsStore.ui.theme)!,
    set: (option) => (settingsStore.ui.theme = option.theme),
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

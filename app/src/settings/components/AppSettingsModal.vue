<script setup lang="ts">
import { Button, Checkbox, Dialog, FormField, InputFile, InputNumber, Select, Tabs, useConfirm } from "@embroiderly/ui";
import type { TabsItem } from "@embroiderly/ui";

import { refAutoReset } from "@vueuse/core";
import { useFluent } from "fluent-vue";
import { computed } from "vue";

import { IconCheck, IconLaptop, IconMoon, IconSun } from "~/assets/icons/";
import { useEditor, useI18n } from "~/composables/";
import { LayerLayout, WheelAction } from "~/lib/types/";
import { StartupAction, useSettingsStore } from "~/settings/";

const settingsStore = useSettingsStore();

const confirm = useConfirm();
const { files } = useEditor();
const fluent = useFluent();
const i18n = useI18n();

const tabs = computed<TabsItem[]>(() => [
  { label: i18n.fluent.$t("settings-interface"), slot: "ui" },
  { label: i18n.fluent.$t("settings-startup"), slot: "startup" },
  { label: i18n.fluent.$t("settings-workarea"), slot: "workarea" },
  { label: i18n.fluent.$t("settings-updater"), slot: "updater" },
  { label: i18n.fluent.$t("settings-telemetry"), slot: "telemetry" },
  { label: i18n.fluent.$t("settings-other"), slot: "other" },
]);

const themeIcon = computed(() => themeOptions.value.find((item) => item!.value === settingsStore.ui.theme)?.icon);
const themeOptions = computed(() => [
  { label: i18n.fluent.$t("settings-theme-dark"), value: "dark", icon: IconMoon },
  { label: i18n.fluent.$t("settings-theme-light"), value: "light", icon: IconSun },
  { label: i18n.fluent.$t("settings-theme-system"), value: "system", icon: IconLaptop },
]);
const scaleOptions = computed(() => [
  { label: i18n.fluent.$t("settings-scale-xx-small"), value: "xx-small" },
  { label: i18n.fluent.$t("settings-scale-x-small"), value: "x-small" },
  { label: i18n.fluent.$t("settings-scale-small"), value: "small" },
  { label: i18n.fluent.$t("settings-scale-medium"), value: "medium" },
  { label: i18n.fluent.$t("settings-scale-large"), value: "large" },
  { label: i18n.fluent.$t("settings-scale-x-large"), value: "x-large" },
  { label: i18n.fluent.$t("settings-scale-xx-large"), value: "xx-large" },
]);
const languageOptions = computed(() => [
  { label: "English", value: "en" },
  { label: "Українська", value: "uk" },
]);

const startupActionOptions = computed(() => [
  { label: i18n.fluent.$t("settings-startup-action-nothing"), value: StartupAction.Nothing },
  { label: i18n.fluent.$t("settings-startup-action-new-pattern"), value: StartupAction.NewPattern },
  { label: i18n.fluent.$t("settings-startup-action-custom-template"), value: StartupAction.CustomTemplate },
]);

const wheelActionOptions = computed(() => [
  { label: i18n.fluent.$t("settings-workarea-viewport-wheel-action-zoom"), value: WheelAction.Zoom },
  { label: i18n.fluent.$t("settings-workarea-viewport-wheel-action-scroll"), value: WheelAction.Scroll },
]);

const layerLayoutOptions = computed(() => [
  { label: i18n.fluent.$t("settings-workarea-pattern-layer-layout-stitch-type"), value: LayerLayout.ByStitchType },
  { label: i18n.fluent.$t("settings-workarea-pattern-layer-layout-layer-order"), value: LayerLayout.ByLayerOrder },
]);

async function savePatternTemplate(file: File | undefined) {
  if (!file) return;

  const data = new Uint8Array(await file.arrayBuffer());

  if (settingsStore.startup.patternTemplate) {
    try {
      await files.deletePatternTemplate(settingsStore.startup.patternTemplate);
    } catch {
      // Ignore deletion errors (file may not exist).
    }
  }

  await files.savePatternTemplate(file.name, data);
  settingsStore.startup.patternTemplate = file.name;
}

const settingsReset = refAutoReset(false, 1000);
async function reset() {
  const accepted = await confirm.open(fluent.$ta("settings-reset-confirm")).result;
  if (accepted) {
    settingsStore.$reset();
    settingsReset.value = true;
  }
}
</script>

<template>
  <Dialog :title="$t('settings')">
    <template #body>
      <Tabs :items="tabs" orientation="vertical" color="neutral" :class="$style.tabs">
        <template #ui>
          <div :class="$style.fields">
            <FormField :label="$t('settings-theme')">
              <Select v-model="settingsStore.ui.theme" :items="themeOptions" :icon="themeIcon" />
            </FormField>

            <FormField :label="$t('settings-scale')">
              <Select v-model="settingsStore.ui.scale" :items="scaleOptions" />
            </FormField>

            <FormField :label="$t('settings-language')">
              <Select v-model="settingsStore.ui.language" :items="languageOptions" />
            </FormField>
          </div>
        </template>

        <template #startup>
          <div :class="$style.fields">
            <FormField :label="$t('settings-startup-action')">
              <Select v-model="settingsStore.startup.action" :items="startupActionOptions" />
            </FormField>

            <FormField :label="$t('settings-startup-template-path')">
              <InputFile
                accept=".embproj, .oxs, .xsd"
                :label="settingsStore.startup.patternTemplate"
                :disabled="settingsStore.startup.action !== StartupAction.CustomTemplate"
                @update:model-value="savePatternTemplate"
              />
            </FormField>
          </div>
        </template>

        <template #workarea>
          <div :class="$style.fields">
            <Checkbox
              v-model="settingsStore.canvas.renderOptions.antialias"
              v-bind="$ta('settings-workarea-rendering-antialias')"
            />

            <FormField :label="$t('settings-workarea-viewport-wheel-action')">
              <Select v-model="settingsStore.canvas.viewportOptions.wheelAction" :items="wheelActionOptions" />
            </FormField>

            <FormField :label="$t('settings-workarea-pattern-layer-layout')">
              <Select v-model="settingsStore.canvas.patternOptions.layerLayout" :items="layerLayoutOptions" />
            </FormField>
          </div>
        </template>

        <template #updater>
          <div :class="$style.stack">
            <Button
              :loading="settingsStore.loadingUpdate"
              :label="$t('updater-check-for-updates')"
              :class="$style.check"
              @click="() => settingsStore.checkForUpdates()"
            />
            <Checkbox v-model="settingsStore.updater.autoCheck" v-bind="$ta('settings-updater-auto-check')" />
          </div>
        </template>

        <template #telemetry>
          <div :class="$style.stack">
            <Checkbox v-model="settingsStore.telemetry.diagnostics" v-bind="$ta('settings-telemetry-diagnostics')" />
            <Checkbox v-model="settingsStore.telemetry.metrics" v-bind="$ta('settings-telemetry-metrics')" />
          </div>
        </template>

        <template #other>
          <div :class="$style.stack">
            <FormField v-bind="$ta('settings-autosave-interval')">
              <InputNumber v-model="settingsStore.other.autoSaveInterval" />
            </FormField>

            <Checkbox
              v-model="settingsStore.other.showOpenDemoPatternOption"
              :label="$t('settings-show-open-demo-pattern-option')"
            />

            <Checkbox
              v-model="settingsStore.other.usePaletteItemColorForStitchTools"
              :label="$t('settings-use-palitem-color-for-stitch-tools')"
            />
          </div>
        </template>
      </Tabs>
    </template>

    <template #footer>
      <Button
        color="neutral"
        variant="link"
        :icon="settingsReset ? IconCheck : undefined"
        :label="$t('settings-reset')"
        @click="reset"
      />
    </template>
  </Dialog>
</template>

<style module>
/* Outweighs the styles of `Tabs`. */
.tabs[data-slot="root"] {
  align-items: flex-start;

  [data-slot="list"] {
    align-items: flex-start;
    border-radius: 0;
    background-color: transparent;
  }
}

.fields {
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--spacing) * 2);
}

.stack > :not(:last-child) {
  margin-block-end: calc(var(--spacing) * 2);
}

/* Outweighs the size variants of `Button`. */
button.check[data-slot="base"] {
  justify-content: center;
  width: 100%;
}
</style>

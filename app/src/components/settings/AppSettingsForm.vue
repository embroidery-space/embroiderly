<script setup lang="ts">
import { Button, Checkbox, FilePicker, FormField, InputNumber, Select, Tabs } from "@embroiderly/ui";
import type { TabsItem } from "@embroiderly/ui";

import { computed } from "vue";

import { IconLaptop, IconMoon, IconSun } from "~/assets/icons/";
import { useEditor, useFilePicker, useI18n } from "~/composables/";
import { LayerLayout } from "~/lib/types/";
import { StartupAction, useSettingsStore } from "~/stores/";
import type {
  CanvasOptions,
  OtherOptions,
  StartupOptions,
  UiOptions,
  UpdaterOptions,
  TelemetryOptions,
} from "~/stores/";

const ui = defineModel<UiOptions>("ui", { required: true });
const startup = defineModel<StartupOptions>("startup", { required: true });
const canvas = defineModel<CanvasOptions>("canvas", { required: true });
const updater = defineModel<UpdaterOptions>("updater", { required: true });
const telemetry = defineModel<TelemetryOptions>("telemetry", { required: true });
const other = defineModel<OtherOptions>("other", { required: true });

const { files } = useEditor();
const { fluent } = useI18n();
const filePicker = useFilePicker();

const settingsStore = useSettingsStore();

const tabs = computed<TabsItem[]>(() => [
  { label: fluent.$t("settings-interface"), slot: "ui" },
  { label: fluent.$t("settings-startup"), slot: "startup" },
  { label: fluent.$t("settings-workarea"), slot: "workarea" },
  { label: fluent.$t("settings-updater"), slot: "updater" },
  { label: fluent.$t("settings-telemetry"), slot: "telemetry" },
  { label: fluent.$t("settings-other"), slot: "other" },
]);

const themeIcon = computed(() => themeOptions.value.find((item) => item!.value === ui.value.theme)?.icon);
const themeOptions = computed(() => [
  { label: fluent.$t("settings-theme-dark"), value: "dark", icon: IconMoon },
  { label: fluent.$t("settings-theme-light"), value: "light", icon: IconSun },
  { label: fluent.$t("settings-theme-system"), value: "system", icon: IconLaptop },
]);
const scaleOptions = computed(() => [
  { label: fluent.$t("settings-scale-xx-small"), value: "xx-small" },
  { label: fluent.$t("settings-scale-x-small"), value: "x-small" },
  { label: fluent.$t("settings-scale-small"), value: "small" },
  { label: fluent.$t("settings-scale-medium"), value: "medium" },
  { label: fluent.$t("settings-scale-large"), value: "large" },
  { label: fluent.$t("settings-scale-x-large"), value: "x-large" },
  { label: fluent.$t("settings-scale-xx-large"), value: "xx-large" },
]);
const languageOptions = computed(() => [
  { label: "English", value: "en" },
  { label: "Українська", value: "uk" },
]);

const startupActionOptions = computed(() => [
  { label: fluent.$t("settings-startup-action-nothing"), value: StartupAction.Nothing },
  { label: fluent.$t("settings-startup-action-new-pattern"), value: StartupAction.NewPattern },
  { label: fluent.$t("settings-startup-action-custom-template"), value: StartupAction.CustomTemplate },
]);

const wheelActionOptions = computed(() => [
  { label: fluent.$t("settings-workarea-viewport-wheel-action-zoom"), value: "zoom" },
  { label: fluent.$t("settings-workarea-viewport-wheel-action-scroll"), value: "scroll" },
]);

const layerLayoutOptions = computed(() => [
  { label: fluent.$t("settings-workarea-pattern-layer-layout-stitch-type"), value: LayerLayout.ByStitchType },
  { label: fluent.$t("settings-workarea-pattern-layer-layout-layer-order"), value: LayerLayout.ByLayerOrder },
]);

async function pickPatternTemplate() {
  const fileHandle = await filePicker.open({
    types: filePicker.filters.pattern,
    id: filePicker.ids.pattern,
  });
  if (!fileHandle) return;

  const file = await fileHandle.getFile();
  const data = new Uint8Array(await file.arrayBuffer());

  if (startup.value.patternTemplate) {
    try {
      await files.deletePatternTemplate(startup.value.patternTemplate);
    } catch {
      // Ignore deletion errors (file may not exist).
    }
  }

  await files.savePatternTemplate(file.name, data);
  startup.value.patternTemplate = file.name;
}
</script>

<template>
  <Tabs
    :items="tabs"
    orientation="vertical"
    color="neutral"
    size="lg"
    :ui="{
      root: 'items-start',
      list: 'items-start rounded-none bg-transparent',
    }"
  >
    <template #ui>
      <div class="flex flex-col gap-y-2">
        <FormField :label="$t('settings-theme')" class="w-full">
          <Select v-model="ui.theme" :items="themeOptions" :icon="themeIcon" class="w-full" />
        </FormField>

        <FormField :label="$t('settings-scale')" class="w-full">
          <Select v-model="ui.scale" :items="scaleOptions" class="w-full" />
        </FormField>

        <FormField :label="$t('settings-language')" class="w-full">
          <Select v-model="ui.language" :items="languageOptions" class="w-full" />
        </FormField>
      </div>
    </template>

    <template #startup>
      <div class="flex flex-col gap-y-2">
        <FormField :label="$t('settings-startup-action')" class="w-full">
          <Select v-model="startup.action" :items="startupActionOptions" class="w-full" />
        </FormField>

        <FormField :label="$t('settings-startup-template-path')" class="w-full">
          <FilePicker
            v-model="startup.patternTemplate"
            :disabled="startup.action !== StartupAction.CustomTemplate"
            class="w-full"
            @pick="pickPatternTemplate"
          />
        </FormField>
      </div>
    </template>

    <template #workarea>
      <div class="flex flex-col gap-y-2">
        <p class="text-sm text-neutral-300">{{ $t("settings-workarea-hint") }}</p>

        <Checkbox v-model="canvas.renderOptions.antialias" :label="$t('settings-workarea-rendering-antialias')" />

        <FormField :label="$t('settings-workarea-viewport-wheel-action')" class="w-full">
          <Select v-model="canvas.viewportOptions.wheelAction" :items="wheelActionOptions" class="w-full" />
        </FormField>

        <FormField :label="$t('settings-workarea-pattern-layer-layout')" class="w-full">
          <Select v-model="canvas.patternOptions.layerLayout" :items="layerLayoutOptions" class="w-full" />
        </FormField>
      </div>
    </template>

    <template #updater>
      <div class="space-y-2">
        <Button
          :loading="settingsStore.loadingUpdate"
          :label="$t('updater-check-for-updates')"
          class="w-full justify-center"
          @click="() => settingsStore.checkForUpdates()"
        />
        <Checkbox v-model="updater.autoCheck" v-bind="$ta('settings-updater-auto-check')" />
      </div>
    </template>

    <template #telemetry>
      <div class="space-y-2">
        <Checkbox v-model="telemetry.diagnostics" v-bind="$ta('settings-telemetry-diagnostics')" />
        <Checkbox v-model="telemetry.metrics" v-bind="$ta('settings-telemetry-metrics')" />
      </div>
    </template>

    <template #other>
      <div class="space-y-2">
        <FormField v-bind="$ta('settings-autosave-interval')" class="w-full">
          <InputNumber v-model="other.autoSaveInterval" class="w-full" />
        </FormField>

        <Checkbox v-model="other.showOpenDemoPatternOption" :label="$t('settings-show-open-demo-pattern-option')" />

        <Checkbox
          v-model="other.usePaletteItemColorForStitchTools"
          :label="$t('settings-use-palitem-color-for-stitch-tools')"
        />
      </div>
    </template>
  </Tabs>
</template>

<template>
  <UTabs
    :items="tabs"
    orientation="vertical"
    color="neutral"
    size="xl"
    :ui="{
      root: 'items-start',
      list: 'items-start bg-transparent rounded-none',
    }"
  >
    <template #ui>
      <div class="flex flex-col gap-y-2">
        <UFormField :label="$t('settings-theme')" class="w-full">
          <USelect v-model="ui.theme" :items="themeOptions" :icon="themeIcon" class="w-full" />
        </UFormField>

        <UFormField :label="$t('settings-scale')" class="w-full">
          <USelect v-model="ui.scale" :items="scaleOptions" class="w-full" />
        </UFormField>

        <UFormField :label="$t('settings-language')" class="w-full">
          <USelect v-model="ui.language" :items="languageOptions" class="w-full" />
        </UFormField>
      </div>
    </template>

    <template #viewport>
      <div class="flex flex-col gap-y-2">
        <p class="text-sm text-neutral-300">{{ $t("settings-viewport-hint") }}</p>

        <UCheckbox v-model="viewport.antialias" :label="$t('settings-viewport-antialias')" />

        <UFormField :label="$t('settings-viewport-wheel-action')" class="w-full">
          <USelect v-model="viewport.wheelAction" :items="wheelActionOptions" class="w-full" />
        </UFormField>
      </div>
    </template>

    <template #updater>
      <div class="space-y-2">
        <UButton
          :loading="settingsStore.loadingUpdate"
          :label="$t('updater-check-for-updates')"
          class="w-full justify-center"
          @click="() => settingsStore.checkForUpdates()"
        />
        <UCheckbox v-model="updater.autoCheck" v-bind="$ta('settings-updater-auto-check')" />
      </div>
    </template>

    <template #telemetry>
      <div class="space-y-2">
        <UCheckbox v-model="telemetry.diagnostics" v-bind="$ta('settings-telemetry-diagnostics')" />
        <UCheckbox v-model="telemetry.metrics" v-bind="$ta('settings-telemetry-metrics')" />
      </div>
    </template>

    <template #other>
      <div class="space-y-2">
        <UFormField v-bind="$ta('settings-autosave-interval')" class="w-full">
          <UInputNumber v-model="other.autoSaveInterval" orientation="vertical" class="w-full" />
        </UFormField>

        <UCheckbox
          v-model="other.usePaletteItemColorForStitchTools"
          :label="$t('settings-use-palitem-color-for-stitch-tools')"
        />
      </div>
    </template>
  </UTabs>
</template>

<script setup lang="ts">
  import type { TabsItem } from "@nuxt/ui";
  import { computed } from "vue";

  import { useI18n } from "#shared/composables/";
  import { useSettingsStore } from "#shared/stores/";
  import type { OtherOptions, UiOptions, UpdaterOptions, ViewportOptions, TelemetryOptions } from "#shared/stores/";

  const ui = defineModel<UiOptions>("ui", { required: true });
  const viewport = defineModel<ViewportOptions>("viewport", { required: true });
  const updater = defineModel<UpdaterOptions>("updater", { required: true });
  const telemetry = defineModel<TelemetryOptions>("telemetry", { required: true });
  const other = defineModel<OtherOptions>("other", { required: true });

  const { fluent } = useI18n();
  const settingsStore = useSettingsStore();

  const tabs = computed<TabsItem[]>(() => [
    { label: fluent.$t("settings-interface"), slot: "ui" },
    { label: fluent.$t("settings-viewport"), slot: "viewport" },
    { label: fluent.$t("settings-updater"), slot: "updater" },
    { label: fluent.$t("settings-telemetry"), slot: "telemetry" },
    { label: fluent.$t("settings-other"), slot: "other" },
  ]);

  const themeIcon = computed(() => themeOptions.value.find((item) => item!.value === ui.value.theme)?.icon);
  const themeOptions = computed(() => [
    { label: fluent.$t("settings-theme-dark"), value: "dark", icon: "i-lucide:moon" },
    { label: fluent.$t("settings-theme-light"), value: "light", icon: "i-lucide:sun" },
    { label: fluent.$t("settings-theme-system"), value: "system", icon: "i-lucide:laptop-minimal" },
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

  const wheelActionOptions = computed(() => [
    { label: fluent.$t("settings-viewport-wheel-action-zoom"), value: "zoom" },
    { label: fluent.$t("settings-viewport-wheel-action-scroll"), value: "scroll" },
  ]);
</script>

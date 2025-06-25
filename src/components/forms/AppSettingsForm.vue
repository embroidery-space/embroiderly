<template>
  <NuxtTabs
    :items="tabs"
    orientation="vertical"
    color="neutral"
    size="xl"
    :ui="{
      root: 'items-start',
      list: 'bg-transparent rounded-none',
    }"
  >
    <template #ui>
      <div class="flex flex-col gap-y-2">
        <NuxtFormField :label="$t('label-theme')" class="w-full">
          <NuxtSelect v-model="ui.theme" :items="themeOptions" :icon="themeIcon" class="w-full" />
        </NuxtFormField>

        <NuxtFormField :label="$t('label-scale')" class="w-full">
          <NuxtSelect v-model="ui.scale" :items="scaleOptions" class="w-full" />
        </NuxtFormField>

        <NuxtFormField :label="$t('label-language')" class="w-full">
          <NuxtSelect v-model="ui.language" :items="languageOptions" class="w-full" />
        </NuxtFormField>
      </div>
    </template>

    <template #viewport>
      <div class="flex flex-col gap-y-2">
        <p class="text-sm text-neutral-300">{{ $t("message-viewport-hint") }}</p>

        <NuxtCheckbox v-model="viewport.antialias" :label="$t('label-viewport-antialias')" />

        <NuxtFormField :label="$t('label-viewport-wheel-action')" class="w-full">
          <NuxtSelect v-model="viewport.wheelAction" :items="wheelActionOptions" class="w-full" />
        </NuxtFormField>
      </div>
    </template>

    <template #updater>
      <div class="flex flex-col gap-y-2">
        <NuxtButton
          :loading="settingsStore.loadingUpdate"
          :label="$t('label-check-for-updates')"
          class="w-full"
          @click="() => settingsStore.checkForUpdates()"
        />

        <NuxtCheckbox
          v-model="updater.autoCheck"
          :label="$t('label-auto-check-for-updates')"
          :description="$t('message-auto-check-for-updates-hint')"
        />
      </div>
    </template>

    <template #other>
      <div class="flex flex-col gap-y-2">
        <NuxtFormField
          :label="$t('label-autosave-interval')"
          :description="$t('message-autosave-interval-description')"
          class="w-full"
        >
          <NuxtInputNumber v-model="other.autoSaveInterval" orientation="vertical" class="w-full" />
        </NuxtFormField>

        <NuxtCheckbox
          v-model="other.usePaletteItemColorForStitchTools"
          :label="$t('label-use-palitem-color-for-stitch-tools')"
        />
      </div>
    </template>
  </NuxtTabs>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { TabsItem } from "@nuxt/ui";
  import type { OtherOptions, UiOptions, UpdaterOptions, ViewportOptions } from "#/stores/settings.ts";

  const ui = defineModel<UiOptions>("ui", { required: true });
  const viewport = defineModel<ViewportOptions>("viewport", { required: true });
  const updater = defineModel<UpdaterOptions>("updater", { required: true });
  const other = defineModel<OtherOptions>("other", { required: true });

  const fluent = useFluent();
  const settingsStore = useSettingsStore();

  const tabs = computed<TabsItem[]>(() => [
    { label: fluent.$t("label-interface"), slot: "ui" },
    { label: fluent.$t("label-viewport"), slot: "viewport" },
    { label: fluent.$t("label-updater"), slot: "updater" },
    { label: fluent.$t("label-other"), slot: "other" },
  ]);

  const themeIcon = computed(() => themeOptions.value.find((item) => item!.value === ui.value.theme)?.icon);
  const themeOptions = computed(() => [
    { label: fluent.$t("label-theme-dark"), value: "dark", icon: "i-lucide:moon" },
    { label: fluent.$t("label-theme-light"), value: "light", icon: "i-lucide:sun" },
    { label: fluent.$t("label-theme-system"), value: "system", icon: "i-lucide:laptop-minimal" },
  ]);
  const scaleOptions = computed(() => [
    { label: fluent.$t("label-scale-xx-small"), value: "xx-small" },
    { label: fluent.$t("label-scale-x-small"), value: "x-small" },
    { label: fluent.$t("label-scale-small"), value: "small" },
    { label: fluent.$t("label-scale-medium"), value: "medium" },
    { label: fluent.$t("label-scale-large"), value: "large" },
    { label: fluent.$t("label-scale-x-large"), value: "x-large" },
    { label: fluent.$t("label-scale-xx-large"), value: "xx-large" },
  ]);
  const languageOptions = computed(() => [
    { label: "English", value: "en" },
    { label: "Українська", value: "uk" },
  ]);

  const wheelActionOptions = computed(() => [
    { label: fluent.$t("label-viewport-wheel-action-zoom"), value: "zoom" },
    { label: fluent.$t("label-viewport-wheel-action-scroll"), value: "scroll" },
  ]);
</script>

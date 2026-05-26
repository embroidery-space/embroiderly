<script lang="ts" setup>
import { App, useToast } from "@embroiderly/ui";

import { useEventListener } from "@vueuse/core";
import { onMounted, onErrorCaptured, markRaw, watch } from "vue";

import {
  IconCheck,
  IconChevronUp,
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconLoaderCircle,
  IconLink,
  IconUnlink,
  IconMinus,
  IconPlus,
  IconExternalLink,
} from "~/assets/icons/";

import { AppHeader, AppMain } from "./components/";
import { useI18n } from "./composables/";
import { DiagnosticsService, LoggerService, MetricsService } from "./services";
import { useSettingsStore } from "./stores/";

const toast = useToast();
const { fluent, currentLocale } = useI18n();

const settingsStore = useSettingsStore();

watch(
  () => settingsStore.telemetry,
  (telemetry) => {
    DiagnosticsService.enabled = telemetry.diagnostics;
    MetricsService.enabled = telemetry.metrics;
  },
  { immediate: true },
);

watch(
  () => settingsStore.ui,
  (ui) => MetricsService.captureUiChanged(ui.theme, ui.scale, ui.language),
  { immediate: true },
);

useEventListener("beforeunload", () => MetricsService.captureAppExited());

onMounted(async () => {
  MetricsService.captureAppStarted();

  if (!__TAURI__) {
    const { useServiceWorker } = await import("~/composables/pwa/");
    useServiceWorker();
  }

  if (settingsStore.updater.autoCheck) {
    await settingsStore.checkForUpdates({ auto: true });
  }
});

onErrorCaptured((err, _component, info) => {
  // Log the error, notify the user, and let it be propagated further so that Sentry can handle it.
  LoggerService.error(`Error (${info}): ${err instanceof Error ? err.message : err}`);
  toast.add({ type: "background", color: "error", title: fluent.$t("error") });
});
</script>

<template>
  <App
    :locale="currentLocale"
    :icons="{
      check: markRaw(IconCheck),
      chevronUp: markRaw(IconChevronUp),
      chevronDown: markRaw(IconChevronDown),
      chevronRight: markRaw(IconChevronRight),
      close: markRaw(IconClose),
      external: markRaw(IconExternalLink),
      loading: markRaw(IconLoaderCircle),
      link: markRaw(IconLink),
      unlink: markRaw(IconUnlink),
      minus: markRaw(IconMinus),
      plus: markRaw(IconPlus),
    }"
  >
    <AppHeader class="h-10" />
    <AppMain class="h-[calc(100svh-(--spacing(10)))]" />
  </App>
</template>

<script lang="ts" setup>
import { App, useOverlay, useToast } from "@embroiderly/ui";

import { useEventListener, useLocalStorage } from "@vueuse/core";
import { randomInt } from "es-toolkit";
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

import AppHeader from "./components/AppHeader.vue";
import AppMain from "./components/AppMain.vue";
import { useI18n } from "./composables/";
import { useTour } from "./composables/core/";
import { DiagnosticsService, LoggerService, MetricsService } from "./services/";
import { TelemetryPrompt, useSettingsStore } from "./settings/";

const settingsStore = useSettingsStore();

const overlay = useOverlay();
const toast = useToast();
const tour = useTour();
const { fluent, currentLocale } = useI18n();

const telemetryPrompt = overlay.create(TelemetryPrompt);
const telemetryPromptShown = useLocalStorage("embroiderly-telemetry-prompt-shown", false);

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

  if (!tour.tourOffered.value) await tour.offer();
  else if (!telemetryPromptShown.value) {
    const delayMs = randomInt(1, 6) * 60 * 1000;
    setTimeout(async () => {
      if (settingsStore.telemetry.diagnostics && settingsStore.telemetry.metrics) return;

      const result = await telemetryPrompt.open().result;
      if (result) settingsStore.telemetry = result;

      telemetryPromptShown.value = true;
    }, delayMs);
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

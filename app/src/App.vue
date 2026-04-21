<script lang="ts" setup>
import { App, useToast } from "@embroiderly/ui";

import { UseDark } from "@vueuse/components";
import { onMounted, onErrorCaptured, markRaw } from "vue";

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
} from "~/assets/icons/";

import { AppHeader, AppMain } from "./components/";
import { useI18n } from "./composables/";
import { LoggerService } from "./services";
import { useSettingsStore } from "./stores/";

const toast = useToast();
const { fluent, currentLocale } = useI18n();

const settingsStore = useSettingsStore();

onMounted(async () => {
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
      loading: markRaw(IconLoaderCircle),
      link: markRaw(IconLink),
      unlink: markRaw(IconUnlink),
      minus: markRaw(IconMinus),
      plus: markRaw(IconPlus),
    }"
  >
    <UseDark>
      <AppHeader class="h-10" />
      <AppMain class="h-[calc(100vh-(--spacing(10)))]" />
    </UseDark>
  </App>
</template>

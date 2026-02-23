<script lang="ts" setup>
import { App, useToast } from "@embroiderly/ui";

import { onMounted, onErrorCaptured } from "vue";

import { useI18n } from "#shared/composables/";
import { LoggerService } from "#shared/services/";
import { useSettingsStore } from "#shared/stores/";

import PatternEditorPage from "./modules/pattern-editor/PatternEditorPage.vue";

const toast = useToast();
const { fluent, currentLocale } = useI18n();

const settingsStore = useSettingsStore();

async function checkForUpdates() {
  await settingsStore.$tauri.start();
  if (settingsStore.updater.autoCheck) {
    await settingsStore.checkForUpdates({ auto: true });
  }
}

onMounted(async () => {
  await checkForUpdates();
});

onErrorCaptured((err, _component, info) => {
  // Log the error, notify the user, and let it be propagated further so that Sentry can handle it.
  LoggerService.error(`Error (${info}): ${err instanceof Error ? err.message : err}`);
  toast.add({ type: "background", color: "error", title: fluent.$t("error") });
});
</script>

<template>
  <App :locale="currentLocale">
    <PatternEditorPage />
  </App>
</template>

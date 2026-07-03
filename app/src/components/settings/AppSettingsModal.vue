<script setup lang="ts">
import { Button, Dialog, useConfirm } from "@embroiderly/ui";

import { refAutoReset } from "@vueuse/core";
import { useFluent } from "fluent-vue";

import { IconCheck } from "~/assets/icons";
import { useSettingsStore } from "~/stores/";

import AppSettingsForm from "./AppSettingsForm.vue";

const settingsStore = useSettingsStore();

const confirm = useConfirm();
const fluent = useFluent();

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
      <AppSettingsForm
        v-model:ui="settingsStore.ui"
        v-model:startup="settingsStore.startup"
        v-model:canvas="settingsStore.canvas"
        v-model:updater="settingsStore.updater"
        v-model:telemetry="settingsStore.telemetry"
        v-model:other="settingsStore.other"
      />
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

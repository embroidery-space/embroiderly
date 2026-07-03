<script setup lang="ts">
import { Button, Checkbox, Dialog } from "@embroiderly/ui";

import { reactive } from "vue";

const emit = defineEmits<{
  close: [telemetry?: { diagnostics: boolean; metrics: boolean }];
}>();

const telemetry = reactive({ diagnostics: false, metrics: false });
</script>

<template>
  <Dialog :title="$t('telemetry-prompt')" :dismissible="false" :scroll="false">
    <template #body>
      <Checkbox v-model="telemetry.diagnostics" v-bind="$ta('settings-telemetry-diagnostics')" />
      <Checkbox v-model="telemetry.metrics" v-bind="$ta('settings-telemetry-metrics')" />
      <p class="mt-2 text-xs text-muted">{{ $t("telemetry-prompt-notice") }}</p>
    </template>

    <template #footer>
      <Button color="neutral" variant="ghost" :label="$t('telemetry-prompt-reject')" @click="emit('close')" />
      <Button
        :disabled="!(telemetry.diagnostics || telemetry.metrics)"
        :label="$t('telemetry-prompt-accept')"
        @click="emit('close', telemetry)"
      />
    </template>
  </Dialog>
</template>

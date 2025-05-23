<template>
  <div>
    <div :class="props.help ? 'flex items-center gap-x-2' : ''">
      <div v-if="props.float" class="pt-5">
        <FloatLabel variant="over">
          <slot :id="props.id" />
          <label :for="props.id">{{ props.label }}</label>
        </FloatLabel>
      </div>
      <div v-else class="flex items-center gap-x-2">
        <slot :id="props.id" />
        <label :for="props.id">{{ props.label }}</label>
      </div>
      <Button
        v-if="props.help"
        text
        rounded
        severity="secondary"
        size="small"
        icon="i-prime:question-circle"
        pt:root:class="size-6 p-0"
        :pt:root:style="{ color: $dt('message.secondary.simple.color').variable }"
        @click="openUrl(props.help)"
      />
    </div>
    <Message v-if="props.hint" severity="secondary" variant="simple" size="small">{{ props.hint }}</Message>
  </div>
</template>

<script setup lang="ts">
  import { $dt } from "@primeuix/themes";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { Button, FloatLabel, Message } from "primevue";

  interface FormElementProps {
    id: string;
    label: string;
    float?: boolean;
    hint?: string;
    help?: string;
  }

  const props = defineProps<FormElementProps>();
</script>

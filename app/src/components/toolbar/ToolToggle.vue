<script setup lang="ts">
import { Button, Tooltip } from "@embroiderly/ui";
import type { IconValue } from "@embroiderly/ui";

import { Toggle } from "reka-ui";

const value = defineModel<boolean>({ required: true });
defineProps<{ icon: IconValue; label?: string; disabled?: boolean }>();
</script>

<template>
  <Tooltip arrow :text="label" :delay-duration="200" :disabled="disabled" :content="{ side: 'left' }">
    <Toggle v-model="value" as-child>
      <Button
        color="neutral"
        variant="ghost"
        :icon="icon"
        :disabled="disabled"
        class="p-1.5 text-dimmed"
        :class="{ 'bg-elevated hover:bg-accented': value }"
        :ui="{ leadingIcon: 'size-5' }"
      />
    </Toggle>
  </Tooltip>
</template>

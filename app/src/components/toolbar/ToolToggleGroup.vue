<script setup lang="ts" generic="TValue extends AcceptableValue">
import { Button, Tooltip } from "@embroiderly/ui";
import type { IconValue } from "@embroiderly/ui";

import type { AcceptableValue } from "reka-ui";
import { ToggleGroup } from "reka-ui/namespaced";

interface ToolOption {
  icon: IconValue;
  label: string;
  value: TValue;
}

const value = defineModel<TValue>();
defineProps<{ options: ToolOption[]; orientation?: "vertical" | "horizontal"; disabled?: boolean }>();
</script>

<template>
  <ToggleGroup.Root v-model="value" :orientation="orientation" :disabled="disabled" type="single" class="flex gap-1">
    <!-- @vue-ignore -->
    <template v-for="(option, index) in options" :key="index">
      <Tooltip :text="option.label" :disabled="disabled" :delay-duration="200" :content="{ side: 'left' }">
        <ToggleGroup.Item :value="option.value" :disabled="disabled" as-child>
          <Button
            color="neutral"
            variant="ghost"
            :icon="option.icon"
            :disabled="disabled"
            class="p-1.5 text-dimmed"
            :class="{ 'bg-elevated hover:bg-accented': option.value === value }"
            :ui="{ leadingIcon: 'size-5' }"
          />
        </ToggleGroup.Item>
      </Tooltip>
    </template>
  </ToggleGroup.Root>
</template>

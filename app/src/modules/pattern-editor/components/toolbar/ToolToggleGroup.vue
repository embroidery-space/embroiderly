<template>
  <RToggleGroupRoot v-model="value" :orientation="orientation" :disabled="disabled" type="single" class="flex gap-1">
    <!-- @vue-ignore -->
    <template v-for="(option, index) in options" :key="index">
      <UTooltip arrow :text="option.label" :disabled="disabled" :delay-duration="200" :content="{ side: 'left' }">
        <RToggleGroupItem :value="option.value" :disabled="disabled" as-child>
          <template #default="{ pressed }">
            <UButton
              color="neutral"
              variant="ghost"
              :icon="option.icon"
              :disabled="disabled"
              class="p-1.5 text-dimmed"
              :class="{ 'bg-elevated hover:bg-accented': pressed }"
              :ui="{ leadingIcon: 'size-5' }"
            />
          </template>
        </RToggleGroupItem>
      </UTooltip>
    </template>
  </RToggleGroupRoot>
</template>

<script setup lang="ts" generic="TValue extends AcceptableValue">
  import type { AcceptableValue } from "reka-ui";

  interface ToolOption {
    icon: string;
    label: string;
    value: TValue;
  }

  const value = defineModel<TValue>();
  defineProps<{ options: ToolOption[]; orientation?: "vertical" | "horizontal"; disabled?: boolean }>();
</script>

<template>
  <NuxtTooltip arrow :text="option.label" :delay-duration="200" :disabled="props.disabled" :content="{ side: 'left' }">
    <NuxtButton
      color="neutral"
      :variant="'ghost'"
      :icon="option.icon"
      :disabled="disabled"
      class="p-1.5 text-dimmed"
      :class="{ 'bg-elevated hover:bg-accented': selected }"
      :ui="{ leadingIcon: 'size-5' }"
      @click="onChange"
    />
  </NuxtTooltip>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  interface ToolOption {
    label: string;
    icon: string;
  }

  const props = defineProps<{ modelValue: unknown; option: ToolOption; disabled?: boolean }>();
  const emit = defineEmits(["update:modelValue"]);

  const selected = computed(() => props.modelValue && !props.disabled);

  function onChange() {
    if (props.disabled) return;
    emit("update:modelValue", !props.modelValue);
  }
</script>

<template>
  <NuxtTooltip arrow :text="option.label" :delay-duration="200" :disabled="props.disabled" :content="{ side: 'left' }">
    <NuxtButton
      color="neutral"
      :variant="'ghost'"
      :disabled="disabled"
      class="p-1.5 text-dimmed"
      :class="{ 'bg-elevated hover:bg-accented': selected }"
      @click="onChange"
    >
      <NuxtIcon v-if="typeof option.icon === 'string'" :name="option.icon" />
      <div v-else class="size-6">
        <component :is="option.icon"></component></div
    ></NuxtButton>
  </NuxtTooltip>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  interface ToolOption {
    icon: unknown;
    label: string;
  }

  const props = defineProps<{ modelValue: unknown; option: ToolOption; disabled?: boolean }>();
  const emit = defineEmits(["update:modelValue"]);

  const selected = computed(() => props.modelValue && !props.disabled);

  function onChange() {
    if (props.disabled) return;
    emit("update:modelValue", !props.modelValue);
  }
</script>

<template>
  <UInput :model-value="hexColor" :maxlength="7" @update:model-value="emit('update:modelValue', $event!.slice(1))">
    <template #leading>
      <UPopover>
        <UButton size="xl" :style="{ backgroundColor: hexColor }" />
        <template #content>
          <UColorPicker :model-value="hexColor" @update:model-value="emit('update:modelValue', $event!.slice(1))" />
        </template>
      </UPopover>
    </template>
  </UInput>
</template>

<script lang="ts" setup>
  import { computed } from "vue";

  const props = defineProps<{ modelValue: string }>();
  const emit = defineEmits<{ "update:modelValue": [string] }>();

  const hexColor = computed(() => (props.modelValue.startsWith("#") ? props.modelValue : `#${props.modelValue}`));
</script>

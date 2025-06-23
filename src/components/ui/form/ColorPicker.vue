<template>
  <NuxtInput :model-value="hexColor" :maxlength="7" @update:model-value="emit('update:modelValue', $event!.slice(1))">
    <template #leading>
      <NuxtPopover>
        <NuxtButton size="xl" :style="{ backgroundColor: hexColor }" />
        <template #content>
          <NuxtColorPicker :model-value="hexColor" @update:model-value="emit('update:modelValue', $event!.slice(1))" />
        </template>
      </NuxtPopover>
    </template>
  </NuxtInput>
</template>

<script lang="ts" setup>
  import { computed } from "vue";

  const props = defineProps<{ modelValue: string }>();
  const emit = defineEmits<{ "update:modelValue": [string] }>();

  const hexColor = computed(() => (props.modelValue.startsWith("#") ? props.modelValue : `#${props.modelValue}`));
</script>

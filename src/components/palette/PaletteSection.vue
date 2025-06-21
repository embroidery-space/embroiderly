<template>
  <div class="grid grid-rows-[auto_1fr]">
    <div class="flex flex-none items-center justify-between border-b border-default px-2 py-1">
      <span class="text-nowrap">{{ props.title }}</span>
      <UButton variant="ghost" color="neutral" icon="i-prime:times" @click="emit('close')" />
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{ title: string }>();
  const emit = defineEmits<{ close: [] }>();
</script>

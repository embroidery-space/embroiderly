<template>
  <UTooltip arrow :text="label" :delay-duration="200" :disabled="disabled" :content="{ side: 'left' }">
    <RToggle v-model="value" as-child>
      <UButton
        color="neutral"
        variant="ghost"
        :icon="icon"
        :disabled="disabled"
        class="p-1.5 text-dimmed"
        :class="{ 'bg-elevated hover:bg-accented': value }"
        :ui="{ leadingIcon: 'size-5' }"
      />
    </RToggle>
  </UTooltip>
</template>

<script setup lang="ts">
  const value = defineModel<boolean>({ required: true });
  defineProps<{ icon: string; label?: string; disabled?: boolean }>();
</script>

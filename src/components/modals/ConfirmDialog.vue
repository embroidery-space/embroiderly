<template>
  <UModal :title="props.title">
    <template #body>
      <p class="whitespace-pre-line">{{ props.message }}</p>
    </template>
    <template #footer>
      <UButton
        v-if="props.rejectLabel !== null"
        :label="props.rejectLabel ?? $t('label-no')"
        color="neutral"
        variant="outline"
        @click="emit('close', false)"
      />
      <UButton
        v-if="props.acceptLabel !== null"
        :label="props.acceptLabel ?? $t('label-yes')"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>

<script lang="ts" setup>
  interface ConfirmDialogProps {
    title?: string;
    message: string;
    acceptLabel?: string | null;
    rejectLabel?: string | null;
  }

  const props = defineProps<ConfirmDialogProps>();
  const emit = defineEmits<{
    close: [accepted?: boolean];
  }>();
</script>

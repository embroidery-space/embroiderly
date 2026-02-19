<script lang="ts" setup>
import type { ButtonProps } from "@nuxt/ui";

interface ConfirmDialogProps {
  /** Confirm dialog title. */
  title?: string;
  /** Confirm dialog description. */
  description?: string;
  /**
   * Confirm dialog "Yes" button props.
   * If `null`, the button is hidden.
   */
  yesButton?: ButtonProps | null;
  /**
   * Confirm dialog "No" button props.
   * If `null`, the button is hidden.
   */
  noButton?: ButtonProps | null;
}

const props = defineProps<ConfirmDialogProps>();
const emit = defineEmits<{
  close: [value?: boolean];
}>();
</script>

<template>
  <UModal :dismissible="false" :title="props.title" @close:prevent="emit('close')">
    <template v-if="props.description" #body>
      <p class="whitespace-pre-line">{{ props.description }}</p>
    </template>
    <template #footer>
      <UButton variant="outline" color="neutral" :label="$t('modal-cancel')" @click="emit('close')" />
      <UButton
        v-if="props.noButton !== null"
        variant="soft"
        color="neutral"
        :label="$t('confirm-no')"
        v-bind="props.noButton"
        @click="emit('close', false)"
      />
      <UButton
        v-if="props.yesButton !== null"
        variant="solid"
        color="primary"
        :label="$t('confirm-yes')"
        v-bind="props.yesButton"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>

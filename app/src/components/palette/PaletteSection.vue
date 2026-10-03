<script setup lang="ts">
import { Button } from "@embroiderly/ui";

import { useId } from "vue";

import { IconClose } from "~/assets/icons/";

const props = defineProps<{ title: string }>();
const emit = defineEmits<{ close: [] }>();

const sectionId = useId();
</script>

<template>
  <div :aria-labelledby="sectionId" :class="$style.root">
    <div :class="$style.header">
      <span :id="sectionId" :class="$style.title">{{ props.title }}</span>
      <Button
        square
        variant="ghost"
        color="neutral"
        :icon="IconClose"
        :aria-label="$t('modal-close')"
        @click="emit('close')"
      />
    </div>
    <slot></slot>
  </div>
</template>

<style module>
.root {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-block: calc(var(--spacing) * 1);
  padding-inline: calc(var(--spacing) * 2);
  border-bottom: 1px solid var(--border-color-default);
}

.title {
  font-size: var(--text-sm);
  text-wrap: nowrap;
}
</style>

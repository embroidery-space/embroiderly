<script setup lang="ts">
import { Button } from "@embroiderly/ui";

import { IconX } from "~/assets/icons/";

const props = defineProps<{ title: string }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center justify-between border-b border-default px-2 py-1">
      <span class="text-nowrap">{{ props.title }}</span>
      <Button variant="ghost" color="neutral" :icon="IconX" @click="emit('close')" />
    </div>
    <slot></slot>
  </div>
</template>

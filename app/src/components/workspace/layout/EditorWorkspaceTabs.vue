<script setup lang="ts">
import { Button, Tabs } from "@embroiderly/ui";

import { IconClose } from "~/assets/icons/";
import { usePatternFileStore, usePatternStore } from "~/stores/";

const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
</script>

<template>
  <Tabs
    :model-value="patternStore.pattern?.id"
    :items="patternFileStore.openedPatterns.map(({ id, title }) => ({ label: title, value: id }))"
    :content="false"
    color="neutral"
    activation-mode="manual"
    :ui="{
      root: 'border-b border-default',
      list: 'rounded-none bg-transparent p-0',
      indicator: 'inset-0 z-0 h-full rounded-none shadow-none',
      trigger:
        'min-w-20 grow-0 rounded-none border-default hover:cursor-pointer data-[state=inactive]:border-r hover:data-[state=inactive]:bg-accented',
    }"
    @update:model-value="patternFileStore.switchPattern($event as string)"
  >
    <template #trailing="{ item }">
      <Button
        size="sm"
        variant="ghost"
        :icon="IconClose"
        class="p-0"
        :class="{
          'text-inverted': patternStore.pattern?.id === item.value,
          'text-default': patternStore.pattern?.id !== item.value,
        }"
        @click.stop="patternFileStore.closePattern(item.value as string)"
      />
    </template>
  </Tabs>
</template>

<script setup lang="ts">
import { Button, Tabs } from "@embroiderly/ui";

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
      list: 'bg-transparent p-0 rounded-none',
      indicator: 'h-full inset-0 rounded-none shadow-none z-0',
      trigger:
        'grow-0 min-w-20 hover:data-[state=inactive]:bg-accented hover:cursor-pointer data-[state=inactive]:border-r border-default rounded-none',
    }"
    @update:model-value="patternFileStore.switchPattern($event as string)"
  >
    <template #trailing="{ item }">
      <Button
        size="sm"
        variant="ghost"
        icon="lucide:x"
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

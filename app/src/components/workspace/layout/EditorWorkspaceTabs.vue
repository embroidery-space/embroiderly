<script setup lang="ts">
import { Button, ButtonIcon, Tabs } from "@embroiderly/ui";

import { IconPanelLeft, IconPanelRight, IconX } from "~/assets/icons/";
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
      list: 'bg-transparent p-0 rounded-none border-x border-default [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      indicator: 'h-full inset-0 rounded-none shadow-none',
      trigger:
        'h-full min-w-20 hover:data-[state=inactive]:bg-accented data-[state=inactive]:border-r border-default rounded-none',
    }"
    @update:model-value="patternFileStore.switchPattern($event as string)"
  >
    <template #list-leading>
      <ButtonIcon
        color="neutral"
        variant="ghost"
        size="lg"
        :icon="IconPanelLeft"
        tooltip="Hide left panel"
        class="rounded-none"
      />
    </template>

    <template #trailing="{ item }">
      <Button
        size="sm"
        variant="ghost"
        :icon="IconX"
        class="p-0"
        :class="{
          'text-inverted': patternStore.pattern?.id === item.value,
          'text-default': patternStore.pattern?.id !== item.value,
        }"
        @click.stop="patternFileStore.closePattern(item.value as string)"
      />
    </template>

    <template #list-trailing>
      <ButtonIcon
        color="neutral"
        variant="ghost"
        size="lg"
        :icon="IconPanelRight"
        tooltip="Hide right panel"
        class="rounded-none"
      />
    </template>
  </Tabs>
</template>

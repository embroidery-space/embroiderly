<script setup lang="ts">
import { useRouter } from "vue-router";

import { usePatternFileStore, usePatternStore } from "#pattern-editor/stores";

const router = useRouter();

const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();

function switchPattern(patternId: string) {
  router.push({ name: "pattern-editor", params: { patternId } });
}

async function closePattern(patternId: string) {
  await patternFileStore.closePattern(patternId);

  const openedPatternsNumber = patternFileStore.openedPatterns.length;
  const lastPatternId = patternFileStore.openedPatterns[openedPatternsNumber - 1]?.id;

  router.push({ name: "pattern-editor", params: { patternId: lastPatternId } });
}
</script>

<template>
  <UTabs
    :model-value="patternStore.pattern?.id"
    :items="patternFileStore.openedPatterns.map(({ id, title }) => ({ label: title, value: id }))"
    :content="false"
    color="neutral"
    activation-mode="manual"
    :ui="{
      root: 'block border-b border-default',
      list: 'bg-transparent p-0',
      indicator: 'h-full inset-0 rounded-b-none rounded-tl-none shadow-none z-0',
      trigger: [
        'grow-0 min-w-20 hover:data-[state=inactive]:bg-accented hover:cursor-pointer',
        'data-[state=inactive]:border-r border-default rounded-b-none rounded-tl-none',
      ],
    }"
    @update:model-value="switchPattern($event as string)"
  >
    <template #trailing="{ item }">
      <UButton
        size="xs"
        variant="ghost"
        icon="i-lucide:x"
        class="p-0"
        :class="{
          'text-inverted': patternStore.pattern?.id === item.value,
          'text-default': patternStore.pattern?.id !== item.value,
        }"
        @click.stop="closePattern(item.value)"
      />
    </template>
  </UTabs>
</template>

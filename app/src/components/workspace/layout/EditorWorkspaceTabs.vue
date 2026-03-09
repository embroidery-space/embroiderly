<script setup lang="ts">
import { Button, ButtonIcon, Tabs } from "@embroiderly/ui";

import {
  IconPanelLeftClose,
  IconPanelLeftOpen,
  IconPanelRightClose,
  IconPanelRightOpen,
  IconClose,
} from "~/assets/icons/";
import { useEditorStateStore, usePatternFileStore, usePatternStore } from "~/stores/";

const editorStateStore = useEditorStateStore();
const patternStore = usePatternStore();
const patternFileStore = usePatternFileStore();
</script>

<template>
  <Tabs
    :model-value="patternStore.pattern?.id"
    :items="patternFileStore.openedPatterns.map(({ id, title, dirty }) => ({ label: title, value: id, dirty }))"
    :content="false"
    color="neutral"
    activation-mode="manual"
    :ui="{
      list: 'rounded-none border-x border-default bg-transparent p-0',
      indicator: 'inset-0 h-full rounded-none shadow-none',
      trigger:
        'h-full min-w-20 rounded-none border-default data-[state=inactive]:border-r hover:data-[state=inactive]:bg-accented',
    }"
    @update:model-value="patternFileStore.switchPattern($event as string)"
  >
    <template #leading="{ item }">
      <!-- @vue-expect-error Tabs items currently don't inherit the provided type. -->
      <!-- eslint-disable-next-line vue-i18n/no-raw-text -->
      <span class="text-xs" :class="{ invisible: !item.dirty }">●</span>
    </template>

    <template #list-leading>
      <ButtonIcon
        color="neutral"
        variant="ghost"
        size="lg"
        :icon="editorStateStore.palettePanelCollapsed ? IconPanelLeftOpen : IconPanelLeftClose"
        :tooltip="editorStateStore.palettePanelCollapsed ? $t('palette-panel-expand') : $t('palette-panel-collapse')"
        class="rounded-none px-3"
        @click="editorStateStore.palettePanelCollapsed = !editorStateStore.palettePanelCollapsed"
      />
    </template>

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

    <template #list-trailing>
      <ButtonIcon
        color="neutral"
        variant="ghost"
        size="lg"
        :icon="editorStateStore.canvasPanelCollapsed ? IconPanelRightOpen : IconPanelRightClose"
        :tooltip="editorStateStore.canvasPanelCollapsed ? $t('canvas-panel-expand') : $t('canvas-panel-collapse')"
        class="rounded-none px-3"
        @click="editorStateStore.canvasPanelCollapsed = !editorStateStore.canvasPanelCollapsed"
      />
    </template>
  </Tabs>
</template>

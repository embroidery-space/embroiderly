<script setup lang="ts">
import { useShortcuts, extractShortcuts, ShortcutsSeparator } from "@embroiderly/shortcuts";

import type { DropdownMenuItem } from "@nuxt/ui";
import { unrefElement } from "@vueuse/core";
import { ref, computed, toRaw, useTemplateRef, watch } from "vue";
import type { MaybeRefOrGetter } from "vue";

export interface ToolSelectItem {
  value: unknown;
  label: string;
  icon: string;
  kbds?: string[];
}

const props = withDefaults(
  defineProps<{
    modelValue: unknown;
    items: ToolSelectItem[];
    disabled?: boolean;
    selectionColor?: string;
  }>(),
  {
    disabled: false,
    selectionColor: "var(--text-dimmed)",
  },
);
const emit = defineEmits<{
  "update:modelValue": [value: unknown];
}>();

const items = computed<DropdownMenuItem[]>(() => {
  return props.items.map((item) => ({
    ...item,
    onSelect() {
      emit("update:modelValue", item.value);
      dropdownMenuOpen.value = false;
    },
  }));
});
useShortcuts(extractShortcuts(items, ShortcutsSeparator.KeySequence));

// Track the last selected option from this group.
const lastSelectedOption = ref<ToolSelectItem>(props.items[0]!);

const currentOption = computed<ToolSelectItem>(() => {
  const rawModelValue = toRaw(props.modelValue);
  const foundOption = props.items.find(({ value }) => value === rawModelValue);
  return foundOption ?? lastSelectedOption.value;
});

watch(
  () => toRaw(props.modelValue),
  (rawModelValue) => {
    const foundOption = props.items.find(({ value }) => value === rawModelValue);
    if (foundOption) lastSelectedOption.value = foundOption;
  },
);

const selected = computed(() => currentOption.value.value === toRaw(props.modelValue) && !props.disabled);

const dropdownMenuOpen = ref(false);
const dropdownButton = useTemplateRef("dropdown-button") as MaybeRefOrGetter;
const dropdownButtonElement = computed(() => unrefElement(dropdownButton));

let timeout: ReturnType<typeof setTimeout> | undefined;
let hasLongPressed = false;

function handlePointerDown(e: PointerEvent) {
  if (props.disabled) return;
  if (props.items.length > 1) {
    timeout = setTimeout(() => {
      hasLongPressed = true;
      handleLongPress(e, hasLongPressed);
    }, 500);
  }
}

function handlePointerUp(e: PointerEvent) {
  if (props.disabled) return;
  handleLongPress(e, hasLongPressed);
  clearLongPress();
}

function clearLongPress() {
  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }
  hasLongPressed = false;
}

function handleLongPress(e: PointerEvent, isLongPress: boolean) {
  const isDropdownButtonClick = dropdownButtonElement.value && dropdownButtonElement.value.contains(e.target);
  if ((e.button === 0 && (isLongPress || isDropdownButtonClick)) || e.button === 2) {
    if (props.items.length === 1) return;
    dropdownMenuOpen.value = true;
  } else emit("update:modelValue", currentOption.value.value);
}
</script>

<template>
  <div class="relative inline-block">
    <UTooltip
      arrow
      :text="currentOption.label"
      :delay-duration="200"
      :disabled="props.disabled"
      :content="{ side: 'left' }"
    >
      <UButton
        data-testid="tool-selector-main-button"
        color="neutral"
        :variant="selected ? 'solid' : 'ghost'"
        :icon="currentOption.icon"
        :disabled="props.disabled"
        class="p-1.5"
        :class="{ 'bg-elevated hover:bg-accented': selected }"
        :style="{ color: selected ? (props.selectionColor ?? 'var(--text-dimmed)') : undefined }"
        :ui="{ leadingIcon: 'size-5' }"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp"
      />
    </UTooltip>

    <UDropdownMenu v-model:open="dropdownMenuOpen" :items="items">
      <UButton
        v-if="items.length > 1"
        ref="dropdown-button"
        data-testid="tool-selector-dropdown-button"
        variant="link"
        color="neutral"
        :disabled="props.disabled"
        icon="i-lucide:chevron-down"
        :ui="{
          base: 'absolute bottom-0 right-0 size-3 rounded-sm border-none p-0',
          leadingIcon: 'size-3 absolute left-1/2 top-1/2 -translate-1/2 -rotate-45',
        }"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp"
      />
    </UDropdownMenu>
  </div>
</template>

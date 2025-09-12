<template>
  <div class="relative">
    <UTooltip arrow :text="currentOption.label" :delay-duration="200" :disabled="disabled" :content="{ side: 'left' }">
      <UButton
        color="neutral"
        :variant="selected ? 'solid' : 'ghost'"
        :icon="currentOption.icon"
        :disabled="disabled"
        class="p-1.5"
        :class="{ 'bg-elevated hover:bg-accented': selected }"
        :style="{ color: selected ? selectionColor : undefined }"
        :ui="{ leadingIcon: 'size-5' }"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp"
      />
    </UTooltip>

    <!-- @vue-ignore -->
    <UDropdownMenu v-model:open="optionsMenuOpen" :items="options">
      <UButton
        v-if="options.length > 1"
        ref="dropdown-button"
        variant="link"
        color="neutral"
        :disabled="disabled"
        icon="i-lucide:chevron-down"
        :ui="{
          base: 'absolute bottom-0 right-0 size-3 rounded-sm border-none p-0',
          leadingIcon: 'size-3 absolute left-1/2 top-1/2 -translate-1/2 -rotate-45',
        }"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp"
      />

      <template #item="{ item }">
        <div
          class="flex items-center gap-x-2"
          @pointerup="
            () => {
              currentOption = item as ToolOption;
              emit('update:modelValue', item.value);
              optionsMenuOpen = false;
            }
          "
        >
          <UIcon v-if="typeof item.icon === 'string'" :name="item.icon" />
          <div v-else class="size-6">
            <component :is="item.icon"></component>
          </div>
          <span>{{ item.label }}</span>
        </div>
      </template>
    </UDropdownMenu>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, useTemplateRef, type MaybeRefOrGetter } from "vue";
  import { unrefElement } from "@vueuse/core";

  interface ToolOption {
    label: string;
    icon: string;
    value: unknown;
  }

  const props = defineProps<{
    modelValue: unknown;
    options: ToolOption[];
    disabled?: boolean;
    usePalitemColor?: boolean;
  }>();
  const emit = defineEmits(["update:modelValue"]);

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();

  const optionsMenuOpen = ref(false);
  const currentOption = ref<ToolOption>(
    props.options.find(({ value }) => value === props.modelValue) ?? props.options[0]!,
  );

  const selected = computed(() => props.modelValue === currentOption.value.value && !props.disabled);
  const selectionColor = computed<string>(() => {
    const palindex = appStateStore.selectedPaletteItemIndexes[0];
    if (!props.usePalitemColor || !patternsStore.pattern || palindex === undefined) return "var(--text-dimmed)";
    return patternsStore.pattern.palette[palindex]!.hex;
  });

  // Suppress the error by casting to `MaybeRefOrGetter`.
  const dropdownButton = useTemplateRef("dropdown-button") as MaybeRefOrGetter;
  const dropdownButtonElement = computed(() => unrefElement(dropdownButton));

  let timeout: ReturnType<typeof setTimeout> | undefined;
  let hasLongPressed = false;

  function handlePointerDown(e: PointerEvent) {
    if (props.disabled) return;
    if (props.options.length > 1) {
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
      if (props.options.length === 1) return;
      optionsMenuOpen.value = true;
    } else emit("update:modelValue", currentOption.value.value);
  }
</script>

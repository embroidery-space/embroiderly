<template>
  <div ref="container" class="relative">
    <Button
      ref="tool-button"
      v-tooltip="{
        value: typeof currentOption.label === 'function' ? currentOption.label() : currentOption.label,
        showDelay: 200,
        disabled: props.disabled,
      }"
      :text="!selected"
      :disabled="props.disabled"
      severity="secondary"
      :icon="currentOption.icon"
      class="size-[var(--p-button-icon-only-width)] border-none p-1.5"
      :style="{ color: selected && selectionColor }"
    />

    <Button
      v-if="props.options.length > 1"
      ref="dropdown-button"
      text
      :disabled="props.disabled"
      icon="i-prime:angle-down absolute left-1/2 top-1/2 -translate-1/2 -rotate-45"
      severity="secondary"
      class="absolute bottom-0 right-0 size-3 rounded-sm border-none p-0"
    />
  </div>

  <Menu ref="menu" :model="options" pt:root:class="min-w-fit" popup>
    <template #item="{ label, item }">
      <a
        class="flex items-center p-1"
        @pointerup="
          () => {
            currentOption = item as ToolOption;
            emit('update:modelValue', item.value);
            menu!.hide();
          }
        "
      >
        <span class="mr-2" :class="item.icon" />
        <span>{{ label }}</span>
      </a>
    </template>
  </Menu>
</template>

<script setup lang="ts">
  import { ref, computed, useTemplateRef, type MaybeRefOrGetter } from "vue";
  import { unrefElement, useEventListener } from "@vueuse/core";
  import { Button, Menu } from "primevue";
  import type { MenuItem } from "primevue/menuitem";
  import { dt } from "@primeuix/themes";
  import { useAppStateStore } from "#/stores/state";
  import { usePatternsStore } from "#/stores/patterns";

  type ToolOption = Omit<MenuItem, "command"> & { value: unknown };

  const props = defineProps<{
    modelValue: unknown;
    options: ToolOption[];
    disabled?: boolean;
    usePalitemColor?: boolean;
  }>();
  const emit = defineEmits(["update:modelValue"]);

  const appStateStore = useAppStateStore();
  const patternsStore = usePatternsStore();

  const currentOption = ref<ToolOption>(
    props.options.find(({ value }) => value === props.modelValue) ?? props.options[0]!,
  );

  const selected = computed(() => props.modelValue === currentOption.value.value && !props.disabled);
  const selectionColor = computed<string>(() => {
    const palindex = appStateStore.selectedPaletteItemIndexes[0];
    if (!props.usePalitemColor || !patternsStore.pattern || palindex === undefined) return dt("text.muted.color");
    return patternsStore.pattern.palette[palindex]!.hex;
  });

  // Suppress the error by casting to `MaybeRefOrGetter`.
  const menu = useTemplateRef("menu");
  const toolButton = useTemplateRef("tool-button") as MaybeRefOrGetter;
  const dropdownButton = useTemplateRef("dropdown-button") as MaybeRefOrGetter;
  const dropdownButtonElement = computed(() => unrefElement(dropdownButton));
  const container = useTemplateRef("container") as MaybeRefOrGetter;
  const containerElement = computed(() => unrefElement(container));

  let timeout: ReturnType<typeof setTimeout> | undefined;
  let hasLongPressed = false;

  useEventListener(toolButton, "pointerdown", handlePointerDown);
  useEventListener(toolButton, "pointerup", handlePointerUp);

  useEventListener(dropdownButton, "pointerdown", handlePointerDown);
  useEventListener(dropdownButton, "pointerup", handlePointerUp);

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
      // This is a workaround to attach the menu to the element
      // and to avoid issues that the `event.currentTarget` is `null` because it is used outside the event handler.
      const event = { ...e, currentTarget: containerElement.value };
      menu.value!.toggle(event);
    } else emit("update:modelValue", currentOption.value.value);
  }

  useEventListener(document, ["pointerdown", "contextmenu"], (e) => {
    // @ts-expect-error `container` is an internal property not exposed in the type definition.
    if (menu.value.container && menu.value.container.contains(e.target)) return;
    // Hide the menu when right-clicking or long pressing outside the button element.
    // This behavior is similar to the internal `bindOutsideClickListener` function in the `Menu` component.
    if (!containerElement.value.contains(e.target)) menu.value!.hide();
  });
</script>

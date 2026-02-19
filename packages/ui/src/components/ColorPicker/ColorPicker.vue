<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";

import { useColorDraggable } from "../../composables/useColorDraggable.ts";
import { hexToHsv, hsvToHex, isValidHex } from "../../utils/color.ts";

import { ColorPickerTheme } from "./ColorPicker.theme.ts";
import type { ColorPickerThemeSlots, ColorPickerThemeVariants } from "./ColorPicker.theme.ts";

export interface ColorPickerProps {
  /**
   * The size of the color picker.
   * @default "md"
   */
  size?: ColorPickerThemeVariants["size"];

  /**
   * Throttle time in milliseconds for drag updates.
   * @default 50
   */
  throttle?: number;

  /**
   * Whether the color picker is disabled.
   */
  disabled?: boolean;

  class?: any;
  ui?: ColorPickerThemeSlots;
}

const modelValue = defineModel<string>({ default: "#FF0000" });
const props = withDefaults(defineProps<ColorPickerProps>(), {
  size: "md",
  throttle: 50,
});

const hsv = ref(hexToHsv(modelValue.value));
watch(modelValue, (newValue) => {
  if (newValue && isValidHex(newValue)) {
    const newHsv = hexToHsv(newValue);
    // Only update if different to avoid loops.
    if (newHsv.h !== hsv.value.h || newHsv.s !== hsv.value.s || newHsv.v !== hsv.value.v) {
      hsv.value = newHsv;
    }
  }
});

const { x: selectorDragX, y: selectorDragY } = useColorDraggable({
  target: useTemplateRef("selector"),
  initialX: computed(() => hsv.value.s),
  initialY: computed(() => 100 - hsv.value.v),
  throttle: () => props.throttle,
  disabled: () => props.disabled,
  onUpdate: ({ x, y }) => {
    hsv.value = {
      ...hsv.value,
      s: x,
      v: 100 - y,
    };
    modelValue.value = hsvToHex(hsv.value);
  },
});

const { y: trackDragY } = useColorDraggable({
  target: useTemplateRef("track"),
  initialX: 50,
  initialY: computed(() => (hsv.value.h / 360) * 100),
  throttle: () => props.throttle,
  disabled: () => props.disabled,
  onUpdate: ({ y }) => {
    hsv.value = {
      ...hsv.value,
      h: (y / 100) * 360,
    };
    modelValue.value = hsvToHex(hsv.value);
  },
});

const currentSelectorBackgroundColor = computed(() => hsvToHex({ h: hsv.value.h, s: 100, v: 100 }));
const currentTrackThumbColor = computed(() => hsvToHex(hsv.value));

const ui = computed(() => {
  return ColorPickerTheme({
    size: props.size,
  });
});
</script>

<template>
  <div :data-disabled="disabled ? true : undefined" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div :class="ui.picker({ class: props.ui?.picker })">
      <div ref="selector" :class="ui.selector({ class: props.ui?.selector })">
        <div
          :class="ui.selectorBackground({ class: props.ui?.selectorBackground })"
          :style="{ backgroundColor: currentSelectorBackgroundColor }"
        />
        <div data-color-picker-selector :class="ui.selectorBackground({ class: props.ui?.selectorBackground })" />
        <div
          :data-disabled="disabled ? true : undefined"
          :class="ui.selectorThumb({ class: props.ui?.selectorThumb })"
          :style="{
            left: `${selectorDragX}%`,
            top: `${selectorDragY}%`,
            backgroundColor: currentTrackThumbColor,
          }"
        />
      </div>

      <div ref="track" data-color-picker-track :class="ui.track({ class: props.ui?.track })">
        <div
          :data-disabled="disabled ? true : undefined"
          :class="ui.trackThumb({ class: props.ui?.trackThumb })"
          :style="{
            top: `${trackDragY}%`,
            backgroundColor: currentSelectorBackgroundColor,
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
[data-color-picker-selector] {
  background-image:
    linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0) 100%),
    linear-gradient(to right, #fff 0%, rgba(255, 255, 255, 0) 100%);
}

[data-color-picker-track] {
  background-image: linear-gradient(0deg, red 0%, #f0f 17%, #00f 33%, #0ff 50%, #0f0 67%, #ff0 83%, red 100%);
}
</style>

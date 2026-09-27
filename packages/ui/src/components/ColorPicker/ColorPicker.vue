<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";

import { useColorDraggable } from "../../composables/useColorDraggable.ts";
import { hexToHsv, hsvToHex, isValidHex } from "../../utils/color.ts";

export interface ColorPickerProps {
  /**
   * The size of the color picker.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Throttle time in milliseconds for drag updates.
   * @default 50
   */
  throttle?: number;

  /** Whether the color picker is disabled. */
  disabled?: boolean;
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
</script>

<template>
  <div :data-disabled="disabled ? true : undefined" data-slot="root" :class="[$style.root, $style[`size-${size}`]]">
    <div data-slot="picker" :class="$style.picker">
      <div ref="selector" data-slot="selector" :class="$style.selector">
        <div
          data-slot="selector-background"
          :class="$style.selectorBackground"
          :style="{ backgroundColor: currentSelectorBackgroundColor }"
        />
        <div data-color-picker-selector data-slot="selector-background" :class="$style.selectorBackground" />
        <div
          :data-disabled="disabled ? true : undefined"
          data-slot="selector-thumb"
          :class="$style.selectorThumb"
          :style="{
            left: `${selectorDragX}%`,
            top: `${selectorDragY}%`,
            backgroundColor: currentTrackThumbColor,
          }"
        />
      </div>

      <div ref="track" data-color-picker-track data-slot="track" :class="$style.track">
        <div
          :data-disabled="disabled ? true : undefined"
          data-slot="track-thumb"
          :class="$style.trackThumb"
          :style="{
            top: `${trackDragY}%`,
            backgroundColor: currentSelectorBackgroundColor,
          }"
        />
      </div>
    </div>
  </div>
</template>

<style module>
.root {
  &[data-disabled] {
    opacity: 75%;
  }
}

.picker {
  display: flex;
  gap: calc(var(--spacing) * 4);
}

.selector {
  touch-action: none;
  position: relative;

  .size-sm & {
    width: calc(var(--spacing) * 38);
    height: calc(var(--spacing) * 38);
  }

  .size-md & {
    width: calc(var(--spacing) * 42);
    height: calc(var(--spacing) * 42);
  }

  .size-lg & {
    width: calc(var(--spacing) * 46);
    height: calc(var(--spacing) * 46);
  }
}

.selector-background {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-md);

  &[data-color-picker-selector] {
    background-image:
      linear-gradient(to top, #000 0%, rgba(0, 0, 0, 0) 100%),
      linear-gradient(to right, #fff 0%, rgba(255, 255, 255, 0) 100%);
  }
}

.selector-thumb {
  cursor: pointer;

  position: absolute;
  translate: -50% -50%;

  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
  border-radius: calc(infinity * 1px);

  box-shadow: 0 0 0 2px var(--color-white);

  &[data-disabled] {
    cursor: not-allowed;
  }
}

.track {
  touch-action: none;

  position: relative;

  width: calc(var(--spacing) * 2);
  border-radius: var(--radius-md);

  background-image: linear-gradient(0deg, red 0%, magenta 17%, blue 33%, cyan 50%, lime 67%, yellow 83%, red 100%);

  .size-sm & {
    height: calc(var(--spacing) * 38);
  }

  .size-md & {
    height: calc(var(--spacing) * 42);
  }

  .size-lg & {
    height: calc(var(--spacing) * 46);
  }
}

.track-thumb {
  cursor: pointer;

  position: absolute;
  left: 50%;
  translate: -50% -50%;

  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
  border-radius: calc(infinity * 1px);

  box-shadow: 0 0 0 2px var(--color-white);

  &[data-disabled] {
    cursor: not-allowed;
  }
}
</style>

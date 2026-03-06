import { useElementSize } from "@vueuse/core";
import type { MaybeComputedElementRef } from "@vueuse/core";
import { ref, computed, onMounted, watch } from "vue";

import { useSettingsStore } from "~/stores/";

const DEFAULT_FONT_SIZE = 16;

/**
 * Converts absolute sizes (px or rem) to reactive percentages of a container element's width.
 *
 * @param container - A template ref or element ref for the container whose width is used as the 100% base.
 */
export function usePercentOfContainer(container: MaybeComputedElementRef) {
  const settingsStore = useSettingsStore();

  const rootFontSize = ref(DEFAULT_FONT_SIZE);
  const { width: containerWidth } = useElementSize(container);

  function updateRootFontSize() {
    const style = getComputedStyle(document.documentElement);
    rootFontSize.value = parseFloat(style.fontSize) || DEFAULT_FONT_SIZE;
  }

  onMounted(updateRootFontSize);
  watch(() => settingsStore.ui.scale, updateRootFontSize);

  /**
   * Returns a reactive percentage (0–100) of the container width for the given size.
   *
   * @param value - The size value.
   * @param unit - The unit of the size value.
   */
  function toPercent(value: number, unit: "px" | "rem") {
    return computed(() => {
      const px = unit === "rem" ? value * rootFontSize.value : value;
      return (px / containerWidth.value) * 100;
    });
  }

  return { toPercent };
}

import { useRemToPx } from "@embroiderly/ui";

import { useElementSize } from "@vueuse/core";
import type { MaybeComputedElementRef } from "@vueuse/core";
import { computed } from "vue";

/**
 * Converts absolute sizes (px or rem) to reactive percentages of a container element's width.
 *
 * @param container - A template ref or element ref for the container whose width is used as the 100% base.
 */
export function usePercentOfContainer(container: MaybeComputedElementRef) {
  const { remToPx } = useRemToPx();
  const { width: containerWidth } = useElementSize(container);

  /**
   * Returns a reactive percentage (0–100) of the container width for the given size.
   *
   * @param value - The size value.
   * @param unit - The unit of the size value.
   */
  function toPercent(value: number, unit: "px" | "rem") {
    return computed(() => {
      if (containerWidth.value <= 0) return 0;

      const px = unit === "rem" ? remToPx(value) : value;
      return (px / containerWidth.value) * 100;
    });
  }

  return { toPercent };
}

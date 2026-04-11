import { createSharedComposable } from "@vueuse/core";
import { onMounted, onUnmounted, ref } from "vue";

const DEFAULT_FONT_SIZE = 16;

/** A shared composable that provides a utility to convert rem values to pixels by tracking the root font size. */
export const useRemToPx = createSharedComposable(() => {
  const rootFontSize = ref(DEFAULT_FONT_SIZE);

  let observer: MutationObserver | undefined;
  onMounted(() => {
    observer = new MutationObserver(() => {
      const style = getComputedStyle(document.documentElement);
      rootFontSize.value = parseFloat(style.fontSize) || DEFAULT_FONT_SIZE;
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  });
  onUnmounted(() => observer?.disconnect());

  function remToPx(rem: number) {
    return rem * rootFontSize.value;
  }

  return { rootFontSize, remToPx };
});

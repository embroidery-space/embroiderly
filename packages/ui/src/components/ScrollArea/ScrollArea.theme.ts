import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ScrollAreaTheme = tv({
  slots: {
    root: "relative overflow-hidden",
    viewport: "size-full",
    scrollbar: "flex touch-none p-1 select-none",
    thumb: "relative rounded-full bg-inverted/75",
  },
  variants: {
    orientation: {
      vertical: {
        scrollbar: "h-full w-3 flex-col",
      },
      horizontal: {
        scrollbar: "h-3 w-full flex-row",
      },
    },
  },
});

export type ScrollAreaThemeVariants = VariantProps<typeof ScrollAreaTheme>;
export type ScrollAreaThemeSlots = Partial<(typeof ScrollAreaTheme)["slots"]>;

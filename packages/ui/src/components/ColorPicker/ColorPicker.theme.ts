import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ColorPickerTheme = tv({
  slots: {
    root: "data-disabled:opacity-75",
    picker: "flex gap-4",
    selector: "relative touch-none",
    selectorBackground: "absolute inset-0 rounded-md",
    selectorThumb: `
      absolute size-4 -translate-1/2 cursor-pointer rounded-full ring-2
      ring-white
      data-disabled:cursor-not-allowed
    `,
    track: "relative w-2 touch-none rounded-md",
    trackThumb: `
      absolute left-1/2 size-4 -translate-1/2 cursor-pointer rounded-full ring-2
      ring-white
      data-disabled:cursor-not-allowed
    `,
  },
  variants: {
    size: {
      sm: {
        selector: "size-38",
        track: "h-38",
      },
      md: {
        selector: "size-42",
        track: "h-42",
      },
      lg: {
        selector: "size-46",
        track: "h-46",
      },
    },
  },
});

export type ColorPickerThemeVariants = VariantProps<typeof ColorPickerTheme>;
export type ColorPickerThemeSlots = Partial<(typeof ColorPickerTheme)["slots"]>;

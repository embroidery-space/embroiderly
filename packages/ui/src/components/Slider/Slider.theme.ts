import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const SliderTheme = tv({
  slots: {
    root: "relative flex w-full items-center select-none touch-none",
    track: "relative bg-accented overflow-hidden rounded-full grow",
    range: "absolute h-full rounded-full",
    thumb: "block rounded-full bg-default ring-2 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer",
  },
  variants: {
    color: {
      primary: {
        range: "bg-primary",
        thumb: "ring-primary focus-visible:outline-primary",
      },
    },
    size: {
      sm: {
        track: "h-1.5",
        thumb: "size-3",
      },
      md: {
        track: "h-2",
        thumb: "size-4",
      },
      lg: {
        track: "h-2.5",
        thumb: "size-5",
      },
    },
    disabled: {
      true: {
        root: "opacity-75 cursor-not-allowed",
        thumb: "cursor-not-allowed",
      },
    },
  },
});

export type SliderThemeVariants = VariantProps<typeof SliderTheme>;
export type SliderThemeSlots = Partial<(typeof SliderTheme)["slots"]>;

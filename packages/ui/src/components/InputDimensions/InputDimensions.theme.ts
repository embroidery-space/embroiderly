import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const InputDimensionsTheme = tv({
  slots: {
    root: "flex gap-2",
    lockButton: "",
  },
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    orientation: {
      horizontal: {
        root: "flex-row items-end",
        lockButton: "self-end",
      },
      vertical: {
        root: "relative flex-col pl-8",
        lockButton: "absolute top-1/2 left-0 -translate-y-1/2",
      },
    },
  },
});

export type InputDimensionsThemeVariants = VariantProps<typeof InputDimensionsTheme>;
export type InputDimensionsThemeSlots = Partial<(typeof InputDimensionsTheme)["slots"]>;

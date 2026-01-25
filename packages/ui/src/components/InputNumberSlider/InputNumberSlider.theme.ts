import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const InputNumberSliderTheme = tv({
  slots: {
    root: "flex items-center gap-x-2",
  },
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },
});

export type InputNumberSliderThemeVariants = VariantProps<typeof InputNumberSliderTheme>;
export type InputNumberSliderThemeSlots = Partial<(typeof InputNumberSliderTheme)["slots"]>;

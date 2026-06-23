import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const InputFileTheme = tv({
  base: "",
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },
});

export type InputFileThemeVariants = VariantProps<typeof InputFileTheme>;

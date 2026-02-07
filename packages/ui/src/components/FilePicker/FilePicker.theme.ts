import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const FilePickerTheme = tv({
  base: "",
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },
});

export type FilePickerThemeVariants = VariantProps<typeof FilePickerTheme>;

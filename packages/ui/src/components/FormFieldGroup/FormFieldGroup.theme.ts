import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const FormFieldGroupTheme = tv({
  base: "relative inline-flex -space-x-px",
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
});

export type FormFieldGroupThemeVariants = VariantProps<typeof FormFieldGroupTheme>;

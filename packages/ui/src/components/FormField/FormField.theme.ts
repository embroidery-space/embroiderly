import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const FormFieldTheme = tv({
  slots: {
    root: "",
    wrapper: "",
    labelWrapper: "flex items-center justify-between gap-1",
    label: "block font-medium text-default",
    container: "mt-1",
    description: "text-muted",
    hint: "text-muted",
    help: "mt-1 text-muted",
  },
  variants: {
    size: {
      sm: { root: "text-xs" },
      md: { root: "text-sm" },
      lg: { root: "text-base" },
    },
  },
});

export type FormFieldThemeVariants = VariantProps<typeof FormFieldTheme>;
export type FormFieldThemeSlots = Partial<(typeof FormFieldTheme)["slots"]>;

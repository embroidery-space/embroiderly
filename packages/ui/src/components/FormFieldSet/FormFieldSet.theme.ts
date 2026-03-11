import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const FormFieldSetTheme = tv({
  slots: {
    root: "mt-2 rounded-md border border-default px-4 pb-4",
    legend: "font-medium text-default",
    content: `
      overflow-hidden
      data-[state=closed]:animate-[collapsible-up_200ms_ease-out]
      data-[state=open]:animate-[collapsible-down_200ms_ease-out]
    `,
  },
  variants: {
    size: {
      sm: { legend: "text-xs" },
      md: { legend: "text-sm" },
      lg: { legend: "text-base" },
    },
  },
});

export type FormFieldSetThemeVariants = VariantProps<typeof FormFieldSetTheme>;
export type FormFieldSetThemeSlots = Partial<(typeof FormFieldSetTheme)["slots"]>;

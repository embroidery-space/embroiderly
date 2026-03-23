import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const EditableTheme = tv({
  slots: {
    root: "inline-flex",
    area: `
      relative inline-flex min-w-0 flex-1 cursor-text items-center text-default
      data-empty:text-dimmed
    `,
    preview: `block min-w-0 truncate text-inherit outline-none`,
    input: `
      block w-full max-w-full bg-transparent text-inherit outline-none
      placeholder:text-dimmed
    `,
  },
  variants: {
    disabled: {
      true: {
        area: "cursor-not-allowed opacity-50",
      },
    },
  },
});

export type EditableThemeVariants = VariantProps<typeof EditableTheme>;
export type EditableThemeSlots = Partial<(typeof EditableTheme)["slots"]>;

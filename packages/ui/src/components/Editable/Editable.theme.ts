import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const EditableTheme = tv({
  slots: {
    root: "inline-flex",
    area: `
      relative inline-flex w-fit min-w-0 items-center text-default
      not-data-placeholder-shown:w-full
      data-empty:text-dimmed
    `,
    preview: `block min-w-0 cursor-text truncate text-inherit outline-none`,
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

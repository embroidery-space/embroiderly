import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const TextareaTheme = tv({
  slots: {
    root: "relative inline-flex items-center",
    base: `
      w-full appearance-none rounded-md border-0 transition-colors
      focus:outline-none
      disabled:cursor-not-allowed disabled:opacity-75
    `,
  },
  variants: {
    color: {
      primary: {},
    },
    variant: {
      subtle: {
        base: "bg-elevated ring ring-accented ring-inset",
      },
      outline: {
        base: "bg-default ring ring-accented ring-inset",
      },
    },
    size: {
      sm: {
        base: "gap-1 px-2 py-1 text-xs",
      },
      md: {
        base: "gap-1.5 px-2.5 py-1.5 text-sm",
      },
      lg: {
        base: "gap-2 px-3 py-2 text-base",
      },
    },
    autoresize: {
      true: {
        base: "resize-none",
      },
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "subtle",
      class: {
        base: `
          focus-visible:ring-2 focus-visible:ring-primary
          focus-visible:ring-inset
        `,
      },
    },
    {
      color: "primary",
      variant: "outline",
      class: {
        base: `
          focus-visible:ring-2 focus-visible:ring-primary
          focus-visible:ring-inset
        `,
      },
    },
  ],
});

export type TextareaThemeVariants = VariantProps<typeof TextareaTheme>;
export type TextareaThemeSlots = Partial<(typeof TextareaTheme)["slots"]>;

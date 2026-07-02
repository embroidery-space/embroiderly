import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const RadioGroupTheme = tv({
  slots: {
    root: "relative flex flex-col items-start",
    item: "flex items-start",
    container: "flex items-center",
    base: `
      overflow-hidden rounded-full ring ring-accented ring-inset
      not-disabled:hover:cursor-pointer
      focus-visible:outline-2 focus-visible:outline-offset-2
    `,
    indicator: `
      flex size-full items-center justify-center
      after:rounded-full after:bg-default
    `,
    wrapper: "ms-2 w-full",
    label: `
      block font-medium text-default
      not-disabled:hover:cursor-pointer
    `,
    description: "text-muted",
  },
  variants: {
    color: {
      primary: {
        base: "focus-visible:outline-primary",
        indicator: "bg-primary",
      },
    },
    size: {
      sm: {
        item: "text-xs",
        container: "h-4",
        base: "size-3",
        indicator: "after:size-1",
      },
      md: {
        item: "text-sm",
        container: "h-5",
        base: "size-4",
        indicator: "after:size-1.5",
      },
      lg: {
        item: "text-base",
        container: "h-6",
        base: "size-5",
        indicator: "after:size-2",
      },
    },
    disabled: {
      true: {
        item: "opacity-75",
        base: "cursor-not-allowed",
        label: "cursor-not-allowed",
        description: "cursor-not-allowed",
      },
    },
  },
});

export type RadioGroupThemeVariants = VariantProps<typeof RadioGroupTheme>;
export type RadioGroupThemeSlots = Partial<(typeof RadioGroupTheme)["slots"]>;

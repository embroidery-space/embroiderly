import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const CheckboxTheme = tv({
  slots: {
    root: "relative flex items-start",
    container: "flex items-center",
    base: "overflow-hidden rounded-sm ring ring-accented ring-inset focus-visible:outline-2 focus-visible:outline-offset-2",
    indicator: "flex size-full items-center justify-center text-inverted",
    icon: "size-full shrink-0",
    wrapper: "ms-2 w-full",
    label: "block font-medium text-default",
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
        base: "size-3",
        container: "h-4",
        wrapper: "text-xs",
      },
      md: {
        base: "size-4",
        container: "h-5",
        wrapper: "text-sm",
      },
      lg: {
        base: "size-5",
        container: "h-6",
        wrapper: "text-base",
      },
    },
    disabled: {
      true: {
        root: "opacity-75",
        base: "cursor-not-allowed",
        label: "cursor-not-allowed",
        description: "cursor-not-allowed",
      },
    },
  },
});

export type CheckboxThemeVariants = VariantProps<typeof CheckboxTheme>;
export type CheckboxThemeSlots = Partial<(typeof CheckboxTheme)["slots"]>;

import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const CheckboxTheme = tv({
  slots: {
    root: "relative flex items-start",
    container: "flex items-center",
    base: "rounded-sm ring ring-inset ring-accented overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2",
    indicator: "flex items-center justify-center size-full text-inverted",
    icon: "shrink-0 size-full",
    wrapper: "w-full ms-2",
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

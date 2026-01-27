import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const SwitchTheme = tv({
  slots: {
    root: "relative flex items-start",
    container: "flex items-center",
    base: "inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 data-[state=unchecked]:bg-accented",
    thumb:
      "pointer-events-none rounded-full bg-default shadow-lg ring-0 transition-transform duration-200 data-[state=unchecked]:translate-x-0",
    wrapper: "ms-2 w-full",
    label: "block font-medium text-default",
    description: "text-muted",
  },
  variants: {
    color: {
      primary: {
        base: "focus-visible:outline-primary data-[state=checked]:bg-primary",
      },
    },
    size: {
      sm: {
        base: "h-4 w-7",
        container: "h-4",
        thumb: "size-3 data-[state=checked]:translate-x-3",
        wrapper: "text-xs",
      },
      md: {
        base: "h-5 w-9",
        container: "h-5",
        thumb: "size-4 data-[state=checked]:translate-x-4",
        wrapper: "text-sm",
      },
      lg: {
        base: "h-6 w-11",
        container: "h-6",
        thumb: "size-5 data-[state=checked]:translate-x-5",
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

export type SwitchThemeVariants = VariantProps<typeof SwitchTheme>;
export type SwitchThemeSlots = Partial<(typeof SwitchTheme)["slots"]>;

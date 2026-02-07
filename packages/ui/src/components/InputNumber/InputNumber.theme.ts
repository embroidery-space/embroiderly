import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const InputNumberTheme = tv({
  slots: {
    root: "relative inline-flex items-center",
    base: "w-full appearance-none rounded-md border-0 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
    buttons: "absolute inset-y-0 end-0 flex flex-col justify-center [&>button]:scale-80 [&>button]:py-0",
  },
  variants: {
    color: {
      primary: {},
    },
    variant: {
      subtle: {
        base: "bg-elevated text-highlighted ring ring-accented ring-inset",
      },
      outline: {
        base: "bg-default text-highlighted ring ring-accented ring-inset",
      },
    },
    size: {
      sm: {
        base: "py-1 ps-2 pe-7 text-xs",
        buttons: "pe-1",
      },
      md: {
        base: "py-1.5 ps-2.5 pe-8 text-sm",
        buttons: "pe-1",
      },
      lg: {
        base: "py-2 ps-3 pe-9 text-base",
        buttons: "pe-1.5",
      },
    },
    hasButtons: {
      true: {},
      false: {},
    },
    fieldGroup: {
      true: {
        root: "group has-focus-visible:z-1",
        base: "group-not-last:group-not-first:rounded-none group-not-only:group-first:rounded-e-none group-not-only:group-last:rounded-s-none",
      },
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "subtle",
      class: {
        base: "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
      },
    },
    {
      color: "primary",
      variant: "outline",
      class: {
        base: "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
      },
    },

    { hasButtons: false, size: "sm", class: { base: "pe-2" } },
    { hasButtons: false, size: "md", class: { base: "pe-2.5" } },
    { hasButtons: false, size: "lg", class: { base: "pe-3" } },
  ],
});

export type InputNumberThemeVariants = VariantProps<typeof InputNumberTheme>;
export type InputNumberThemeSlots = Partial<(typeof InputNumberTheme)["slots"]>;

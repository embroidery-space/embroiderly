import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const InputNumberTheme = tv({
  slots: {
    root: "relative inline-flex items-center",
    base: "w-full rounded-md border-0 appearance-none placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 read-only:cursor-default transition-colors",
    buttons: "absolute inset-y-0 end-0 flex flex-col justify-center [&>button]:py-0 [&>button]:scale-80",
  },
  variants: {
    color: {
      primary: {},
    },
    variant: {
      subtle: {
        base: "text-highlighted bg-elevated ring ring-inset ring-accented",
      },
      outline: {
        base: "text-highlighted bg-default ring ring-inset ring-accented",
      },
    },
    size: {
      sm: {
        base: "ps-2 pe-7 py-1 text-xs",
        buttons: "pe-1",
      },
      md: {
        base: "ps-2.5 pe-8 py-1.5 text-sm",
        buttons: "pe-1",
      },
      lg: {
        base: "ps-3 pe-9 py-2 text-base",
        buttons: "pe-1.5",
      },
    },
    hasButtons: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "subtle",
      class: {
        base: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
      },
    },
    {
      color: "primary",
      variant: "outline",
      class: {
        base: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
      },
    },

    { hasButtons: false, size: "sm", class: { base: "pe-2" } },
    { hasButtons: false, size: "md", class: { base: "pe-2.5" } },
    { hasButtons: false, size: "lg", class: { base: "pe-3" } },
  ],
});

export type InputNumberThemeVariants = VariantProps<typeof InputNumberTheme>;
export type InputNumberThemeSlots = Partial<(typeof InputNumberTheme)["slots"]>;

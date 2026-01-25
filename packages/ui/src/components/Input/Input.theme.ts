import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const InputTheme = tv({
  slots: {
    root: "relative inline-flex items-center",
    base: "w-full rounded-md border-0 appearance-none placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 read-only:cursor-default transition-colors",
    leading: "absolute inset-y-0 start-0 flex items-center",
    trailing: "absolute inset-y-0 end-0 flex items-center",
  },
  variants: {
    color: {
      primary: {},
    },
    variant: {
      subtle: {
        base: "text-highlighted bg-elevated ring ring-inset ring-accented",
      },
    },
    size: {
      sm: {
        base: "ps-2 pe-2 py-1 text-xs gap-1",
        leading: "ps-2",
        trailing: "pe-2",
      },
      md: {
        base: "ps-2.5 pe-2.5 py-1.5 text-sm gap-1.5",
        leading: "ps-2.5",
        trailing: "pe-2.5",
      },
      lg: {
        base: "ps-3 pe-3 py-2 text-base gap-2",
        leading: "ps-3",
        trailing: "pe-3",
      },
    },
    leading: {
      true: {},
    },
    trailing: {
      true: {},
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

    { leading: true, size: "sm", class: { base: "ps-7" } },
    { leading: true, size: "md", class: { base: "ps-9" } },
    { leading: true, size: "lg", class: { base: "ps-11" } },

    { trailing: true, size: "sm", class: { base: "pe-7" } },
    { trailing: true, size: "md", class: { base: "pe-9" } },
    { trailing: true, size: "lg", class: { base: "pe-11" } },
  ],
});

export type InputThemeVariants = VariantProps<typeof InputTheme>;
export type InputThemeSlots = Partial<(typeof InputTheme)["slots"]>;

import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const SeparatorTheme = tv({
  slots: {
    base: "shrink-0 border-solid border-default",
  },
  variants: {
    orientation: {
      horizontal: {
        base: "w-full",
      },
      vertical: {
        base: "h-full",
      },
    },
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
      xl: {},
    },
  },
  compoundVariants: [
    { orientation: "horizontal", size: "xs", class: { base: "border-t" } },
    { orientation: "horizontal", size: "sm", class: { base: "border-t-2" } },
    { orientation: "horizontal", size: "md", class: { base: "border-t-3" } },
    { orientation: "horizontal", size: "lg", class: { base: "border-t-4" } },
    { orientation: "horizontal", size: "xl", class: { base: "border-t-5" } },

    { orientation: "vertical", size: "xs", class: { base: "border-s" } },
    { orientation: "vertical", size: "sm", class: { base: "border-s-2" } },
    { orientation: "vertical", size: "md", class: { base: "border-s-3" } },
    { orientation: "vertical", size: "lg", class: { base: "border-s-4" } },
    { orientation: "vertical", size: "xl", class: { base: "border-s-5" } },
  ],
});

export type SeparatorThemeVariants = VariantProps<typeof SeparatorTheme>;
export type SeparatorThemeSlots = Partial<(typeof SeparatorTheme)["slots"]>;

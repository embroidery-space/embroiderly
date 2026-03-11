import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ProgressTheme = tv({
  slots: {
    base: "relative overflow-hidden rounded-full bg-accented",
    indicator: "size-full rounded-full",
  },
  variants: {
    orientation: {
      horizontal: {
        base: "w-full",
        indicator: `
          data-[state=indeterminate]:animate-[carousel_2s_ease-in-out_infinite]
        `,
      },
      vertical: {
        base: "h-full",
        indicator: `
          data-[state=indeterminate]:animate-[carousel-vertical_2s_ease-in-out_infinite]
        `,
      },
    },
    color: {
      primary: { indicator: "bg-primary" },
      error: { indicator: "bg-error" },
      warning: { indicator: "bg-warning" },
      success: { indicator: "bg-success" },
      info: { indicator: "bg-info" },
      help: { indicator: "bg-help" },
      neutral: { indicator: "bg-inverted" },
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
    { orientation: "horizontal", size: "xs", class: { base: "h-0.5" } },
    { orientation: "horizontal", size: "sm", class: { base: "h-1" } },
    { orientation: "horizontal", size: "md", class: { base: "h-2" } },
    { orientation: "horizontal", size: "lg", class: { base: "h-3" } },
    { orientation: "horizontal", size: "xl", class: { base: "h-4" } },

    { orientation: "vertical", size: "xs", class: { base: "w-0.5" } },
    { orientation: "vertical", size: "sm", class: { base: "w-1" } },
    { orientation: "vertical", size: "md", class: { base: "w-2" } },
    { orientation: "vertical", size: "lg", class: { base: "w-3" } },
    { orientation: "vertical", size: "xl", class: { base: "w-4" } },
  ],
});

export type ProgressThemeVariants = VariantProps<typeof ProgressTheme>;
export type ProgressThemeSlots = Partial<(typeof ProgressTheme)["slots"]>;

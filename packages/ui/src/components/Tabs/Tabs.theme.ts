import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const TabsTheme = tv({
  slots: {
    root: "flex",
    list: "relative inline-flex items-center gap-1 rounded-lg bg-accented p-1",
    indicator: "absolute rounded-md bg-default shadow-xs transition-[translate,width,height] duration-200",
    trigger:
      "relative z-1 inline-flex cursor-pointer items-center gap-1.5 rounded-md font-medium text-muted focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-75 data-[state=active]:text-default",
    label: "truncate",
    content: "focus-visible:outline-2 focus-visible:outline-primary",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "flex-col gap-2",
        indicator: "inset-y-1 left-0 w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position)",
      },
      vertical: {
        root: "flex-row items-start gap-2",
        list: "flex-col",
        indicator: "inset-x-1 top-0 h-(--reka-tabs-indicator-size) translate-y-(--reka-tabs-indicator-position)",
      },
    },
    size: {
      sm: {
        trigger: "px-2 py-1 text-xs",
      },
      md: {
        trigger: "px-2.5 py-1.5 text-sm",
      },
      lg: {
        trigger: "px-3 py-2 text-base",
      },
    },
  },
});

export type TabsThemeVariants = VariantProps<typeof TabsTheme>;
export type TabsThemeSlots = Partial<(typeof TabsTheme)["slots"]>;

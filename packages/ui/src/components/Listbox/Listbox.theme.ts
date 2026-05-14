import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ListboxTheme = tv({
  slots: {
    root: `
      flex min-h-0 flex-col overflow-hidden rounded-md ring ring-default
      ring-inset
    `,
    filter: "shrink-0 border-b border-default",
    scroll: "min-h-0 flex-1",
    content: "min-h-full outline-none",
    group: "p-1",
    label: "flex w-full items-center font-semibold text-muted",
    separator: "-mx-1 my-1 h-px bg-border",
    item: `
      flex w-full cursor-pointer items-center rounded-sm text-default
      outline-none select-none
      data-disabled:cursor-not-allowed data-disabled:opacity-75
      data-highlighted:bg-elevated
      data-disabled:data-highlighted:bg-transparent
    `,
    itemLabel: "min-w-0 flex-1 truncate",
    itemIndicator: "ms-auto shrink-0",
    empty: "text-center text-muted",
  },
  variants: {
    color: {
      primary: { itemIndicator: "text-primary" },
      neutral: { itemIndicator: "text-default" },
    },
    size: {
      sm: {
        label: "gap-1 p-1 text-xs",
        item: "gap-1 p-1 text-xs",
        itemIndicator: "size-3",
        empty: "py-1 text-xs",
      },
      md: {
        label: "gap-1.5 p-1.5 text-sm",
        item: "gap-1.5 p-1.5 text-sm",
        itemIndicator: "size-4",
        empty: "py-1.5 text-sm",
      },
      lg: {
        label: "gap-2 p-2 text-sm",
        item: "gap-2 p-2 text-base",
        itemIndicator: "size-5",
        empty: "py-2 text-base",
      },
    },
    disabled: {
      true: {
        root: "cursor-not-allowed opacity-75",
      },
    },
  },
  compoundVariants: [],
});

export type ListboxThemeVariants = VariantProps<typeof ListboxTheme>;
export type ListboxThemeSlots = Partial<(typeof ListboxTheme)["slots"]>;

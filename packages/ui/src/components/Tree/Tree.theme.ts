import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const TreeTheme = tv({
  slots: {
    root: "w-full list-none space-y-0.5 select-none",
    list: `
      relative mt-0.5 list-none space-y-0.5 ps-(--tree-indent)
      before:pointer-events-none before:absolute before:inset-y-0
      before:left-[calc(var(--tree-indent)*0.75)] before:w-px before:bg-border
    `,
    item: `
      flex cursor-pointer items-center gap-1.5 rounded-md text-default
      hover:bg-elevated
      focus-visible:outline-2 focus-visible:outline-inverted
      aria-disabled:cursor-not-allowed aria-disabled:opacity-75
      data-ancestor-selected:bg-elevated
      data-selected:bg-elevated
    `,
    itemLeadingIcon: "shrink-0 text-muted",
    itemLabel: "flex-1 truncate text-left",
    itemChevron: "transition-transform duration-200",
  },
  variants: {
    size: {
      sm: {
        root: "[--tree-indent:1rem]",
        item: "px-2 py-1 text-xs",
        itemLeadingIcon: "size-3",
        itemChevron: "size-3",
      },
      md: {
        root: "[--tree-indent:1.25rem]",
        item: "px-2.5 py-1.5 text-sm",
        itemLeadingIcon: "size-4",
        itemChevron: "size-4",
      },
      lg: {
        root: "[--tree-indent:1.5rem]",
        item: "px-3 py-2 text-base",
        itemLeadingIcon: "size-5",
        itemChevron: "size-5",
      },
    },
  },
});

export type TreeThemeVariants = VariantProps<typeof TreeTheme>;
export type TreeThemeSlots = Partial<(typeof TreeTheme)["slots"]>;

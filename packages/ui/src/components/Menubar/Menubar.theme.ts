import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const MenubarTheme = tv({
  slots: {
    root: "flex items-center gap-1",
    trigger: "",
    content:
      "pointer-events-auto min-w-32 origin-(--reka-menubar-content-transform-origin) overflow-hidden rounded-md bg-default shadow-lg ring ring-default focus:outline-none data-[state=closed]:animate-[scale-out_100ms_ease-in] data-[state=open]:animate-[scale-in_100ms_ease-out]",
    group: "isolate p-1",
    separator: "-mx-1 my-1 h-px bg-border",
    label: "flex w-full items-center font-semibold text-highlighted",
    item: "group relative flex w-full items-center rounded-sm text-default outline-none select-none before:absolute before:inset-px before:z-[-1] before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75 data-highlighted:text-highlighted data-highlighted:before:bg-elevated/50",
    itemLeadingIcon: "shrink-0 text-dimmed group-data-highlighted:text-default",
    itemTrailing: "ms-auto inline-flex items-center",
    itemKbd: "flex items-center gap-0.5",
    itemTrailingIcon: "shrink-0",
    itemLabel: "truncate",
    itemDescription: "truncate text-muted",
  },
  variants: {
    size: {
      sm: {
        label: "gap-1 p-1 text-xs",
        item: "gap-1 p-1 text-xs",
        itemLeadingIcon: "size-4",
        itemTrailingIcon: "size-4",
      },
      md: {
        label: "gap-1.5 p-1.5 text-sm",
        item: "gap-1.5 p-1.5 text-sm",
        itemLeadingIcon: "size-5",
        itemTrailingIcon: "size-5",
      },
      lg: {
        label: "gap-2 p-2 text-sm",
        item: "gap-2 p-2 text-sm",
        itemLeadingIcon: "size-5",
        itemTrailingIcon: "size-5",
      },
    },
  },
});

export type MenubarThemeVariants = VariantProps<typeof MenubarTheme>;
export type MenubarThemeSlots = Partial<(typeof MenubarTheme)["slots"]>;

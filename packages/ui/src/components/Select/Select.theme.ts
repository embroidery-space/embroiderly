import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const SelectTheme = tv({
  slots: {
    root: "relative inline-flex items-center",
    base: "inline-flex w-full items-center justify-between rounded-md border-0 text-start transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
    value: "truncate",
    placeholder: "truncate text-muted",
    trailingIcon: "shrink-0 text-muted",
    content:
      "pointer-events-auto min-w-(--reka-combobox-trigger-width) origin-(--reka-combobox-content-transform-origin) overflow-hidden rounded-md bg-default shadow-lg ring ring-default focus:outline-none data-[state=closed]:animate-[scale-out_100ms_ease-in] data-[state=open]:animate-[scale-in_100ms_ease-out]",
    viewport: "p-1",
    group: "",
    item: "flex cursor-default items-center justify-between rounded-sm text-default outline-none select-none hover:bg-elevated data-highlighted:bg-elevated",
    itemLabel: "truncate",
    itemIndicator: "shrink-0 text-primary",
    input: "w-full border-b border-default bg-default outline-none placeholder:text-muted",
    empty: "text-center text-sm text-muted",
  },
  variants: {
    color: {
      primary: {},
    },
    variant: {
      subtle: {
        base: "bg-elevated ring ring-accented ring-inset",
      },
    },
    size: {
      sm: {
        base: "gap-1 px-2 py-1 text-xs",
        trailingIcon: "size-4",
        item: "gap-1 p-1 text-xs",
        itemIndicator: "size-3",
        input: "px-2 py-1 text-xs",
        empty: "py-1 text-xs",
      },
      md: {
        base: "gap-1.5 px-2.5 py-1.5 text-sm",
        trailingIcon: "size-5",
        item: "gap-1.5 p-1.5 text-sm",
        itemIndicator: "size-4",
        input: "px-2.5 py-1.5 text-sm",
        empty: "py-1.5 text-sm",
      },
      lg: {
        base: "gap-2 px-3 py-2 text-base",
        trailingIcon: "size-6",
        item: "gap-2 p-2 text-base",
        itemIndicator: "size-5",
        input: "px-3 py-2 text-base",
        empty: "py-2 text-base",
      },
    },
    loading: {
      true: {
        trailingIcon: "animate-spin",
      },
    },
    disabled: {
      true: {
        base: "cursor-not-allowed opacity-75",
      },
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
  ],
});

export type SelectThemeVariants = VariantProps<typeof SelectTheme>;
export type SelectThemeSlots = Partial<(typeof SelectTheme)["slots"]>;

import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const InputTheme = tv({
  slots: {
    root: "relative inline-flex items-center",
    base: `
      w-full appearance-none rounded-md border-0 transition-colors
      focus:outline-none
      disabled:cursor-not-allowed disabled:opacity-75
    `,
    leading: "absolute inset-y-0 inset-s-0 flex items-center",
    trailing: "absolute inset-y-0 inset-e-0 flex items-center",
    leadingIcon: "shrink-0 text-dimmed",
    trailingIcon: "shrink-0 text-dimmed",
  },
  variants: {
    color: {
      primary: {},
    },
    variant: {
      subtle: { base: "bg-elevated ring ring-accented ring-inset" },
      outline: { base: "bg-default ring ring-accented ring-inset" },
      none: { base: "bg-transparent" },
    },
    size: {
      sm: {
        base: "gap-1 px-2 py-1 text-xs",
        leading: "ps-2",
        trailing: "pe-2",
        leadingIcon: "size-3",
        trailingIcon: "size-3",
      },
      md: {
        base: "gap-1.5 px-2.5 py-1.5 text-sm",
        leading: "ps-2.5",
        trailing: "pe-2.5",
        leadingIcon: "size-4",
        trailingIcon: "size-4",
      },
      lg: {
        base: "gap-2 px-3 py-2 text-base",
        leading: "ps-3",
        trailing: "pe-3",
        leadingIcon: "size-5",
        trailingIcon: "size-5",
      },
    },
    leading: {
      true: {},
    },
    trailing: {
      true: {},
    },
    loading: {
      true: {},
    },
    fieldGroup: {
      true: {
        root: `
          group
          has-focus-visible:z-1
        `,
        base: `
          group-not-last:group-not-first:rounded-none
          group-not-only:group-first:rounded-e-none
          group-not-only:group-last:rounded-s-none
        `,
      },
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "subtle",
      class: {
        base: `
          focus-visible:ring-2 focus-visible:ring-primary
          focus-visible:ring-inset
        `,
      },
    },
    {
      color: "primary",
      variant: "outline",
      class: {
        base: `
          focus-visible:ring-2 focus-visible:ring-primary
          focus-visible:ring-inset
        `,
      },
    },

    { leading: true, size: "sm", class: { base: "ps-7" } },
    { leading: true, size: "md", class: { base: "ps-9" } },
    { leading: true, size: "lg", class: { base: "ps-11" } },

    { trailing: true, size: "sm", class: { base: "pe-7" } },
    { trailing: true, size: "md", class: { base: "pe-9" } },
    { trailing: true, size: "lg", class: { base: "pe-11" } },

    {
      loading: true,
      leading: true,
      class: { leadingIcon: "animate-spin" },
    },
    {
      loading: true,
      leading: false,
      trailing: true,
      class: { trailingIcon: "animate-spin" },
    },
  ],
});

export type InputThemeVariants = VariantProps<typeof InputTheme>;
export type InputThemeSlots = Partial<(typeof InputTheme)["slots"]>;

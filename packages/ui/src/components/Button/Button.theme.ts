import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ButtonTheme = tv({
  slots: {
    base: "inline-flex items-center justify-center rounded-md transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2",
    label: "truncate",
    leadingIcon: "shrink-0",
    trailingIcon: "shrink-0",
  },
  variants: {
    color: {
      primary: {},
      neutral: {},
    },
    variant: {
      solid: {},
      outline: {
        base: "ring ring-inset",
      },
      soft: {},
      subtle: {
        base: "ring ring-inset",
      },
      ghost: {
        base: "disabled:bg-transparent aria-disabled:bg-transparent",
      },
      link: {},
    },
    size: {
      xs: {
        base: "px-2 py-1 gap-1",
        leadingIcon: "size-4",
        trailingIcon: "size-4",
      },
      sm: {
        base: "px-2.5 py-1.5 gap-1.5",
        leadingIcon: "size-4",
        trailingIcon: "size-4",
      },
      md: {
        base: "px-2.5 py-1.5 gap-1.5",
        leadingIcon: "size-5",
        trailingIcon: "size-5",
      },
      lg: {
        base: "px-3 py-2 gap-2",
        leadingIcon: "size-5",
        trailingIcon: "size-5",
      },
      xl: {
        base: "px-3 py-2 gap-2",
        leadingIcon: "size-6",
        trailingIcon: "size-6",
      },
    },
    loading: {
      true: {},
    },
    square: {
      true: {},
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
      variant: "solid",
      class: {
        base: "bg-primary text-inverted hover:bg-primary/75 active:bg-primary/75 focus-visible:outline-primary disabled:bg-primary aria-disabled:bg-primary",
      },
    },
    {
      color: "neutral",
      variant: "solid",
      class: {
        base: "bg-inverted text-inverted hover:bg-inverted/90 active:bg-inverted/90 focus-visible:outline-inverted disabled:bg-inverted aria-disabled:bg-inverted",
      },
    },

    {
      color: "primary",
      variant: "outline",
      class: {
        base: "ring-primary/50 text-primary hover:bg-primary/10 active:bg-primary/10 focus-visible:outline-primary disabled:bg-transparent",
      },
    },
    {
      color: "neutral",
      variant: "outline",
      class: {
        base: "ring-accented text-default bg-default hover:bg-elevated active:bg-elevated focus-visible:outline-inverted disabled:bg-default",
      },
    },

    {
      color: "primary",
      variant: "soft",
      class: {
        base: "text-primary bg-primary/10 hover:bg-primary/15 active:bg-primary/15 focus-visible:outline-primary disabled:bg-primary/10",
      },
    },
    {
      color: "neutral",
      variant: "soft",
      class: {
        base: "text-default bg-elevated hover:bg-accented/75 active:bg-accented/75 focus-visible:outline-inverted disabled:bg-elevated",
      },
    },

    {
      color: "primary",
      variant: "subtle",
      class: {
        base: "text-primary ring-primary/25 bg-primary/10 hover:bg-primary/15 active:bg-primary/15 focus-visible:outline-primary disabled:bg-primary/10",
      },
    },
    {
      color: "neutral",
      variant: "subtle",
      class: {
        base: "text-default ring-accented bg-elevated hover:bg-accented/75 active:bg-accented/75 focus-visible:outline-inverted disabled:bg-elevated",
      },
    },

    {
      color: "primary",
      variant: "ghost",
      class: {
        base: "text-primary hover:bg-primary/10 active:bg-primary/10 focus-visible:outline-primary",
      },
    },
    {
      color: "neutral",
      variant: "ghost",
      class: {
        base: "text-default hover:bg-elevated active:bg-elevated focus-visible:outline-inverted",
      },
    },

    {
      color: "primary",
      variant: "link",
      class: {
        base: "text-primary hover:text-primary/75 active:text-primary/75 focus-visible:outline-primary",
      },
    },
    {
      color: "neutral",
      variant: "link",
      class: {
        base: "text-muted hover:text-default active:text-default focus-visible:outline-inverted",
      },
    },

    { square: true, size: "xs", class: { base: "p-1" } },
    { square: true, size: "sm", class: { base: "p-1.5" } },
    { square: true, size: "md", class: { base: "p-1.5" } },
    { square: true, size: "lg", class: { base: "p-2" } },
    { square: true, size: "xl", class: { base: "p-2" } },

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

export type ButtonThemeVariants = VariantProps<typeof ButtonTheme>;
export type ButtonThemeSlots = Partial<(typeof ButtonTheme)["slots"]>;

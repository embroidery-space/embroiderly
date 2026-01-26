import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ButtonTheme = tv({
  slots: {
    base: "inline-flex items-center justify-center rounded-md transition-colors hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75",
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
      sm: {
        base: "gap-1 px-2 py-1 text-xs",
        leadingIcon: "size-3",
        trailingIcon: "size-3",
      },
      md: {
        base: "gap-1.5 px-2.5 py-1.5 text-sm",
        leadingIcon: "size-4",
        trailingIcon: "size-4",
      },
      lg: {
        base: "gap-2 px-3 py-2 text-base",
        leadingIcon: "size-5",
        trailingIcon: "size-5",
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
        base: "bg-primary text-inverted hover:bg-primary/75 focus-visible:outline-primary active:bg-primary/75 disabled:bg-primary aria-disabled:bg-primary",
      },
    },
    {
      color: "neutral",
      variant: "solid",
      class: {
        base: "bg-inverted text-inverted hover:bg-inverted/90 focus-visible:outline-inverted active:bg-inverted/90 disabled:bg-inverted aria-disabled:bg-inverted",
      },
    },

    {
      color: "primary",
      variant: "outline",
      class: {
        base: "text-primary ring-primary/50 hover:bg-primary/10 focus-visible:outline-primary active:bg-primary/10 disabled:bg-transparent",
      },
    },
    {
      color: "neutral",
      variant: "outline",
      class: {
        base: "bg-default text-default ring-accented hover:bg-elevated focus-visible:outline-inverted active:bg-elevated disabled:bg-default",
      },
    },

    {
      color: "primary",
      variant: "soft",
      class: {
        base: "bg-primary/10 text-primary hover:bg-primary/15 focus-visible:outline-primary active:bg-primary/15 disabled:bg-primary/10",
      },
    },
    {
      color: "neutral",
      variant: "soft",
      class: {
        base: "bg-elevated text-default hover:bg-accented/75 focus-visible:outline-inverted active:bg-accented/75 disabled:bg-elevated",
      },
    },

    {
      color: "primary",
      variant: "subtle",
      class: {
        base: "bg-primary/10 text-primary ring-primary/25 hover:bg-primary/15 focus-visible:outline-primary active:bg-primary/15 disabled:bg-primary/10",
      },
    },
    {
      color: "neutral",
      variant: "subtle",
      class: {
        base: "bg-elevated text-default ring-accented hover:bg-accented/75 focus-visible:outline-inverted active:bg-accented/75 disabled:bg-elevated",
      },
    },

    {
      color: "primary",
      variant: "ghost",
      class: {
        base: "text-primary hover:bg-primary/10 focus-visible:outline-primary active:bg-primary/10",
      },
    },
    {
      color: "neutral",
      variant: "ghost",
      class: {
        base: "text-default hover:bg-elevated focus-visible:outline-inverted active:bg-elevated",
      },
    },

    {
      color: "primary",
      variant: "link",
      class: {
        base: "text-primary hover:text-primary/75 focus-visible:outline-primary active:text-primary/75",
      },
    },
    {
      color: "neutral",
      variant: "link",
      class: {
        base: "text-muted hover:text-default focus-visible:outline-inverted active:text-default",
      },
    },

    { square: true, size: "sm", class: { base: "p-1" } },
    { square: true, size: "md", class: { base: "p-1.5" } },
    { square: true, size: "lg", class: { base: "p-2" } },

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

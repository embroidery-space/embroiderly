import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:cursor-not-allowed aria-disabled:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      color: {
        primary: "",
        neutral: "",
      },
      variant: {
        solid: "",
        outline: "ring ring-inset",
        soft: "",
        subtle: "ring ring-inset",
        ghost: "disabled:bg-transparent aria-disabled:bg-transparent",
        link: "",
      },
      size: {
        xs: "px-2 py-1 gap-1",
        sm: "px-2.5 py-1.5 gap-1.5",
        md: "px-2.5 py-1.5 gap-1.5",
        lg: "px-3 py-2 gap-2",
        xl: "px-3 py-2 gap-2",
      },
    },
    compoundVariants: [
      {
        color: "primary",
        variant: "solid",
        class:
          "bg-primary text-inverted hover:bg-primary/75 active:bg-primary/75 focus-visible:outline-primary disabled:bg-primary aria-disabled:bg-primary",
      },
      {
        color: "neutral",
        variant: "solid",
        class:
          "bg-inverted text-inverted hover:bg-inverted/90 active:bg-inverted/90 focus-visible:outline-inverted disabled:bg-inverted aria-disabled:bg-inverted",
      },

      {
        color: "primary",
        variant: "outline",
        class:
          "ring-primary/50 text-primary hover:bg-primary/10 active:bg-primary/10 focus-visible:outline-primary disabled:bg-transparent",
      },
      {
        color: "neutral",
        variant: "outline",
        class:
          "ring-accented text-default bg-default hover:bg-elevated active:bg-elevated focus-visible:outline-inverted disabled:bg-default",
      },

      {
        color: "primary",
        variant: "soft",
        class:
          "text-primary bg-primary/10 hover:bg-primary/15 active:bg-primary/15 focus-visible:outline-primary disabled:bg-primary/10",
      },
      {
        color: "neutral",
        variant: "soft",
        class:
          "text-default bg-elevated hover:bg-accented/75 active:bg-accented/75 focus-visible:outline-inverted disabled:bg-elevated",
      },

      {
        color: "primary",
        variant: "subtle",
        class:
          "text-primary ring-primary/25 bg-primary/10 hover:bg-primary/15 active:bg-primary/15 focus-visible:outline-primary disabled:bg-primary/10",
      },
      {
        color: "neutral",
        variant: "subtle",
        class:
          "text-default ring-accented bg-elevated hover:bg-accented/75 active:bg-accented/75 focus-visible:outline-inverted disabled:bg-elevated",
      },

      {
        color: "primary",
        variant: "ghost",
        class: "text-primary hover:bg-primary/10 active:bg-primary/10 focus-visible:outline-primary",
      },
      {
        color: "neutral",
        variant: "ghost",
        class: "text-default hover:bg-elevated active:bg-elevated focus-visible:outline-inverted",
      },

      {
        color: "primary",
        variant: "link",
        class: "text-primary hover:text-primary/75 active:text-primary/75 focus-visible:outline-primary",
      },
      {
        color: "neutral",
        variant: "link",
        class: "text-muted hover:text-default active:text-default focus-visible:outline-inverted",
      },
    ],
  },
);
export type ButtonVariants = VariantProps<typeof buttonVariants>;

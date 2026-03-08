import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ToolToggleTheme = tv({
  slots: {
    root: "relative flex",
    base: "inline-flex items-center justify-center rounded-md text-dimmed transition-colors not-disabled:hover:cursor-pointer not-disabled:hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverted active:bg-elevated aria-pressed:bg-elevated not-disabled:aria-pressed:hover:bg-accented",
    icon: "size-5 shrink-0",
    wrapper: "ms-2 w-full",
    label: "block font-medium text-default not-disabled:hover:cursor-pointer",
    description: "text-muted",
  },
  variants: {
    size: {
      sm: {
        base: "p-1",
        icon: "size-3",
        wrapper: "text-xs",
      },
      md: {
        base: "p-1.5",
        icon: "size-4",
        wrapper: "text-sm",
      },
      lg: {
        base: "p-2",
        icon: "size-5",
        wrapper: "text-base",
      },
    },

    disabled: {
      true: {
        root: "opacity-75",
        base: "cursor-not-allowed",
        label: "cursor-not-allowed",
        description: "cursor-not-allowed",
      },
    },
  },
});

export type ToolToggleThemeVariants = VariantProps<typeof ToolToggleTheme>;
export type ToolToggleThemeSlots = Partial<(typeof ToolToggleTheme)["slots"]>;

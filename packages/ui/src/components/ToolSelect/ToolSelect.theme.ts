import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ToolSelectTheme = tv({
  slots: {
    root: "relative inline-block",
    mainButton: `
      inline-flex items-center justify-center rounded-md text-dimmed
      transition-colors
      not-disabled:hover:cursor-pointer not-disabled:hover:bg-elevated
      focus-visible:outline-2 focus-visible:outline-offset-2
      focus-visible:outline-inverted
      not-disabled:active:bg-elevated
    `,
    mainButtonIcon: "shrink-0",
    dropdownButton: `
      absolute right-0 bottom-0 rounded-sm border-none p-0
      not-disabled:hover:cursor-pointer
    `,
    dropdownButtonIcon: "absolute top-1/2 left-1/2 -translate-1/2 -rotate-45",
  },
  variants: {
    size: {
      sm: {
        mainButton: "p-1",
        mainButtonIcon: "size-3",
        dropdownButton: "size-2",
        dropdownButtonIcon: "size-2",
      },
      md: {
        mainButton: "p-1.5",
        mainButtonIcon: "size-4",
        dropdownButton: "size-2.5",
        dropdownButtonIcon: "size-2.5",
      },
      lg: {
        mainButton: "p-2",
        mainButtonIcon: "size-5",
        dropdownButton: "size-3",
        dropdownButtonIcon: "size-3",
      },
    },
    selected: {
      true: {
        mainButton: `
          bg-elevated
          hover:bg-accented
        `,
      },
    },
    disabled: {
      true: {
        root: "opacity-75",
        mainButton: "cursor-not-allowed",
        dropdownButton: "cursor-not-allowed",
      },
    },
  },
});

export type ToolSelectThemeVariants = VariantProps<typeof ToolSelectTheme>;
export type ToolSelectThemeSlots = Partial<(typeof ToolSelectTheme)["slots"]>;

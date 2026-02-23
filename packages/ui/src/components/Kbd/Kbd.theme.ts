import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const KbdTheme = tv({
  slots: {
    base: "inline-flex items-center justify-center rounded-sm bg-default px-1 font-sans font-medium text-default ring ring-accented ring-inset",
  },
  variants: {
    size: {
      sm: {
        base: "h-4 min-w-4 text-[10px]",
      },
      md: {
        base: "h-5 min-w-5 text-[11px]",
      },
      lg: {
        base: "h-6 min-w-6 text-[12px]",
      },
    },
  },
});

export type KbdThemeVariants = VariantProps<typeof KbdTheme>;
export type KbdThemeSlots = Partial<(typeof KbdTheme)["slots"]>;

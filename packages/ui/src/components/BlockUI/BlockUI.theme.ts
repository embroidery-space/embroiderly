import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const BlockUITheme = tv({
  slots: {
    base: "relative",
    mask: "absolute top-0 left-0 size-full bg-black/50",
  },
});

export type BlockUIThemeVariants = VariantProps<typeof BlockUITheme>;
export type BlockUIThemeSlots = Partial<(typeof BlockUITheme)["slots"]>;

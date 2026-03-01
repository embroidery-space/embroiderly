import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ScrollAreaTheme = tv({
  slots: {
    root: "relative overflow-hidden",
    viewport: "size-full",
    scrollbar: "group/scrollbar flex touch-none items-center transition-colors duration-150 select-none",
    thumb: "relative rounded-full bg-inverted duration-150",
  },
  variants: {
    orientation: {
      vertical: {
        scrollbar: "h-full flex-col",
        thumb: "w-1/2! transition-[width] group-hover/scrollbar:w-full!",
      },
      horizontal: {
        scrollbar: "w-full flex-row",
        thumb: "h-1/2! transition-[height] group-hover/scrollbar:h-full!",
      },
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    ephemeral: { true: {} },
  },
  compoundVariants: [
    { orientation: "vertical", size: "sm", class: { viewport: "pr-1", scrollbar: "w-1 p-px" } },
    { orientation: "vertical", size: "md", class: { viewport: "pr-2", scrollbar: "w-2 p-0.5" } },
    { orientation: "vertical", size: "lg", class: { viewport: "pr-3", scrollbar: "w-3 p-0.75" } },
    { orientation: "horizontal", size: "sm", class: { viewport: "pb-1", scrollbar: "h-1 p-px" } },
    { orientation: "horizontal", size: "md", class: { viewport: "pb-2", scrollbar: "h-2 p-0.5" } },
    { orientation: "horizontal", size: "lg", class: { viewport: "pb-3", scrollbar: "h-3 p-0.75" } },

    { ephemeral: false, class: { scrollbar: "bg-elevated hover:bg-accented" } },
    { ephemeral: true, class: { viewport: "p-0", scrollbar: "bg-default/50 hover:bg-default/75" } },
  ],
});

export type ScrollAreaThemeVariants = VariantProps<typeof ScrollAreaTheme>;
export type ScrollAreaThemeSlots = Partial<(typeof ScrollAreaTheme)["slots"]>;

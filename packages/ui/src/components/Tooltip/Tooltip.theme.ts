import { tv } from "tailwind-variants";

export const TooltipTheme = tv({
  slots: {
    content:
      "flex items-center gap-1 bg-default text-highlighted shadow-sm rounded-sm ring ring-default h-6 px-2.5 py-1 text-xs select-none data-[state=delayed-open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-tooltip-content-transform-origin) pointer-events-auto",
    arrow: "fill-default",
    text: "truncate",
  },
});

export type TooltipThemeSlots = Partial<(typeof TooltipTheme)["slots"]>;

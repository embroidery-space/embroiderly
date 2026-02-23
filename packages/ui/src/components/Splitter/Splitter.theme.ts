import { tv } from "tailwind-variants";

export const SplitterTheme = tv({
  slots: {
    base: "",
    panel: "",
    handle: "border-2 border-default",
  },
});

export type SplitterThemeSlots = Partial<(typeof SplitterTheme)["slots"]>;

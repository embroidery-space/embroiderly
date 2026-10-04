import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";
import { typstTags as tt } from "codemirror-lang-typst/lezer";

export const nordLight = createTheme({
  theme: "light",
  settings: {
    background: "var(--nord-6)",
    foreground: "var(--nord-1)",
    caret: "var(--nord-10)",
    selection: "var(--nord-4)",
    selectionMatch: "color-mix(in oklab, var(--nord-5) 80%, transparent)",
    lineHighlight: "color-mix(in oklab, var(--nord-5) 50%, transparent)",
    gutterBackground: "var(--nord-6)",
    gutterForeground: "var(--nord-3)",
    gutterActiveForeground: "var(--nord-0)",
    gutterBorder: "transparent",
  },
  styles: [
    // Markup.
    { tag: t.heading, color: "var(--nord-0)", fontWeight: "bold", textDecoration: "underline" },
    { tag: t.strong, color: "var(--nord-0)", fontWeight: "bold" },
    { tag: t.emphasis, color: "var(--nord-0)", fontStyle: "italic" },
    { tag: t.link, color: "var(--nord-0)", textDecoration: "underline" },
    { tag: t.monospace, color: "var(--nord-14)" },
    { tag: tt.listMarker, color: "var(--nord-15)" },
    { tag: tt.mathDelimiter, color: "var(--nord-14)" },

    // Script.
    { tag: tt.interpolated, color: "inherit" },
    { tag: t.string, color: "var(--nord-14)" },
    { tag: t.number, color: "var(--nord-12)" },
    { tag: t.bool, color: "var(--nord-12)" },
    { tag: t.keyword, color: "var(--nord-11)" },
    { tag: t.operator, color: "var(--nord-11)" },
    { tag: t.punctuation, color: "var(--nord-0)" },
    { tag: t.propertyName, color: "var(--nord-0)" },
    { tag: t.function(t.variableName), color: "var(--nord-10)" },

    // Utility.
    { tag: t.escape, color: "var(--nord-10)" },
    { tag: t.comment, color: "var(--nord-3)", fontStyle: "italic" },
    { tag: t.invalid, color: "var(--nord-11)" },
  ],
});

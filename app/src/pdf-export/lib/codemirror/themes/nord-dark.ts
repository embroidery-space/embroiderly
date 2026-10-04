import { tags as t } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";
import { typstTags as tt } from "codemirror-lang-typst/lezer";

export const nordDark = createTheme({
  theme: "dark",
  settings: {
    background: "var(--nord-0)",
    foreground: "var(--nord-4)",
    caret: "var(--nord-8)",
    selection: "var(--nord-2)",
    selectionMatch: "color-mix(in oklab, var(--nord-2) 70%, transparent)",
    lineHighlight: "color-mix(in oklab, var(--nord-1) 50%, transparent)",
    gutterBackground: "var(--nord-0)",
    gutterForeground: "var(--nord-3)",
    gutterActiveForeground: "var(--nord-4)",
    gutterBorder: "transparent",
  },
  styles: [
    // Markup.
    { tag: t.heading, color: "var(--nord-4)", fontWeight: "bold", textDecoration: "underline" },
    { tag: t.strong, color: "var(--nord-4)", fontWeight: "bold" },
    { tag: t.emphasis, color: "var(--nord-4)", fontStyle: "italic" },
    { tag: t.link, color: "var(--nord-4)", textDecoration: "underline" },
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
    { tag: t.punctuation, color: "var(--nord-4)" },
    { tag: t.propertyName, color: "var(--nord-4)" },
    { tag: t.function(t.variableName), color: "var(--nord-9)" },

    // Utility.
    { tag: t.escape, color: "var(--nord-9)" },
    { tag: t.comment, color: "var(--nord-3)", fontStyle: "italic" },
    { tag: t.invalid, color: "var(--nord-11)" },
  ],
});

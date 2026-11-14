import { EditorView } from "@codemirror/view";

import { nordDark } from "../themes/nord-dark.ts";
import { nordLight } from "../themes/nord-light.ts";

export interface TypstEditorSettings {
  fontSize?: number;
  fontLigatures?: boolean;
  wrapLines?: boolean;
}

const DEFAULT_TYPST_EDITOR_SETTINGS: Required<TypstEditorSettings> = {
  fontSize: 14,
  fontLigatures: true,
  wrapLines: false,
};

export function typstTheme(dark = false, settings?: TypstEditorSettings) {
  const { fontSize, fontLigatures, wrapLines } = Object.assign({}, DEFAULT_TYPST_EDITOR_SETTINGS, settings);

  const extensions = [
    dark ? nordDark : nordLight,
    EditorView.theme({
      "&": {
        fontSize: `${fontSize}px`,
      },
      ".cm-content": {
        fontFeatureSettings: fontLigatures
          ? '"calt" 1, "liga" 1, "ss01" 1, "ss02" 1, "ss03" 1, "ss04" 1, "ss05" 1, "ss06" 1, "ss07" 1, "ss08" 1, "ss09" 1, "ss10" 1'
          : "normal",
      },
    }),
  ];

  if (wrapLines) extensions.push(EditorView.lineWrapping);

  return extensions;
}

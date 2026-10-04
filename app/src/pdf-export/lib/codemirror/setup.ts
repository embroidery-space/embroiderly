import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { foldGutter } from "@codemirror/language";
import { highlightSelectionMatches } from "@codemirror/search";
import {
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  lineNumbers,
} from "@codemirror/view";

export const editorSetup = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  foldGutter(),
  drawSelection(),
  closeBrackets(),
  autocompletion(),
  highlightActiveLine(),
  highlightSelectionMatches(),
];

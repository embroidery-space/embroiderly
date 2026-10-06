import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { foldGutter } from "@codemirror/language";
import { highlightSelectionMatches } from "@codemirror/search";
import {
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from "@codemirror/view";

export const editorSetup = [
  lineNumbers(),
  foldGutter(),
  drawSelection(),
  closeBrackets(),
  autocompletion(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  highlightSelectionMatches(),
  highlightSpecialChars(),
  history(),
  keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
];

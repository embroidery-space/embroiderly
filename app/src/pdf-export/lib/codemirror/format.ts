import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

const TYPST_HEADING_RE = /^(={1,6})\s+/u;

export function toggleHeading(view: EditorView, level: number) {
  const heading = "=".repeat(level) + " ";

  const state = view.state;
  const doc = state.doc;

  const transaction = state.changeByRange((range) => {
    const line = doc.lineAt(range.from);

    const headingMatch = line.text.match(TYPST_HEADING_RE);
    if (headingMatch) {
      const existingHeading = headingMatch[0];
      if (existingHeading.length === level) {
        return {
          changes: [{ from: line.from, to: line.from + existingHeading.length, insert: "" }],
          range: EditorSelection.range(
            Math.max(line.from, range.from - existingHeading.length),
            Math.max(line.from, range.to - existingHeading.length),
          ),
        };
      }

      const diff = heading.length - existingHeading.length;
      return {
        changes: [{ from: line.from, to: line.from + existingHeading.length, insert: heading }],
        range: EditorSelection.range(range.from + diff, range.to + diff),
      };
    }

    return {
      changes: [{ from: line.from, to: line.from, insert: heading }],
      range: EditorSelection.range(range.from + heading.length, range.to + heading.length),
    };
  });

  view.dispatch(transaction);
}

export function toggleFormatting(view: EditorView, left: string, right: string) {
  const state = view.state;
  const doc = state.doc;

  const transaction = state.changeByRange((range) => {
    let { from, to, empty: isCursor } = range;
    if (isCursor) {
      const word = state.wordAt(range.head);
      if (word) {
        from = word.from;
        to = word.to;
        isCursor = false;
      }
    }

    const hasLeft = from >= left.length && doc.sliceString(from - left.length, from) === left;
    const hasRight = to <= doc.length - right.length && doc.sliceString(to, to + right.length) === right;
    if (hasLeft && hasRight) {
      return {
        changes: [
          { from: to, to: to + right.length, insert: "" },
          { from: from - left.length, to: from, insert: "" },
        ],
        range: isCursor
          ? EditorSelection.cursor(from - left.length)
          : EditorSelection.range(from - left.length, to - left.length),
      };
    }

    if (isCursor) {
      return {
        changes: [{ from, insert: left + right }],
        range: EditorSelection.cursor(from + left.length),
      };
    }

    return {
      changes: [
        { from, insert: left },
        { from: to, insert: right },
      ],
      range: EditorSelection.range(from + left.length, to + left.length),
    };
  });

  view.dispatch(transaction);
}

import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

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

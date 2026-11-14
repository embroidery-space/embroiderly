import { EditorSelection } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

const TYPST_HEADING_RE = /^(={1,6})\s+/u;
const TYPST_LIST_RE = /^(\s*)(\d+\.|[+-])(\s+)/u;

export function toggleHeading(view: EditorView, level: number) {
  const heading = "=".repeat(level) + " ";

  const state = view.state;
  const doc = state.doc;

  const transaction = state.changeByRange((range) => {
    const line = doc.lineAt(range.from);

    const headingMatch = line.text.match(TYPST_HEADING_RE);
    if (headingMatch) {
      const existingHeading = headingMatch[0]!;
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

export function toggleList(view: EditorView, marker: string) {
  const state = view.state;
  const doc = state.doc;

  const transaction = state.changeByRange((range) => {
    const line = doc.lineAt(range.from);

    const listMatch = line.text.match(TYPST_LIST_RE);
    if (listMatch) {
      const indent = listMatch[1]!;
      const existingMarker = listMatch[2]!;
      const spacing = listMatch[3]!;

      if (existingMarker === marker) {
        const removeLength = existingMarker.length + spacing.length;
        return {
          changes: [{ from: line.from + indent.length, to: line.from + indent.length + removeLength, insert: "" }],
          range: EditorSelection.range(
            Math.max(line.from, range.from - removeLength),
            Math.max(line.from, range.to - removeLength),
          ),
        };
      }

      const diff = marker.length - existingMarker.length;
      return {
        changes: [
          { from: line.from + indent.length, to: line.from + indent.length + existingMarker.length, insert: marker },
        ],
        range: EditorSelection.range(range.from + diff, range.to + diff),
      };
    }

    const indent = line.text.match(/^(\s*)/u)?.[1] ?? "";
    const insertPos = line.from + indent.length;
    const insertText = marker + " ";

    return {
      changes: [{ from: insertPos, to: insertPos, insert: insertText }],
      range: EditorSelection.range(range.from + insertText.length, range.to + insertText.length),
    };
  });

  view.dispatch(transaction);
}

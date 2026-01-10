import type { MarkdownRenderer } from "vitepress";

const PROBLEM_CHARS_RE = /[йї_]/g;
const REPLACEMENTS: Record<string, string> = {
  й: "и",
  ї: "і",
  _: "-",
};

/** Fixes links anchors. */
export function betterAnchors(md: MarkdownRenderer) {
  md.inline.ruler.before("text", "better-anchors", (state) => {
    for (const token of state.tokens) {
      if (token.type !== "link_open") continue;

      const href = token.attrGet("href");
      if (href === null || !/^[.#]/.test(href)) continue;

      const [base, anchor] = href.split("#");
      if (anchor === undefined) continue;

      const newHref = `${base}#${encodeURI(decodeURI(anchor).replaceAll(PROBLEM_CHARS_RE, (ch) => REPLACEMENTS[ch]))}`;
      token.attrSet("href", newHref);
    }
    return false;
  });
}

import { Language, languageDataProp, LanguageSupport, syntaxHighlighting } from "@codemirror/language";
import {
  TypstHighlightSytle,
  typstLezerFolding,
  typstLezerFoldService,
  typstLezerHighlighting,
  typstLezerIndentation,
  typstLezerIndentService,
  typstLezerLanguageData,
  typstLezerListKeymap,
  TypstLezerParser,
} from "codemirror-lang-typst/lezer";

/**
 * A custom Typst plugin based on <https://github.com/kxxt/codemirror-lang-typst/blob/main/src/lezer.ts#L152-L177>,
 * but without the default code highlighting (inherited from <https://typst.app/play>) and linting.
 *
 * We rely on the real Typst compiler for rendering lint errors and warnings.
 */
export function typst() {
  const parser = new TypstLezerParser(
    languageDataProp.add((type) => (type.isTop ? typstLezerLanguageData : undefined)),
    typstLezerHighlighting,
    typstLezerIndentation,
    typstLezerFolding,
  );

  const support = [
    syntaxHighlighting(TypstHighlightSytle),
    typstLezerIndentService,
    typstLezerListKeymap,
    typstLezerFoldService,
  ];

  return new LanguageSupport(new Language(typstLezerLanguageData, parser, [], "typst"), support);
}

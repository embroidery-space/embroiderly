#let lang = sys.inputs.at("lang", default: "en")

#import "@preview/cmarker:0.1.8"

#import "admonitions.typ"
#import "markdown.typ"

#import "locales/" + lang + ".typ": strings
#import "titlepage.typ": titlepage

#set document(
  title: [#strings.document-title],
  author: strings.document-author,
)

#set page(
  paper: "a4",
  margin: auto,
)

#set text(
  font: "Inter",
  lang: lang,
)

#show link: underline

#titlepage()
#pagebreak()

#outline()

#counter(page).update(1)
#set page(numbering: "1")

#cmarker.render(
  markdown.pagebreak
  + markdown.read("../" + lang + "/guide/index.md")
  + markdown.read("../" + lang + "/guide/pattern-options.md")
  + markdown.read("../" + lang + "/guide/palette-and-symbols.md")
  + markdown.read("../" + lang + "/guide/working-with-patterns.md")
  + markdown.read("../" + lang + "/guide/importing-images.md")
  + markdown.read("../" + lang + "/guide/reference-images.md")
  + markdown.read("../" + lang + "/guide/publishing-patterns.md")
  + markdown.pagebreak
  + markdown.read("../" + lang + "/reference/pattern-formats.md")
  + markdown.read("../" + lang + "/reference/shortcuts.md"),
  scope: (
    image: (source, alt: none, format: auto) => image("../public/" + source, alt: alt, format: format),
    quote: admonitions.quote,
  ),
)

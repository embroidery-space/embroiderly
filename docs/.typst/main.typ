#import "@preview/cmarker:0.1.8"

#import "admonitions.typ"
#import "markdown.typ"

#let lang = sys.inputs.at("lang", default: "en")

#set page(
  paper: "a4",
  margin: auto,
  numbering: "1"
)

#set text(
  font: "Inter",
  lang: lang,
)

#outline()

#show link: underline

#cmarker.render(
  markdown.pagebreak
  + markdown.read("../" + lang + "/guide/index.md")
  + markdown.read("../" + lang + "/guide/pattern-options.md")
  // + markdown.read("../" + lang + "/guide/palette-and-symbols.md")
  // + markdown.read("../" + lang + "/guide/working-with-patterns.md")
  // + markdown.read("../" + lang + "/guide/importing-images.md")
  // + markdown.read("../" + lang + "/guide/reference-images.md")
  // + markdown.read("../" + lang + "/guide/publishing-patterns.md")
  + markdown.pagebreak
  + markdown.read("../" + lang + "/reference/pattern-formats.md")
  + markdown.read("../" + lang + "/reference/shortcuts.md"),
  scope: (
    image: (source, alt: none, format: auto) => image("../public/" + source, alt: alt, format: format),
    quote: admonitions.quote,
  ),
)

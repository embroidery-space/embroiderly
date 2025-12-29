#import "@preview/cmarker:0.1.7"

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
  + markdown.read("../" + lang + "/guide/overview.md")
  + markdown.read("../" + lang + "/guide/getting-started.md")
  + markdown.read("../" + lang + "/guide/palette-and-symbols.md")
  + markdown.read("../" + lang + "/guide/working-with-patterns.md")
  + markdown.read("../" + lang + "/guide/working-with-images.md")
  + markdown.read("../" + lang + "/guide/publishing-patterns.md"),
  scope: (
    image: (source, alt: none, format: auto) => image("../public/" + source, alt: alt, format: format),
    quote: admonitions.quote,
  ),
)

#let lang = sys.inputs.at("lang", default: "en")

#import "locales/" + lang + ".typ": strings, license

#let titlepage() = {
  block(height: 100%, width: 100%)[
    #set align(center)

    #text(size: 3.5em, weight: "bold")[Embroiderly]
    #v(0.5em)
    #text(size: 1.5em, style: "italic", fill: gray.darken(20%))[#strings.tagline]

    #v(1fr)
    #license(link("https://github.com/embroidery-space/embroiderly/blob/main/LICENSE")[GPL-3.0-or-later])
  ]
}

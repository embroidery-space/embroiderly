#let pattern = json("pattern.json")
#let color = sys.inputs.at("color", default: true)

#set document(
  title: [#pattern.info.title],
  author: pattern.info.author,
  description: [#pattern.info.description],
)

#set page(
  paper: "a4",
  header: context [
    #set text(10pt)
    Page #counter(page).display("1") #h(1em)
    #emph[#pattern.info.title] #h(1fr) #emph[#pattern.info.author]
  ],
)
#set text(font: "Fixel", size: 14pt)

// Pattern info.
#table(
  stroke: none,
  columns: 2,
  [*Pattern name:*], [#pattern.info.title],
  [*Designed by:*],
  [
    #pattern.info.author
    #if pattern.info.copyright.len() != 0 [
      © #pattern.info.copyright
    ]
  ],
  [*Fabric:*],
  [
    #pattern.fabric.kind #pattern.fabric.name,
    #{ [#pattern.fabric.width] + [W] } x #{ [#pattern.fabric.height] + [H] } Stitches
  ],
  table.cell(colspan: 2, [*Description:*]),
  table.cell(colspan: 2, [#pattern.info.description]),
)

// Palette.
#table(
  stroke: none,
  columns: 4,
  table.header[*Symbol*][*Brand*][*Number*][*Color Name*],
  table.hline(),
  ..for palitem in pattern.palette {
    (
      [
        #if palitem.symbol != none {
          set text(font: palitem.symbol.font)
          set align(center)
          str.from-unicode(palitem.symbol.char)
        }
      ],
      [#palitem.brand],
      [#palitem.number],
      [#palitem.name],
    )
  },
)

// Pattern frames.
#let frames = render-frames(pattern, color)
#for (i, frame) in frames.enumerate(start: 1) {
  pagebreak(weak: true)
  figure(frame, numbering: none, caption: [Frame #i/#frames.len()])
}

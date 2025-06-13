#let pattern = sys.inputs

#set document(
  title: [#pattern.info.title],
  author: pattern.info.author,
  description: [#pattern.info.description]
)

#set page(
  paper: "a4",
  header: context [
    #set text(10pt)
    Page #counter(page).display("1") #h(1em)
    #emph[#pattern.info.title] #h(1fr) #emph[#pattern.info.author]
  ]
)
#set text(font: "Noto Serif", size: 14pt)

#table(
  stroke: none,
  columns: 2,
  [*Pattern name:*], [#pattern.info.title],
  [*Designed by:*], [
    #pattern.info.author
    #if pattern.info.copyright.len() != 0 [
      © #pattern.info.copyright
    ]
  ],
  [*Fabric:*], [
    #pattern.fabric.kind #pattern.fabric.name,
    #{ [#pattern.fabric.width] + [W]} x #{ [#pattern.fabric.height] + [H]} Stitches
  ],
  table.cell(colspan: 2, [*Description:*]),
  table.cell(colspan: 2, [#pattern.info.description])
)

#table(
  stroke: none,
  columns: 4,
  table.header[*Symbol*][*Brand*][*Number*][*Color Name*],
  table.hline(),
  ..for palitem in pattern.palette {
    (
      [
        #set text(font: if palitem.symbol_font != none {
          palitem.symbol_font
        } else {
          pattern.default_symbol_font
        })
        #set align(center)
        #palitem.symbol
      ],
      [#palitem.brand],
      [#palitem.number],
      [#palitem.name]
    )
  }
)

#for image_path in pattern.images {
  pagebreak()
  image(image_path)
}

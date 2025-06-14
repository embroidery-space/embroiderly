/*
  Typst Template for Exporting Embroider Patterns into PDF Documents.
  This template uses the Typst's markup and scripting capabilities to compose and style a PDF document
  See: https://typst.app.
*/

/*
  This template accepts a pattern object through the `sys.inputs` module.

  The pattern object has the following structure:
  ```
  {
    info: {
      title: string,
      author: string,
      copyright: string,
      description: string,
    },
    fabric: {
      width: string, // in stitches, can be converted to the number using `#int()`
      height: string, // in stitches, can be converted to the number using `#int()`
      spi: [string, string], // Stitches per inch (x, y), e.g., ["14", "14"]
      kind: string, // e.g., "Aida"
      name: string, // this is the name of the fabric color, e.g., "White"
      color: string, // a hex color code, e.g., "#FFFFFF"
    },
    palette: { // an array of palette items
      brand: string, // e.g., "DMC"
      number: string, // e.g., "310"
      name: string, // e.g., "Black"
      color: string, // a hex color code, e.g., "#000000"
      symbol_font: string, // optional, e.g., "CrossStitch3"
      symbol: string, // the stitch symbol or an empty string if not specified
    }[],
    images: string[], // an array of virtual image paths, e.g., ["image1.png", "image2.png"]
  }
  ```
*/
#let pattern = sys.inputs

// Set the document metadata.
#set document(
  title: [#pattern.info.title],
  author: pattern.info.author,
  description: [#pattern.info.description]
)

// Set the document styles.
#set page(
  paper: "a4",

  // Example: `Page 1    _Pattern Title_                _Author_`.
  header: context [
    #set text(10pt)
    Page #counter(page).display("1") #h(1em)
    #emph[#pattern.info.title] #h(1fr) #emph[#pattern.info.author]
  ]
)
#set text(font: "Noto Serif", size: 14pt)

// Render the pattern information and palette.
// Example:
// ```
// Pattern name: My Pattern
// Designed by:  John Doe © 2025
// Fabric:       Aida White, 100X x 100X Stitches
// Description:
// This is a sample description of the pattern.
// ```
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

// Render the palette information.
// Example:
// ```
// Symbol   Brand   Number   Color Name
// ------------------------------------
//    X     DMC     310      Black
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

// Render the pattern images.
// Each image will be rendered on a new page.
#for image_path in pattern.images {
  pagebreak(weak: true)
  image(image_path)
}

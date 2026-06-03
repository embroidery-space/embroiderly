/*
  Typst template for exporting Embroiderly patterns into PDF documents.
  This template uses Typst's markup and scripting capabilities to compose and style the PDF document.
  See: https://typst.app.

  The pattern data is provided as a virtual `pattern.json` file and decoded using `json("pattern.json")`.
  All frame geometry lives in the dedicated `draw.typ` module.

  The pattern object has the following structure:
  ```
  {
    info: { title, author, copyright, description },

    fabric: { width, height, spi: [x, y], kind, name, color },
    grid: { majorLinesInterval, minorLines: { color, thickness, pixelLine }, majorLines: {...} },

    // Palette is already in the visual order.
    palette: { brand, number, name, color, blends, symbol: { char, font } | none }[],

    fullstitches: [...],
    partstitches: [...],
    linestitches: [...],
    nodestitches: [...],
    specialstitches: [...],
    specialStitchModels: [...],

    pdfExportOptions: {
      centerFrames: bool,
      enumerateFrames: bool,
      frameOptions: {
        frameSize: [w, h] | none,
        preservedOverlap: number | none,
        showGridLineNumbers: bool,
        showCenteringMarks: bool,
      },
    },
  }
  ```

  Whether stitches are filled with their palette color is a render-time choice, supplied separately via `sys.inputs.color` (a boolean value).
*/

#import "draw.typ": render-frames

#let pattern = json("pattern.json")
#let color = sys.inputs.at("color", default: true)

// Set the document metadata.
#set document(
  title: [#pattern.info.title],
  author: pattern.info.author,
  description: [#pattern.info.description],
)

// Set the document styles.
#set page(
  paper: "a4",

  // Example: `Page 1    _Pattern Title_                _Author_`.
  header: context [
    #set text(10pt)
    Page #counter(page).display("1") #h(1em)
    #emph[#pattern.info.title] #h(1fr) #emph[#pattern.info.author]
  ],
)
#set text(font: "Libertinus Serif", size: 14pt)

// Render the pattern information.
// Example:
// ```
// Pattern name: My Pattern
// Designed by:  John Doe © 2025
// Fabric:       Aida White, 100W x 100H Stitches
// Description:
// This is a sample description of the pattern.
// ```
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

// Render the pattern frames. Each frame fills its own page.
#let frames = render-frames(pattern, color)
#for (i, frame) in frames.enumerate(start: 1) {
  pagebreak(weak: true)
  figure(frame, numbering: none, caption: [Frame #i/#frames.len()])
}

/*
  Native Typst drawing module for embroidery pattern frames.

  This module owns *all* of the frame geometry: pagination/tiling, per-frame stitch filtering and coordinate rebasing, and the primitive drawing for every element type.

  Public API:
    #render-frames(data, color) -> array // one content block per frame, ready to lay out
    #frame-bounds(fabric, options) -> array // list of {x, y, width, height} frame tiles
    #draw-frame(data, bounds, color) -> (frame, w, h) // a single frame canvas along with its width and height

  `data` is the decoded `json("pattern.json")` object composed on the Rust side.
  `color` is a boolean selecting filled (true) vs. outlined (false) stitches, supplied at render time (via `sys.inputs`).
*/

#let cell = 1pt
#let px = cell / 14

// 1px black outline shared by full/part stitches and french knots/beads.
#let outline = px + rgb("000000")

// Grid line numbers: bold labels placed just outside the pattern area, with a small gap.
#let grid-label-gap = 0.3 * cell
#let grid-label(n) = text(weight: "bold", size: 0.8 * cell, str(n))

// Draws a palette symbol centered at (cx, cy), if the palette item has one.
#let draw-symbol(cx, cy, symbol, size) = {
  if symbol != none {
    place(
      center + horizon,
      dx: cx,
      dy: cy,
      text(font: symbol.font, size: size, str.from-unicode(symbol.char)),
    )
  }
}

#let centering-mark-points(position) = {
  if position == "top" {
    ((0.0, 0.0), (1.0, 0.0), (0.5, 1.0))
  } else if position == "bottom" {
    ((0.0, 1.0), (0.5, 0.0), (1.0, 1.0))
  } else if position == "left" {
    ((0.0, 0.0), (1.0, 0.5), (0.0, 1.0))
  } else {
    ((1.0, 0.0), (1.0, 1.0), (0.0, 0.5))
  }
}

#let draw-centering-mark(x, y, position) = {
  let points = centering-mark-points(position).map(((cx, cy)) => (cx * cell, cy * cell))
  place(top + left, dx: x, dy: y, polygon(fill: rgb("A9A9A9"), stroke: none, ..points))
}

#let draw-full-stitches(palette, stitches, color) = {
  for stitch in stitches {
    let palitem = palette.at(stitch.palindex)
    let size = if stitch.kind == "Petite" { cell / 2 } else { cell }
    let fill = if color { rgb(palitem.color) } else { none }
    place(
      top + left,
      dx: stitch.x * cell,
      dy: stitch.y * cell,
      rect(width: size, height: size, fill: fill, stroke: outline),
    )
    draw-symbol(stitch.x * cell + size / 2, stitch.y * cell + size / 2, palitem.symbol, size * 0.8)
  }
}

#let part-stitch-points(kind, direction) = {
  if kind == "Half" {
    if direction == "Forward" {
      ((1.0, 0.0), (1.0, 0.35), (0.35, 1.0), (0.0, 1.0), (0.0, 0.65), (0.65, 0.0))
    } else {
      ((0.0, 0.0), (0.35, 0.0), (1.0, 0.65), (1.0, 1.0), (0.65, 1.0), (0.0, 0.35))
    }
  } else {
    if direction == "Forward" {
      ((0.5, 0.0), (0.5, 0.25), (0.25, 0.5), (0.0, 0.5), (0.0, 0.25), (0.25, 0.0))
    } else {
      ((0.0, 0.0), (0.0, 0.25), (0.25, 0.5), (0.5, 0.5), (0.5, 0.25), (0.25, 0.0))
    }
  }
}

// The quadrant centers (in cell units) where a part stitch's symbols are drawn: one per
// quadrant the stitch covers — both diagonal quadrants for halves, a single one for quarters.
#let part-stitch-symbol-centers(kind, direction) = {
  if kind == "Half" {
    if direction == "Forward" {
      ((0.75, 0.25), (0.25, 0.75))
    } else {
      ((0.25, 0.25), (0.75, 0.75))
    }
  } else {
    ((0.25, 0.25),)
  }
}

#let draw-part-stitches(palette, stitches, color) = {
  for stitch in stitches {
    let palitem = palette.at(stitch.palindex)
    let fill = if color { rgb(palitem.color) } else { none }
    let points = part-stitch-points(stitch.kind, stitch.direction).map(((vx, vy)) => (vx * cell, vy * cell))
    place(top + left, dx: stitch.x * cell, dy: stitch.y * cell, polygon(fill: fill, stroke: outline, ..points))

    let ox = stitch.x * cell
    let oy = stitch.y * cell
    let fs = cell / 2 * 0.8
    for (cx, cy) in part-stitch-symbol-centers(stitch.kind, stitch.direction) {
      draw-symbol(ox + cx * cell, oy + cy * cell, palitem.symbol, fs)
    }
  }
}

#let draw-line-stitches(palette, stitches) = {
  for stitch in stitches {
    let palitem = palette.at(stitch.palindex)
    place(
      top + left,
      line(
        start: (stitch.x.at(0) * cell, stitch.y.at(0) * cell),
        end: (stitch.x.at(1) * cell, stitch.y.at(1) * cell),
        stroke: (paint: rgb(palitem.color), thickness: 0.2 * cell, cap: "round"),
      ),
    )
  }
}

#let draw-node-stitches(palette, stitches) = {
  for stitch in stitches {
    let palitem = palette.at(stitch.palindex)
    let radius = 0.25 * cell
    place(
      top + left,
      dx: stitch.x * cell - radius,
      dy: stitch.y * cell - radius,
      circle(radius: radius, fill: rgb(palitem.color), stroke: outline),
    )
  }
}

#let draw-curved-stitches(color, stitches) = {
  for stitch in stitches {
    let points = stitch.points.map(((vx, vy)) => (vx * cell, vy * cell))
    let (first, ..rest) = points
    place(
      top + left,
      curve(
        fill: none,
        stroke: (paint: color, thickness: 0.2 * cell, cap: "round"),
        curve.move(first),
        ..rest.map(p => curve.line(p)),
      ),
    )
  }
}

#let draw-special-stitches(palette, stitches, models, color) = {
  for stitch in stitches {
    let palitem = palette.at(stitch.palindex)
    let model = models.at(stitch.modindex)

    let sx = if stitch.flip.at(0) { -100% } else { 100% }
    let sy = if stitch.flip.at(1) { -100% } else { 100% }

    // The model geometry is drawn in local cell-space relative to the stitch origin, then flipped, rotated, and translated.
    let inner = box(
      width: 0pt,
      height: 0pt,
      {
        draw-node-stitches((palitem,), model.nodestitches)
        draw-line-stitches((palitem,), model.linestitches)
        draw-curved-stitches(rgb(palitem.color), model.curvedstitches)
      },
    )

    place(
      top + left,
      dx: stitch.x * cell,
      dy: stitch.y * cell,
      rotate(
        stitch.rotation * 1deg,
        origin: top + left,
        reflow: false,
        scale(x: sx, y: sy, origin: top + left, reflow: false, inner),
      ),
    )
  }
}

#let draw-grid(fabric, grid, bounds, overlap, show-numbers, show-marks) = {
  let pw = bounds.width * cell
  let ph = bounds.height * cell

  let interval = grid.majorLinesInterval

  let minor-thickness = (if grid.minorLines.pixelLine { 1 } else { grid.minorLines.thickness }) * px
  let minor-color = rgb(grid.minorLines.color)

  let major-thickness = (if grid.majorLines.pixelLine { 1 } else { grid.majorLines.thickness }) * px
  let major-color = rgb(grid.majorLines.color)

  // Horizontal minor lines.
  for i in range(0, bounds.height + 1) {
    let y = i * cell
    place(top + left, line(start: (0pt, y), end: (pw, y), stroke: (paint: minor-color, thickness: minor-thickness)))

    if show-marks and i + bounds.y == calc.floor(fabric.height / 2) {
      let ya = if calc.rem(i + bounds.y, 10) == 0 { y - cell / 2 } else { y }
      draw-centering-mark(-cell, ya, "left")
      draw-centering-mark(pw, ya, "right")
    }
  }

  // Vertical minor lines.
  for i in range(0, bounds.width + 1) {
    let x = i * cell
    place(top + left, line(start: (x, 0pt), end: (x, ph), stroke: (paint: minor-color, thickness: minor-thickness)))

    if show-marks and i + bounds.x == calc.floor(fabric.width / 2) {
      let xa = if calc.rem(i + bounds.x, 10) == 0 { x - cell / 2 } else { x }
      draw-centering-mark(xa, -cell, "top")
      draw-centering-mark(xa, ph, "bottom")
    }
  }

  // Horizontal major lines.
  let h-threshold = if bounds.y == 0 { 0 } else { bounds.y + overlap }
  for i in range(0, bounds.y + bounds.height + 1, step: interval) {
    if i >= h-threshold {
      let y = (i - bounds.y) * cell
      place(top + left, line(start: (0pt, y), end: (pw, y), stroke: (paint: major-color, thickness: major-thickness)))
      if show-numbers {
        // Anchor the number's right-center just left of the line, vertically centered on it.
        place(right + horizon, dx: -grid-label-gap, dy: y, grid-label(i))
      }
    }
  }

  // Vertical major lines.
  let v-threshold = if bounds.x == 0 { 0 } else { bounds.x + overlap }
  for i in range(0, bounds.x + bounds.width + 1, step: interval) {
    if i >= v-threshold {
      let x = (i - bounds.x) * cell
      place(top + left, line(start: (x, 0pt), end: (x, ph), stroke: (paint: major-color, thickness: major-thickness)))
      if show-numbers {
        // Anchor the number's bottom-center just above the line, horizontally centered on it.
        place(center + bottom, dx: x, dy: -grid-label-gap, grid-label(i))
      }
    }
  }
}

#let draw-overlapping-zones(bounds, overlap) = {
  if overlap != 0 {
    let dim = silver.transparentize(50%)
    if bounds.x > 0 {
      place(top + left, rect(width: overlap * cell, height: bounds.height * cell, fill: dim, stroke: none))
    }
    if bounds.y > 0 {
      place(top + left, rect(width: bounds.width * cell, height: overlap * cell, fill: dim, stroke: none))
    }
  }
}

// Computes the list of frame tiles, iterating from the top-left to the bottom-right corner.
#let frame-bounds(fabric, options) = {
  let overlap = options.preservedOverlap

  let pw = fabric.width
  let ph = fabric.height

  let fw = options.frameSize.at(0)
  let fh = options.frameSize.at(1)

  let bounds = ()
  let cx = 0
  let cy = 0
  while cy < ph {
    let bw = calc.min(fw, pw - cx)
    let bh = calc.min(fh, ph - cy)
    bounds.push((x: cx, y: cy, width: bw, height: bh))

    cx = cx + fw - overlap
    if cx >= pw {
      cx = 0
      cy = cy + fh - overlap
    }
  }

  bounds
}

// Draws a single frame: the pattern area surrounded by a margin sized to fit the grid numbers.
#let draw-frame(data, bounds, color) = {
  let options = data.pdfExportOptions

  let bx = bounds.x
  let by = bounds.y
  let inside(x, y) = (x >= bx and x < bx + bounds.width and y >= by and y < by + bounds.height)

  // Filter the whole-pattern stitches down to this frame and rebase them to frame-local coordinates.
  let full-stitches = data
    .fullstitches
    .filter(s => inside(s.x, s.y))
    .map(s => {
      s.x = s.x - bx
      s.y = s.y - by
      s
    })
  let part-stitches = data
    .partstitches
    .filter(s => inside(s.x, s.y))
    .map(s => {
      s.x = s.x - bx
      s.y = s.y - by
      s
    })
  let special-stitches = data
    .specialstitches
    .filter(s => inside(s.x, s.y))
    .map(s => {
      s.x = s.x - bx
      s.y = s.y - by
      s
    })
  let line-stitches = data
    .linestitches
    .filter(s => inside(s.x.at(0), s.y.at(0)) or inside(s.x.at(1), s.y.at(1)))
    .map(s => {
      s.x = (s.x.at(0) - bx, s.x.at(1) - bx)
      s.y = (s.y.at(0) - by, s.y.at(1) - by)
      s
    })
  let node-stitches = data
    .nodestitches
    .filter(s => inside(s.x, s.y))
    .map(s => {
      s.x = s.x - bx
      s.y = s.y - by
      s
    })

  // Everything is drawn in pattern-local coordinates whose origin is the top-left corner of the pattern area.
  // Grid numbers and centering marks sit at negative coordinates around it.
  let content = box(width: 0pt, height: 0pt, {
    draw-full-stitches(data.palette, full-stitches, color)
    draw-part-stitches(data.palette, part-stitches, color)
    draw-grid(
      data.fabric,
      data.grid,
      bounds,
      options.preservedOverlap,
      options.showGridLineNumbers,
      options.showCenteringMarks,
    )
    draw-special-stitches(data.palette, special-stitches, data.specialStitchModels, color)
    draw-line-stitches(data.palette, line-stitches)
    draw-node-stitches(data.palette, node-stitches)
    draw-overlapping-zones(bounds, options.preservedOverlap)
  })

  // Reserve a margin around the pattern.
  // One cell is enough for the centering marks, but the grid numbers need as much room as their widest label.
  let margin = (x: cell, y: cell)
  if options.showGridLineNumbers {
    let max-label = calc.max(bounds.x + bounds.width, bounds.y + bounds.height)
    let size = measure(grid-label(max-label))
    margin = (
      x: calc.max(cell, size.width + grid-label-gap),
      y: calc.max(cell, size.height + grid-label-gap),
    )
  }

  let w = bounds.width * cell + 2 * margin.x
  let h = bounds.height * cell + 2 * margin.y
  let frame = box(
    width: w,
    height: h,
    clip: true,
    place(top + left, dx: margin.x, dy: margin.y, content),
  )

  (frame, w, h)
}

// Paginates the pattern and returns one fit-to-page content block per frame.
#let render-frames(data, color) = {
  frame-bounds(data.fabric, data.pdfExportOptions).map(bounds => {
    layout(size => {
      let (frame, w, h) = draw-frame(data, bounds, color)
      let s = calc.min(size.width / w, size.height / h)
      scale(s * 100%, reflow: true, frame)
    })
  })
}

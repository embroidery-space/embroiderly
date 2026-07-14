# Pattern Model

The internal representation of a cross-stitch pattern --- every struct and enum needed to describe and manipulate a pattern, independent of how it is parsed, edited, rendered, or exported.

## Language

### Project & Pattern

**Project**:
The top-level document a user opens, edits, and saves --- one pattern together with its display settings, publish settings, an optional reference image, and a stable identifier.
_Avoid_: file, document.

**Pattern**:
The design content of a project --- its info, fabric, palette, layers, and special stitch models.
The artwork itself, independent of editor and export settings.
_Avoid_: chart, design, project.

**Pattern Info**:
The authorship metadata of a pattern --- title, author, copyright, and description.
_Avoid_: metadata, properties.

### Fabric

**Fabric**:
The cloth a pattern is stitched on, described by its dimensions in stitches, its stitch count per inch, kind, name, and color.
_Avoid_: canvas, cloth, aida.

**Fabric Color**:
A named color from the catalog of available fabric colors.
_Avoid_: fabric, color.

### Palette

**Palette** (working palette):
The set of colors actually used in a pattern, each carrying project-specific display properties such as its symbol.
Unqualified, "palette" means this one.
_Avoid_: colors, threads, brand palette.

**Palette Item** (working palette item):
A single color in the working palette --- a thread identified by brand and number, plus name, color, optional blends, and an optional symbol.
_Avoid_: color, thread, swatch, brand palette item.

**Brand Palette**:
A catalog of colors from one thread manufacturer (DMC, Anchor, Madeira, etc.) or a designer's custom collection, used as a source to add colors into the working palette.
_Avoid_: palette, working palette.

**Brand Palette Item**:
A single entry in a brand palette --- brand, number, name, color, and optional blends, without any project-specific display properties.
_Avoid_: color, thread, swatch, palette item.

**Blend**:
One thread component of a blended color, identified by its brand and number.
A palette item that combines several components is a blend.

**Symbol**:
The character, and the font it is drawn in, that represents a palette item when the pattern is shown in symbol form.
_Avoid_: glyph, icon.

**Bead**:
The physical dimensions --- length and diameter --- of a bead used in a pattern.

### Layers

**Custom Layer**:
A user-created, independently orderable and toggleable canvas that holds its own stitches.
Unqualified, "layer" means this one.
_Avoid_: group, sublayer.

**Stitch Layer**:
A fixed sublayer inside every custom layer that holds a single stitch kind (full stitches, half stitches, back stitches, etc.); its visibility can be toggled but it can never be created, removed, or reordered.
_Avoid_: layer, sublayer.

### Stitches

**Stitch**:
Any single mark placed on the pattern; every stitch references a palette item, sits at a position, and is one of the individual stitches below.

**Full Stitch**:
A complete cross filling one whole cell.
_Avoid_: cross, full cross.

**Petite Stitch**:
A full stitch shrunk to a single quadrant of a cell.
_Avoid_: petit point.

**Half Stitch**:
A single diagonal filling half a cell, running forward (`/`) or backward (`\`).
_Avoid_: half cross.

**Quarter Stitch**:
A half stitch shrunk to one triangular quadrant of a cell.

**Back Stitch**:
A straight line laid edge-to-edge, typically to outline.
_Avoid_: outline.

**Straight Stitch**:
A straight line drawn freely between any two points.

**French Knot**:
A raised knot tied at a single point.
_Avoid_: knot.

**Bead**:
A bead fastened to the fabric at a single point.

**Special Stitch**:
A placed instance of a special stitch model, positioned with its own rotation and flip.
_Avoid_: motif, ornament.

**Special Stitch Model**:
The reusable template a special stitch instances --- a named shape defined by its own nodes, lines, and curves within a bounding box.
_Avoid_: template, motif, shape.

**Curved Stitch**:
A smooth curve, defined by a sequence of points, that forms part of a special stitch model.
_Avoid_: curve, spline.

**Bounds**:
A rectangular region of a pattern, given as an origin plus width and height in stitches.
_Avoid_: rect, area, selection.

### Ordering

**Index** (actual index):
The stable storage position of a palette item or layer.
Stitches reference palette items by index, so the reference survives any visual reordering.
_Avoid_: position, order.

**Position** (visual position):
The display order of palette items or layers in the UI, freely rearrangeable without changing indexes.
_Avoid_: index, order.

**Palette Index**:
The index of the palette item a stitch is stitched in.
_Avoid_: color id, palette id.

### Rendering & Export

**Display Settings**:
How a pattern is presented in the editor --- its grid, display mode, and whether symbols, grid, and rulers are shown.
_Avoid_: view settings, preferences.

**Display Mode**:
Whether stitches are drawn as solid color blocks (Solid), as rendered stitch shapes (Stitches), or a combination (Mixed).
_Avoid_: view mode, render mode.

**Grid**:
The overlay of minor and major lines drawn over the pattern, with a configurable interval between major lines.
_Avoid_: guides.

**Publish Settings**:
The configuration for exporting a pattern to a distributable form --- currently the PDF frame size, frame overlap, and which marks and numbers to show.
_Avoid_: export settings.

**Reference Image**:
An image placed beneath the pattern as a tracing aid, with its own position, size, rotation, and opacity.
_Avoid_: background, underlay, source image.

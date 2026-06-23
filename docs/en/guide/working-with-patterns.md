---
description: Master pattern editing in Embroiderly - learn about stitch tools, canvas navigation, layers, drawing techniques, and display controls for creating cross-stitch patterns.
---

# Working with Patterns

This chapter covers everything you need to know about editing patterns in Embroiderly.
You'll learn how to use stitch tools, navigate the canvas, work with layers, and customize your workspace for efficient pattern design.

## Pattern Workspace

The pattern workspace at the center is where you design your patterns.

## Stitch Tools

Embroiderly supports eight types of stitches, organized into groups.
Each group contains related stitch variants that you can quickly switch between.

<figure>
  <img src="/images/common/toolbar/toolbar-full.png">
  <figcaption>Stitch tools in the toolbar.</figcaption>
</figure>

> There are also other tools available, but they're covered in other chapters.

### Tool Selection

There are three ways to select a stitch tool:

1. **Quick Selection**.
   Click any tool button to activate it.
   The button will be highlighted to indicate that it's active.
2. **Keyboard Shortcuts**.
   Each tool has a key sequence binded for quick selection.
   Check all available shortcuts in the [shortcuts reference](../reference/shortcuts).
3. **Dropdown Menu**.
   Groups with multiple tool variants show a small button with a chevron icon in the bottom right corner.
   You can access the dropdown menu by:
   - clicking the chevron button,
   - right-clicking the tool button, or
   - long-pressing the tool button (hold for half a second).

The last selected variant in each group is remembered.
When you click the tool button again, it activates your most recent choice from that group.

### Tool Color Highlighting

By default, the active stitch tool button is highlighted with the currently selected thread color from the working palette.
This provides a visual reminder of which color you're drawing with.

You can disable this feature in the application settings if you prefer the standard tool highlighting.

<figure>
  <img src="/images/en/guide/working-with-patterns/tool-color-setting.png">
  <figcaption>The setting for the tool color highlighting in the <strong>Other</strong> tab.</figcaption>
</figure>

### Full Stitch

The full stitch creates a complete X-shaped cross stitch that fills an entire grid cell.

### Petite Stitch

The petite stitch is one-quarter the size of a full stitch.
Four petite stitches fit in a single grid cell, one in each corner.

Embroiderly provides two ways to place petite stitches:

1. **Dynamic Placement**.
   The stitch position is determined by where the cursor is within the grid cell.
   Move toward any corner to place the petite stitch there.
2. **Fixed Position**.
   Select a specific corner variant (Top-Left, Top-Right, Bottom-Right, Bottom-Left) to always place stitches in that position regardless of the cursor location.

### Half Stitch

The half stitch is one diagonal line of a full stitch---either forward (`/`) or backward (`\`).

1. **Dynamic Direction**.
   The direction is determined by the cursor position within the cell.
2. **Fixed Direction**.
   Select either forward or backward variants to always draw in that direction.

### Quarter Stitch

The quarter stitch is half of a half stitch.
It goes from a corner to the center of a grid cell.

Like petite stitches, quarter stitches can be placed dynamically or in fixed positions.

### Line Stitches

Line stitches are linear elements for outlines and details.
This is Embroiderly's common term for back and straight stitches.

#### Back Stitch

The back stitch creates small line segments used for outlines and details.
Each segment connects two adjacent grid points (corners of cells).

Back stitches are exactly one cell or one diagonal length.
They always snap to the corners of grid cells.

When drawing multiple back stitches in a sequence, the next stitch automatically starts where the previous one ended, making it easy to create continuous outlines.

#### Straight Stitch

The straight stitch creates longer decorative lines that can span multiple cells.
Unlike back stitches, straight stitches can pass through the centers of cells and sides.

Straight stitches use a click-and-drag approach:

1. Click where you want the line to start.
2. Drag to where you want it to end (you'll see a preview).
3. Release to place the stitch.

### Node Stitches

Node stitches are small decorative elements on the fabric.
This is Embroiderly's common term for French knots and beads.

#### French Knot

French knots create small decorative knots on the fabric.

French knots use the same click-and-drag approach as straight stitches.

#### Bead

Beads are small decorative elements similar to French knots.

Beads work the same way as French knots.

Hold `Ctrl` while drawing to rotate the bead 90 degrees.

### Eraser

The **Eraser** tool removes any stitch from the canvas regardless of type.
Select it from the toolbar and click or drag over any stitch to remove it.

The eraser is especially useful on mobile devices and touchscreens where keyboard shortcuts aren't available.

> [!TIP]
> You don't need to switch to the eraser to remove a stitch while working.
> You can remove any stitch with the currently selected stitch tool, too.
> See the [Removing Stitches](#removing-stitches) section below for more details.

## Drawing and Editing

### Basic Drawing

To draw a stitch:

1. Select a color from the palette panel.
2. Choose a stitch tool.
3. Click on the canvas where you want to place the stitch.

For most stitches, each click places one stitch.
You can hold down the left mouse button and drag to draw multiple stitches quickly.

### Removing Stitches

There are three ways to remove stitches:

1. **Eraser Tool**.
   Select the **Eraser** from the toolbar and click or drag over any stitch to remove it.
2. **Alt + Left-Click**.
   Hold `Alt` and left-click to erase stitches as you draw.
   This works with any stitch tool selected.
3. **Ctrl + Right-Click**.
   Hold `Ctrl` and right-click to erase stitches.

### Position Locking

For dynamic stitch variants (petite, half, and quarter stitches), you can lock the position or direction to match your previous stitch.

While drawing with a dynamic stitch tool, hold `Ctrl` to make each new stitch use the same position/direction as the last one you drew.

This is useful when you want to maintain consistency across multiple stitches without switching to a fixed-position tool variant.

## Navigating the Canvas

Embroiderly uses modern canvas navigation that keeps stitch tools active at all times.
You can pan and zoom while working without interrupting your creative flow.

### Panning

To move around the canvas, hold the right mouse button and drag the canvas in any direction.
This works regardless of which stitch tool is selected.

Your drawing tool remains active, so you can immediately resume working when you release the right mouse button.

### Zooming

Scroll the mouse wheel to:

- zoom in to work on fine details, or
- zoom out to see your entire pattern.

The zoom centers on the cursor position, keeping the area under your mouse in view.

By default, the mouse wheel performs zooming.
Hold `Alt` while scrolling to switch to panning mode temporarily.

If you've [set mouse wheel to scroll](#mouse-wheel-action) in the application settings, the behavior reverses.

> On touchpads, two-finger scrolling works the same way as the mouse wheel.

The canvas has minimum and maximum zoom levels to prevent extreme views.
You can't zoom so far that the pattern becomes unusable.

### Zoom Controls

The zoom controls in the footer provide precise zoom management.

<figure>
  <img src="/images/en/guide/working-with-patterns/zoom-controls.png">
  <figcaption>Canvas zoom controls showing fit options and current zoom level.</figcaption>
</figure>

Preset fit options:

- **Fit.** Scales the pattern to fit entirely within the visible canvas area.
- **Fit Width.** Scales the pattern to match the canvas width.
- **Fit Height.** Scales the pattern to match the canvas height.

Use the slider or the +/- buttons to adjust zoom incrementally.
The number shows your current zoom level (you can edit it).

## Canvas Panel

The canvas panel sits on the right side of the pattern workspace.
It gives you quick access to display mode toggles, element visibility controls, and the layers menu.

<figure>
  <img src="/images/en/guide/working-with-patterns/canvas-panel.png">
  <figcaption>The canvas panel showing display modes, element toggles, and the layers menu.</figcaption>
</figure>

### Stitches Display Modes

Three stitches display modes change how stitches are rendered on the canvas.

1. **Mixed**. Shows a combination of rendering styles.
   Full and petite stitches are displayed as solid color blocks, while half and quarter stitches are rendered realistically.
   This mode provides a balance between visual clarity and realistic preview.
2. **Solid**. Displays all stitches as solid color blocks.
   This mode makes it easier to see the overall color distribution and pattern structure.
   Note that you can't distinguish between petite, half, and quarter stitches in this mode since they all appear as solid blocks.
3. **Stitches**. Renders stitches with their structural details visible.
   This mode is useful for understanding exactly how each stitch is constructed.

> Line and node stitches aren't affected by the stitches display modes.
> They always render with their characteristic appearance.

<figure>
  <img src="/images/common/canvas/display-modes.png">
  <figcaption>Different stitches display modes.</figcaption>
</figure>

### Element Visibility

Below the display mode toggles, there are three buttons which let you show or hide individual canvas elements:

- **Symbols.** Toggles stitch symbols on the canvas.
- **Grid.** Toggles the grid overlay.
- **Rulers.** Toggles the rulers along the canvas edges.

### Symbols Display

When **Symbols** is enabled, each stitch displays its assigned symbol from the palette.
This helps you identify which thread color to use when stitching the physical pattern.

Symbols appear at the center of each stitch.
You can use symbols with any stitches display mode.

> [!TIP]
> When symbols are displayed, you can click the active stitches display mode button again to make stitches transparent.
> This shows only the symbols without the stitch colors underneath.

### Layers

The **Layers** section at the bottom of the canvas panel lets you organize your pattern into multiple custom layers---just like in any modern graphics application.

The [**Layer Layout** setting](#layer-layout) in **Settings -> Working Area** then controls whether the layer or the stitch type takes priority overall.
Within the same stitch type, a higher layer always appears in front of a lower one.

#### Custom Layers and Stitch Layers

A **custom layer** is a layer you create yourself.
Each custom layer automatically contains a fixed set of **stitch layers**---one for each stitch type.

You draw on the currently selected custom layer.
Selecting a different custom layer before drawing lets you keep different parts of your work isolated from each other.

#### Managing Layers

- **Add a layer.** Click the plus button in the **Layers** header.
  New layers appear at the top of the list and become the active drawing target.
- **Remove a layer.** Select the layer and click the trash button.
  Note that you can't remove the last remaining layer.
- **Rename a layer.** Double-click the layer name to edit it in place.
  Press `Enter` or click outside the field to confirm.
- **Reorder layers.** Drag a custom layer up or down to change its position.
  Layers higher in the list appear on top in the canvas.
- **Toggle visibility.** Click the eye icon on the right of any custom layer or stitch layer to show or hide it.
  Hiding a custom layer hides all its stitch layers at once.
  Hiding an individual stitch layer hides only that stitch type within its parent custom layer.

> [!IMPORTANT]
> When exporting to OXS or PDF, only stitches from visible stitch layers inside visible custom layers are included in the output.
> Hidden layers and overlapped stitches are excluded entirely.

## Working Area Settings

You can customize how the pattern renders and responds to input through the working area settings.
Access these settings from **Settings -> Working Area**.

<figure>
  <img src="/images/en/guide/working-with-patterns/workarea-settings.png">
  <figcaption>Working area settings for antialiasing, mouse wheel action, and layer layout.</figcaption>
</figure>

### Antialiasing

[Antialiasing](https://en.wikipedia.org/wiki/Anti-aliasing_filter) is a graphics technique that smooths jagged edges on stitches and pattern elements.

When diagonal or curved lines are displayed on a screen, they can appear jagged or "stair-stepped"---this is called [aliasing](https://en.wikipedia.org/wiki/Aliasing).
Antialiasing reduces these jagged edges by blending the colors of pixels along object edges, creating smoother and more realistic-looking graphics.

When to Use Antialiasing:

- **Enabled (default)**. Provides smoother, more polished visuals that are easier on the eyes during extended design sessions.
- **Disabled**. May improve performance on older computers or when working with very large patterns.

> [!TIP]
> Antialiasing requires additional processing power.
> If you experience slow performance, try disabling it to see if your canvas rendering improves.

### Mouse Wheel Action

This setting determines what happens when you scroll the mouse wheel over the canvas.

- **Zoom (default)**. The mouse wheel zooms in and out, centered on the cursor position.
  Hold `Alt` while scrolling to temporarily switch to the scrolling mode.
- **Scroll**. The mouse wheel scrolls the canvas horizontally and vertically.
  Hold `Alt` while scrolling to temporarily switch to the zooming mode.

Choose the option that matches your preferred workflow.

> Two-finger scrolling on touchpads also follows this setting---it zooms when set to **Zoom** and scrolls when set to **Scroll**.
> The `Alt` key modifier works the same way on touchpads as with the mouse wheel.

### Layer Layout

This setting controls how multiple custom layers are composited when their stitches overlap.

- **By Layer Order (default).** Each custom layer is rendered as a complete unit.
  All of a higher layer's stitches appear in front of all of a lower layer's stitches.
  This is the most intuitive mode---layers behave exactly as you'd expect from a graphics application.

- **By Stitch Type.** Stitch types are the primary grouping, not layers.
  All French knots from every layer render together, then all beads from every layer, and so on.
  This means a lower layer's French knots appear in front of a higher layer's back stitches, because the French knot group renders after the back stitch group.

<figure>
  <img src="/images/common/canvas/layer-layout.png">
  <figcaption>The difference between By Layer Order and By Stitch Type options.</figcaption>
</figure>

The grid always sits between cross stitches (full, petite, half, and quarter) and line and node stitches (back stitches, straight stitches, French knots, and beads), regardless of any other setting.
Line and node stitches always appear in front of the grid, and the grid always appears in front of cross stitches.

---
description: Master pattern editing in Embroiderly - learn about stitch tools, canvas navigation, drawing techniques, and display controls for creating cross-stitch patterns.
---

# Working with Patterns

This chapter covers everything you need to know about editing patterns in Embroiderly.
You'll learn how to use stitch tools, navigate the canvas, and customize your workspace for efficient pattern design.

## Pattern Workspace

The pattern workspace at the center is where you design your patterns.

## Stitch Tools

Embroiderly supports eight types of stitches, organized into groups.
Each group contains related stitch variants that you can quickly switch between.

<figure>
  <img src="/images/guide/working-with-patterns/palette-toolbar.png">
  <figcaption>Stitch tools in the palette toolbar.</figcaption>
</figure>

> There are also other tools available, but they're covered in other chapters.

### Tool Selection

There are three ways to select a stitch tool:

1. **Quick Selection**.
   Click any tool button to activate it.
   The button will be highlighted to indicated that it's active.
2. **Keyboard Shortcuts**.
   Each tool has a key sequence binded for quick selection.
   For example, press `F` for full stitch or `H-F` for forward half stitch.
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
  <img src="/images/guide/working-with-patterns/tool-color-setting.png">
  <figcaption>The setting to enable or disable tool color highlighting in the Other tab.</figcaption>
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
   The direction is determined by your cursor position within the cell.
2. **Fixed Direction**.
   Select either forward or backward variants to always draw in that direction.

### Quarter Stitch

The quarter stitch is half of a half stitch.
It goes from a corner to the center of a grid cell.

Like petite stitches, quarter stitches can be placed dynamically or in fixed positions.

1. **Dynamic Placement**.
2. **Fixed Position**.

### Back Stitch

The back stitch creates small line segments used for outlines and details.
Each segment connects two adjacent grid points (corners of cells).

Back stitches are exactly one cell or one diagonal length.
They snap to the corners of grid cells.

When drawing multiple back stitches in a sequence, the next stitch automatically starts where the previous one ended, making it easy to create continuous outlines.

### Straight Stitch

The straight stitch creates longer decorative lines that can span multiple cells.
Unlike back stitches, straight stitches can pass through cell centers and sides.

Straight stitches use a click-and-drag approach:

1. Click where you want the line to start.
2. Drag to where you want it to end (you'll see a preview).
3. Release to place the stitch.

### French Knot

French knots create small decorative knots on the fabric.

French knots use the same click-and-drag approach as straight stitches.
You'll see a preview as you move the cursor, then release to place the knot.

### Bead

Beads are small decorative elements similar to French knots.

Beads work the same way as French knots---you'll see a preview as you drag, then release to place the bead.

Hold `Ctrl` while drawing to rotate the bead 90 degrees.

## Drawing and Editing

### Basic Drawing

To draw a stitch:

1. Select a color from the palette panel.
2. Choose a stitch tool.
3. Click on the canvas where you want to place the stitch.

For most stitches, each click places one stitch.
You can hold down the left mouse button and drag to draw multiple stitches quickly.

### Removing Stitches

There are two ways to remove stitches:

1. **Alt + Left-Click**.
   Hold `Alt` and left-click to erase stitches as you draw.
   This works with any stitch tool selected.
1. **Ctrl + Right-Click**.
   Hold `Ctrl` and right-click to erase stitches.

The eraser removes stitches under your cursor in all stitch types.

### Position Locking

For dynamic stitch variants (petite, half, and quarter stitches), you can lock the position or direction to match your previous stitch.

While drawing with a dynamic tool, hold `Ctrl` to make each new stitch use the same position/direction as the last one you drew.

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

The zoom centers on your cursor position, keeping the area under your mouse in view.

By default, the mouse wheel performs zooming.
Hold `Alt` while scrolling to switch to panning mode temporarily.

If you've [set mouse wheel to scroll](#mouse-wheel-action) in the application settings, the behavior reverses---scroll normally to pan, `Alt` + scroll to zoom.

> On touchpads, two-finger scrolling works the same way as the mouse wheel.

The canvas has minimum and maximum zoom levels to prevent extreme views.
You can't zoom so far that the pattern becomes unusable.

### Zoom Controls

The zoom controls in the footer provide precise zoom management.

<figure>
  <img src="/images/guide/working-with-patterns/zoom-controls.png">
  <figcaption>Canvas zoom controls showing fit options and current zoom level.</figcaption>
</figure>

Preset fit options:

- **Fit.** Scales the pattern to fit entirely within the visible canvas area.
- **Fit Width.** Scales the pattern to match the canvas width.
- **Fit Height.** Scales the pattern to match the canvas height.

Use the slider or the +/- buttons to adjust zoom incrementally.
The number shows your current zoom level (you can edit it).

## Pattern Display Controls

The display controls toolbar on the right side of the pattern workspace lets you customize how your pattern appears.

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

> Line stitches (back and straight) and node stitches (French knots and beads) aren't affected by the stitches display modes.
> They always render with their characteristic appearance.

<figure>
  <img src="/images/guide/working-with-patterns/display-modes.png">
  <figcaption>Different stitches display modes.</figcaption>
</figure>

### Layer Visibility

Control which pattern elements appear on the canvas using the **Layers** panel.

<figure>
  <img src="/images/guide/working-with-patterns/layer-visibility.png">
  <figcaption>The layers panel containing checkboxes for stitch types and canvas elements.</figcaption>
</figure>

Uncheck any layer to hide those elements.
This is useful when you want to focus on specific stitch types or reduce visual clutter.

### Symbols Display

The symbol toggle button shows or hides stitch symbols on the canvas.

When enabled, each stitch displays its assigned symbol from the palette.
This helps you identify which thread color to use when stitching the physical pattern.

Symbols appear at the center of each stitch.
You can use symbols with any stitches display mode.

> [!TIP]
> When symbols are displayed, you can click the active stitches display mode button again to make stitches transparent.
> This shows only the symbols without the stitch colors underneath.

## Viewport Settings

You can customize how the pattern renders and responds to input through the viewport settings.
Access these settings from **Settings** -> **Viewport**.

<figure>
  <img src="/images/guide/working-with-patterns/viewport-settings.png">
  <figcaption>Viewport settings for antialiasing and mouse wheel action.</figcaption>
</figure>

### Antialiasing

Antialiasing is a graphics technique that smooths jagged edges on stitches and pattern elements.

When diagonal lines and curves are displayed on a screen, they can appear jagged or "stair-stepped"---this is called aliasing.
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

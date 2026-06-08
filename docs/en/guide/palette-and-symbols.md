---
description: Learn how to manage thread colors and stitch symbols in your cross-stitch patterns in Embroiderly.
---

# Palette & Symbols

The palette panel is the place where you manage colors and stitch symbols in your cross-stitch patterns.
You can select threads from manufacturer color catalogs, organize your working palette, and assign symbols to help differentiate between similar colors.

## Palette Terminology

The **Working Palette** is a collection of thread colors you're actively using in your current pattern.
Only colors in your working palette can be used to draw stitches.

The **Palette Catalog** is a library of all available thread colors from manufacturers like DMC, Anchor, or Madeira.
It contains hundreds or thousands of colors that you can browse and add to your working palette as needed.

**Palette Items** are individual entries in your working palette.
Each item represents a specific thread color, additionally including its brand, number, name, and stitch symbol.

**Colors vs. Threads**: In cross-stitch design software, these terms are often used interchangeably (we'll do so as well).
However, "thread" more accurately reflects the physical item, while "color" refers to the visual appearance.

## Palette Panel Overview

The palette panel appears on the left side of the pattern editor.
It's organized into two sections: the header and the palette list.

<figure>
  <img src="/images/guide/palette-and-symbols/palette-panel-overview.png">
  <figcaption>The palette panel showing the working palette with several thread colors.</figcaption>
</figure>

The **header** shows the total number of colors in your palette and provides a quick button to enter the editing mode.

The **palette list** displays all thread colors currently in your working palette.
Each color is shown as a tile with the thread's color, stitch symbol, and text information based on your palette display settings.

## Palette List

Each item in the palette list displays:

- a colored background showing the thread's color,
- a stitch symbol,
- a label containing the thread's brand, number, and name, and
- an outline if the color is selected.

The exact information displayed depends on your current palette display settings.

<figure>
  <img src="/images/guide/palette-and-symbols/palette-item-details.png">
  <figcaption>Palette items showing all available information.</figcaption>
</figure>

Hovering over any palette item shows a tooltip with the complete thread information, regardless of your palette display settings.

## Palette Display Settings

You can customize how palette items appear using the palette display settings.

The quickest way is to right-click the palette list and select **Display Settings**.
The context menu stays open while you adjust settings, letting you see changes in real-time.

<figure>
  <img src="/images/guide/palette-and-symbols/display-settings-menu.png">
  <figcaption>The context menu showing palette display settings.</figcaption>
</figure>

Alternatively, you can enter the [editing mode](#entering-the-editing-mode), then click the menu button in the header and select **Display Settings** to open a dedicated panel.

<figure>
  <img src="/images/guide/palette-and-symbols/display-settings-panel.png">
  <figcaption>The <strong>Display Settings</strong> panel with all customization options.</figcaption>
</figure>

Both the context menu and panel methods work equally well---choose whichever you find more comfortable.

The available palette display settings include:

- **Number of columns**. Sets how many columns the palette list uses (1-8 columns).
- **Color only**. Hides all text information and symbols, showing just the color tiles.
- **Show stitch symbols**. Toggles the visibility of symbols assigned to palette items.
- **Contrasting stitch symbols**. Places symbols on a white background for better visibility against thread colors.
- **Show thread brand**, **Show color number**, and **Show color name**. Control which text information appears for each palette item.

All changes apply immediately so you can see the results as you adjust settings.

> [!TIP]
> You can enable any combination of these options.
> For example, showing just the color numbers is useful when you're familiar with a specific brand's color system.

Palette display settings are saved with your pattern, so each project can have its own preferred layout.

## Selecting Colors

To use a color for drawing, click on any item in the palette list.
The selected color is indicated with a contrasting outline.

Only one color can be selected at a time.
When you select a different color, the previous one is automatically deselected.

### Keyboard Navigation

You can also navigate and select colors using the keyboard:

- **Arrow Down**. Moves to the next color.
- **Arrow Up**. Moves to the previous color.
- **Home**. Jumps to the first color in the palette.
- **End**. Jumps to the last color in the palette.
- **Enter**. Selects the currently highlighted color.

> [!WARNING]
> In multi-column layouts, arrow keys navigate horizontally (left/right through columns) rather than vertically (up/down through rows).
> There's currently no way to navigate in all four directions naturally due to technical constraints.

## Editing Mode

The editing mode is a special state in which you can modify your working palette.
While in the editing mode, you can't draw on the canvas, but you can add or remove colors, sort your palette, assign symbols, and more.

### Entering the Editing Mode

There are two ways to enter the editing mode:

1. Click the edit icon (pencil) in the palette footer.
2. Right-click the palette list and select **Edit Palette**.

<figure>
  <img src="/images/guide/palette-and-symbols/editing-mode.png">
  <figcaption>The palette panel in the editing mode.</figcaption>
</figure>

When you enter the editing mode, the palette panel's appearance changes:

- the palette panel gets a cyan border to indicate the editing mode is active,
- the header shows a save button and a menu button,
- the footer's edit icon changes to a checkmark, and
- the canvas drawing area is blocked with an overlay.

### Exiting the Editing Mode

When you're done editing your palette,you can exit the editing mode by:

- clicking the Save Palette button in the palette header,
- clicking the save icon (checkmark) in the palette footer,
- right-clicking and selecting **Save Palette**, or
- pressing `Escape`.

All changes you made are automatically saved to your pattern.

> [!NOTE]
> Don't worry about "saving" in the editing mode---this is just for clarity.
> All palette changes are applied immediately and included in the pattern's undo history.

## Regular vs. Editing Mode Context Menus

The palette panel's context menu changes based on which mode you're in.

### Regular Mode Context Menu

In the regular mode, the context menu provides access to entering the editing mode and palette display settings:

<figure>
  <img src="/images/guide/palette-and-symbols/ctxmenu-regular.png">
  <figcaption>The context menu in the regular mode.</figcaption>
</figure>

This menu is designed for quick adjustments to how you view your working palette without entering the editing mode.

### Editing Mode Context Menu

In the editing mode, the context menu expands to include palette management options:

<figure>
  <img src="/images/guide/palette-and-symbols/ctxmenu-editing.png">
  <figcaption>The context menu in the editing mode.</figcaption>
</figure>

This menu provides quick access to all palette editing features without using the menu button in the palette panel header.

## Managing Palette Items

### Adding Colors from the Catalog

To add new colors to your working palette, you can use the **Palette Catalog**.

1. Enter the editing mode.
2. Click the menu button in the header and select **Colors**, or right-click and select it from the context menu.

<figure>
  <img src="/images/guide/palette-and-symbols/palette-catalog.png">
  <figcaption>The <strong>Palette Catalog</strong> showing available DMC thread colors.</figcaption>
</figure>

The **Colors** panel shows all colors available from the currently selected palette file.
By default, this is the DMC color catalog (the most popular embroidery thread brand).

Colors already in your working palette are shown with an outline.

To add a color to your working palette, simply **double-click** it in the catalog.
The color is immediately added to the bottom of your working palette.

To remove a color that's already in your working palette, **double-click** it again in the catalog.
The color is removed from your working palette.

> [!WARNING]
> Removing a color from the working palette also removes all stitches in that color from the pattern.

#### Searching for Colors

If you know the thread number or name you're looking for, use the search input at the top of the catalog.
Type a thread number (like "310") or color name (like "black") to filter the color list.

<figure>
  <img src="/images/guide/palette-and-symbols/palette-catalog-search.png">
  <figcaption>Searching for DMC 310 in the <strong>Palette Catalog</strong>.</figcaption>
</figure>

The search matches anywhere in the thread number or name, ignoring accents and diacritics.

### Removing Colors

Besides removing colors through the **Palette Catalog**, you can also remove them directly from your working palette while in the editing mode.

**To remove the selected color:**

1. Select the color you want to remove.
2. Right-click the palette list.
3. Choose **Delete Selected** from the context menu.

**To remove all colors at once:**

1. Right-click the palette list.
2. Choose **Delete All** from the context menu.

<figure>
  <img src="/images/guide/palette-and-symbols/ctxmenu-editing.png">
  <figcaption>The context menu in the editing mode with the deletion options.</figcaption>
</figure>

Both deletion methods remove any stitches in those colors from your pattern.

### Sorting Palette Items

You can automatically sort your working palette by the thread brand and number.
This is helpful for organizing colors logically, especially in patterns using threads from multiple brands.

1. Enter the editing mode.
2. Right-click the palette list.
3. Select **Sort By** -> **Brand & Number**.

<figure>
  <img src="/images/guide/palette-and-symbols/palette-sorting.png">
  <figcaption>The <strong>Sort By</strong> submenu in the editing mode.</figcaption>
</figure>

The palette is reordered alphanumerically: first by the thread brand, then by the thread number within each brand.

### Rearranging Palette Items

For a custom organization, you can manually reorder colors in the editing mode using drag and drop.

1. Enter editing mode (the palette items become draggable).
2. Click and hold on any color.
3. Drag and drop it at the desired position.

<figure>
  <img src="/images/guide/palette-and-symbols/drag-drop-reordering.png">
  <figcaption>Dragging a palette item to manually reorder the list.</figcaption>
</figure>

Other colors automatically shift to make room.
This is useful when you want to group related colors together.

## Managing Palette Files

Embroiderly comes with several manufacturer thread catalogs pre-installed, including DMC, Anchor, and Madeira.
You can also import your custom palette files.

### Switching Between Palettes

To switch to a different thread catalog:

1. Open the **Palette Catalog** panel.
2. Click the dropdown menu at the top of the panel.
3. Select a different palette from the list.

<figure>
  <img src="/images/guide/palette-and-symbols/palette-selector.png">
  <figcaption>The palette selector showing system and custom palettes.</figcaption>
</figure>

Palettes are organized into two groups:

- **System** palettes are pre-installed with Embroiderly.
- **Custom** palettes are ones you've imported yourself.

When you select a different palette, the color list updates to show all colors from that palette file.

### Importing Custom Palettes

You can import additional palette files to expand your available thread colors.

1. Open the **Palette Catalog** panel.
2. Click the menu button next to the palette selector.
3. Select **Import Palettes**.
4. Choose one or more palette files from your computer.

<figure>
  <img src="/images/guide/palette-and-symbols/palette-catalog-menu.png">
  <figcaption>The catalog menu with the <strong>Import Palettes</strong> option.</figcaption>
</figure>

Embroiderly supports these palette file formats:

- `.master` and `.user` (Pattern Maker).
- `.threads` (UrsaSoftware).
- `.rng` (Cross-Stitch Pro Platinum).
- `.embpal` (Embroiderly).

When import completes:

- successfully imported palettes appear in the "Custom" section,
- if any files failed to import, you'll see a dialog listing the failed files, and
- palettes with duplicate names are skipped to prevent conflicts.

> [!TIP]
> Imported palettes are saved as JSON files in the Embroiderly application data folder.
> They become available for all your patterns.

## Managing Stitch Symbols

Stitch symbols are special characters that help distinguish between similar colors in your pattern.
They're especially useful when printing patterns on paper.

### Opening the Symbols Panel

1. Enter editing mode.
2. Click the menu button in the header and select **Symbols**, or right-click and select it from the context menu.

<figure>
  <img src="/images/guide/palette-and-symbols/stitch-symbols.png">
  <figcaption>The <strong>Symbols</strong> panel showing all available font characters.</figcaption>
</figure>

The **Symbols** panel displays all available characters from the currently selected symbol font.
Characters that are already assigned to palette items show with a purple color and small triangular indicator in the top right corner.

The footer shows how many symbols are used out of the total available.

### Assigning Symbols

To assign a symbol to a palette item:

1. Select the color in your working palette.
2. Find the desired symbol in the **Symbols** panel.
3. **Double-click** the symbol character.

The symbol is immediately assigned to the selected color and appears in the palette list (if you have **Show stitch symbols** option enabled).

You can also use the right-click context menu:

1. Select the color in your working palette.
2. Right-click on a symbol in the **Symbols** panel.
3. Select **Set Symbol**.

### Unassigning Symbols

To remove a symbol from a palette item:

1. Right-click on the assigned symbol in the **Symbols** panel.
2. Select **Unset Symbol**.

<figure>
  <img src="/images/guide/palette-and-symbols/symbol-menu.png">
  <figcaption>The context menu for an assigned symbol showing the **Unset Symbol** option.</figcaption>
</figure>

The symbol is removed from the palette item, and it becomes available for use again.

## Managing Symbol Fonts

Just like palette catalogs, you can switch between different symbol fonts and import your custom.

### Switching Between Fonts

To change the symbol font:

1. Open the **Symbols** panel.
2. Click the dropdown menu at the top of the panel.
3. Select a different font from the list.

<figure>
  <img src="/images/guide/palette-and-symbols/font-selector.png">
  <figcaption>The font selector showing system and custom fonts.</figcaption>
</figure>

Symbol fonts are organized the same way as palettes:

- **System** fonts are pre-installed.
- **Custom** fonts are ones you've imported.

When you switch fonts, the symbol grid updates to show all available characters from that font.

> [!NOTE]
> Symbols you've already assigned to palette items won't change when you switch fonts.
> Each palette item remembers which font its symbol comes from.

### Importing Custom Fonts

To import new symbol fonts:

1. Open the **Symbols** panel.
2. Click the menu button next to the font selector.
3. Select **Import Fonts**.
4. Choose one or more TrueType (`.ttf`) or OpenType (`.otf`) font files.

The import process works similarly to palette import:

- you can select multiple font files,
- successfully imported fonts appear in the "Custom" section,
- duplicate font family names are skipped, and
- failed imports are reported in a dialog.

> [!TIP]
> For best results, use fonts with simple, clear characters.
> Decorative or script fonts may not work well as stitch symbols due to their complexity.

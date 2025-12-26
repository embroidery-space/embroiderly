---
description: Learn how to manage thread colors and stitch symbols in your cross-stitch patterns in Embroiderly.
head:
  - - meta
    - name: keywords
      content: embroidery palette, thread colors, color catalog, stitch symbols
---

# Palette & Symbols

The palette panel is your primary tool for managing colors and stitch symbols in your cross-stitch patterns.
It allows you to select threads from professional color catalogs, organize your working palette, and assign symbols to help differentiate between similar colors.

## Understanding Palette Terminology

Before diving into the features, let's clarify some important terms you'll encounter:

**Working Palette** refers to the collection of thread colors you're actively using in your current pattern.
Only colors in your working palette can be used to create stitches in the pattern.

**Palette Catalog** is a library of all available thread colors from manufacturers like DMC, Anchor, or Madeira.
It contains hundreds or thousands of colors that you can browse and add to your working palette as needed.

**Palette Items** are individual entries in your working palette.
Each item represents a specific thread color, including its brand, number, name, and optional stitch symbol.

**Colors vs. Threads**: In cross-stitch design software, these terms are often used interchangeably.
However, "thread" more accurately reflects the physical item, while "color" refers to the visual appearance.
Throughout this guide, we'll use both terms naturally.

## Palette Panel Overview

The palette panel appears on the left side of the pattern editor window.
It's organized into three main sections: the header, the palette list, and the footer.

<figure>
  <img src="/images/guide/palette-and-symbols/palette-panel-overview.png">
  <figcaption>The palette panel showing the working palette with several thread colors.</figcaption>
</figure>

The **header** contains tools for drawing and manipulating stitches on the canvas.

The **palette list** displays all thread colors currently in your working palette.
Each color is shown as a tile with the thread's digital color, optional stitch symbol, and text information based on your display settings.

The **footer** shows the total number of colors in your palette and provides a quick button to enter editing mode.

## Palette List and Display Settings

### Understanding Palette Items

Each item in the palette list displays several pieces of information:

- A colored background showing the thread's digital color
- An optional stitch symbol (a character from a symbol font)
- Text showing the thread's brand, number, and name
- An outline if the color is select

The exact information displayed depends on your current display settings.

<figure>
  <img src="/images/guide/palette-and-symbols/palette-item-details.png">
  <figcaption>A palette item showing all available information: symbol, brand, number, and name.</figcaption>
</figure>

Hovering over any palette item shows a tooltip with the complete thread information, regardless of your display settings.

### Configuring Display Settings

You can customize how palette items appear using the display settings.
The quickest way is to right-click the palette list and select **Display Options**.
The context menu stays open while you adjust settings, letting you see changes in real-time.

<figure>
  <img src="/images/guide/palette-and-symbols/display-settings-menu.png">
  <figcaption>The context menu showing display options.</figcaption>
</figure>

Alternatively, you can open the dedicated [Display Settings panel](#using-the-display-settings-panel) in editing mode.

The available display options include:

- **Columns Number.** Sets how many columns the palette list uses (1-8 columns).
  More columns let you see more colors at once, while fewer columns provide more space for text information.
- **Color Only.** Hides all text information and symbols, showing just the color swatches.
  This is useful when working with patterns that have many colors and you need to see them all quickly.
- **Show Stitch Symbols.** Toggles the visibility of symbol characters assigned to palette items.
  Symbols help you identify colors in printed patterns or when colors look similar.
- **Contrast Stitch Symbols.** Places symbols on a white background for better visibility against thread colors.
- **Show Brand**, **Show Number**, and **Show Name**. Control which text information appears for each thread.
  You can enable any combination of these options.
  For example, showing just the number is useful when you're familiar with a specific brand's color system.

All display settings are saved with your pattern, so each project can have its own preferred layout.

### Using the Display Settings Panel

If you prefer a dedicated panel view, you can access all display options in one place.
Enter [editing mode](#entering-editing-mode), then click the menu button in the header and select **Display Options**.

<figure>
  <img src="/images/guide/palette-and-symbols/display-settings-panel.png">
  <figcaption>The Display Settings panel with all customization options.</figcaption>
</figure>

The panel provides a more spacious interface with all options visible at once.
Changes apply immediately so you can see the results as you adjust settings.

Both the context menu and panel methods work equally well---choose whichever you find more comfortable.

## Selecting Colors

To use a color for stitching, click on any item in the palette list.
The selected color is indicated by a contrast outline.

Only one color can be selected at a time.
When you select a different color, the previous selection is automatically cleared.

To deselect a color without selecting another, click on the currently selected item again.
This clears the selection, and no color will be active.

> [!NOTE]
> You must have a color selected to create stitches on the canvas.
> If no color is selected, drawing tools won't create any stitches.

### Keyboard Navigation

You can also navigate and select colors using your keyboard:

- **Arrow Down** - Move to the next color
- **Arrow Up** - Move to the previous color
- **Home** - Jump to the first color in the palette
- **End** - Jump to the last color in the palette
- **Enter** - Select the currently highlighted color

> [!WARNING]
> In multi-column layouts, arrow keys navigate horizontally (left/right through columns) rather than vertically (up/down through rows).
> There's currently no way to navigate in all four directions naturally due to technical constraints.

## Editing Mode

Editing mode is a special state where you can modify your working palette.
While in editing mode, you can't draw on the canvas, but you can add or remove colors, sort your palette, assign symbols, and more.

### Entering Editing Mode

There are two ways to enter editing mode:

1. Click the edit icon (pencil) in the palette footer
2. Right-click the palette list and select **Edit**

When you enter editing mode, the palette panel's appearance changes:

- The palette panel gets a cyan border to indicate editing mode is active
- The header shows a "Save" button and a menu button
- The footer's edit icon changes to a checkmark
- The canvas drawing area is blocked with an overlay

<figure>
  <img src="/images/guide/palette-and-symbols/editing-mode.png">
  <figcaption>The palette panel in editing mode.</figcaption>
</figure>

### Exiting Editing Mode

When you're done editing your palette, exit editing mode by:

1. Clicking the "Save" button in the header
2. Clicking the checkmark icon in the footer
3. Right-clicking and selecting **Save**
4. Pressing `Escape`

All changes you made are automatically saved to your pattern.

> [!TIP]
> Don't worry about "saving" in editing mode---the name is just for clarity.
> All palette changes are applied immediately and included in your pattern's undo history.

## Managing Palette Items

### Adding Colors from the Catalog

To add new colors to your working palette, you can use the Palette Catalog.

1. Enter editing mode
2. Click the menu button in the header and select **Palette Catalog**, or right-click and select it from the context menu

<figure>
  <img src="/images/guide/palette-and-symbols/palette-catalog.png">
  <figcaption>The Palette Catalog showing available DMC thread colors.</figcaption>
</figure>

The Palette Catalog panel shows all colors available from the currently selected palette file.
By default, this is the DMC color catalog (the most popular embroidery thread brand).

Colors already in your working palette are shown with an outline.

To add a color to your working palette, simply **double-click** it in the catalog.
The color is immediately added to the bottom of your working palette.

To remove a color that's already in your working palette, **double-click** it again in the catalog.
The color is removed from your working palette.

> [!WARNING]
> Removing a color from your palette also removes all stitches in that color from your pattern.
> This action can be undone using the pattern's undo feature.

#### Searching for Colors

If you know the thread number or name you're looking for, use the search input at the top of the catalog.
Type a thread number (like "310") or color name (like "black") to filter the list.

<figure>
  <img src="/images/guide/palette-and-symbols/palette-catalog-search.png">
  <figcaption>Searching for DMC 310 in the palette catalog.</figcaption>
</figure>

The search matches exactly anywhere in the thread number or name, ignoring accents and diacritics.

### Removing Colors

Besides removing colors through the catalog, you can also remove them directly from your working palette while in editing mode.

**To remove the selected color:**

1. Select the color you want to remove
2. Right-click the palette list
3. Choose **Delete Selected** from the context menu

**To remove all colors at once:**

1. Right-click the palette list
2. Choose **Delete All** from the context menu

<figure>
  <img src="/images/guide/palette-and-symbols/ctxmenu-editing.png">
  <figcaption>The editing mode context menu with deletion options.</figcaption>
</figure>

Both deletion methods remove any stitches in those colors from your pattern.

### Sorting Palette Items

You can automatically sort your working palette by brand and thread number.
This is helpful for organizing colors logically, especially in patterns using threads from multiple brands.

1. Enter editing mode
2. Right-click the palette list
3. Select **Sort By** -> **Brand & Number**

<figure>
  <img src="/images/guide/palette-and-symbols/palette-sorting.png">
  <figcaption>The Sort By submenu in editing mode.</figcaption>
</figure>

The palette is reordered alphanumerically: first by brand name, then by thread number within each brand.
This operation can be undone like any other palette change.

### Rearranging Palette Items

For custom organization, you can manually reorder colors in editing mode using drag and drop.

1. Enter editing mode (the palette items become draggable)
2. Click and hold on any color
3. Drag it to the desired position
4. Release to drop it in the new location

<figure>
  <img src="/images/guide/palette-and-symbols/drag-drop-reordering.png">
  <figcaption>Dragging a palette item to manually reorder the list.</figcaption>
</figure>

Other colors automatically shift to make room.
This is useful when you want to group related colors together.

## Assigning Stitch Symbols

Stitch symbols are special characters that help distinguish between similar colors in your pattern.
They're especially useful when printing patterns on paper.

### Opening the Stitch Symbols Panel

1. Enter editing mode
2. Click the menu button in the header and select **Stitch Symbols**, or right-click and select it from the context menu

<figure>
  <img src="/images/guide/palette-and-symbols/stitch-symbols.png">
  <figcaption>The Stitch Symbols showing available symbol characters.</figcaption>
</figure>

The Stitch Symbols panel displays all available characters from the currently selected symbol font.
Characters that are already assigned to palette items show with a purple color and small triangular indicator in the corner.

The footer shows how many symbols are used out of the total available.

### Assigning Symbols to Colors

To assign a symbol to a palette item:

1. Select the color in your working palette
2. Find the desired symbol in the Stitch Symbols panel
3. **Double-click** the symbol character

The symbol is immediately assigned to the selected color and appears in the palette list (if you have "Show Stitch Symbols" enabled).

> [!NOTE]
> You must select a color in your working palette before assigning a symbol.
> If no color is selected, you'll see a warning message.

You can also use the right-click context menu:

1. Select your color in the working palette
2. Right-click on a symbol in the Stitch Symbols panel
3. Choose **Set Symbol**

### Unassigning Symbols

To remove a symbol from a palette item:

1. Right-click on the assigned symbol in the Stitch Symbols panel (marked with a triangle indicator)
2. Choose **Unset Symbol**

<figure>
  <img src="/images/guide/palette-and-symbols/symbol-menu.png">
  <figcaption>The context menu for an assigned symbol showing the Unset Symbol option.</figcaption>
</figure>

The symbol is removed from the palette item, and it becomes available for use again.

> [!WARNING]
> Each symbol can only be assigned to one color at a time.
> If you try to assign an already-used symbol to a different color, you'll see a warning message.

## Managing the Palette Catalog

Embroiderly comes with several professional thread catalogs pre-installed, including DMC, Anchor, Madeira, and more.
You can also import your own custom palette files.

### Switching Between Palettes

To switch to a different thread catalog:

1. Open the Palette Catalog panel
2. Click the dropdown menu at the top of the panel
3. Select a different palette from the list

<figure>
  <img src="/images/guide/palette-and-symbols/palette-selector.png">
  <figcaption>The palette selector showing system and custom palettes.</figcaption>
</figure>

Palettes are organized into two groups:

- **System** palettes are pre-installed with Embroiderly
- **Custom** palettes are ones you've imported yourself

When you select a different palette, the catalog list updates to show all colors from that palette file.

### Importing Custom Palettes

You can import additional palette files to expand your available thread colors.

1. Open the Palette Catalog panel
2. Click the menu button next to the palette selector
3. Select **Import Palettes**
4. Choose one or more palette files from your computer

<figure>
  <img src="/images/guide/palette-and-symbols/palette-catalog-menu.png">
  <figcaption>The catalog menu with the Import Palettes option.</figcaption>
</figure>

Embroiderly supports these palette file formats:

- `.master` and `.user` (Pattern Maker)
- `.threads` (UrsaSoftware)
- `.rng` (Cross-Stitch Pro Platinum)
- `.json` (Embroiderly)

After import completes:

- Successfully imported palettes appear in the "Custom" section
- If any files failed to import, you'll see a dialog listing the failed files
- Palettes with duplicate names are skipped to prevent conflicts

> [!TIP]
> Imported palettes are saved as JSON files in the Embroiderly application data folder.
> They're automatically available in all your patterns.

## Managing Symbol Fonts

Just like palette catalogs, you can switch between different symbol fonts and import your own.

### Switching Between Fonts

To change the symbol font:

1. Open the Stitch Symbols panel
2. Click the dropdown menu at the top of the panel
3. Select a different font from the list

<figure>
  <img src="/images/guide/palette-and-symbols/font-selector.png">
  <figcaption>The font selector showing system and custom fonts.</figcaption>
</figure>

Symbol fonts are organized the same way as palettes:

- **System** fonts are pre-installed
- **Custom** fonts are ones you've imported

When you switch fonts, the symbol grid updates to show all available characters from that font.

> [!NOTE]
> Symbols you've already assigned to palette items won't change when you switch fonts.
> Each palette item remembers which font its symbol comes from.

### Importing Custom Fonts

To import new symbol fonts:

1. Open the Stitch Symbols panel
2. Click the menu button next to the font selector
3. Select **Import Fonts**
4. Choose one or more TrueType (`.ttf`) or OpenType (`.otf`) font files

The import process works similarly to palette import:

- You can select multiple font files
- Successfully imported fonts appear in the "Custom" section
- Duplicate font family names are skipped
- Failed imports are reported in a dialog

> [!TIP]
> For best results, use fonts with simple, clear characters.
> Decorative or script fonts may not work well as stitch symbols due to their complexity.

## Regular vs. Editing Mode Context Menus

The palette panel's right-click context menu changes based on which mode you're in.

### Regular Mode Context Menu

In regular mode, the context menu provides access to entering editing mode and display options:

<figure>
  <img src="/images/guide/palette-and-symbols/ctxmenu-regular.png">
  <figcaption>The context menu in regular mode.</figcaption>
</figure>

This menu is designed for quick adjustments to how you view your palette without entering editing mode.

### Editing Mode Context Menu

In editing mode, the context menu expands to include palette management options:

<figure>
  <img src="/images/guide/palette-and-symbols/ctxmenu-editing.png">
  <figcaption>The context menu in editing mode.</figcaption>
</figure>

This menu provides quick access to all palette editing features without using the header buttons.

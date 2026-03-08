### Translations for the palette panel.

## Palette panel.

palette-panel-collapse = Collapse palette panel
palette-panel-expand = Expand palette panel

## Working palette.

palette-size = Palette: { $size ->
  [0] empty
  [one] { $size } color
  *[other] { $size } colors
}
palette-empty = The palette is empty

palette-edit = Edit Palette
palette-save = Save Palette

## Palette toolbar.

palette-toolbar-cursor = Cursor

## Palette display options.

palette-display-options = Display Settings

palette-columns-number = Number of columns
palette-color-only = Color only
palette-show-stitch-symbols = Show stitch symbols
palette-contrast-stitch-symbols = Contrasting stitch symbols
palette-show-brand = Show thread brands
palette-show-number = Show color numbers
palette-show-name = Show color names

## Working palette context menu.

palette-ctx-menu-sort-by = Sort By
palette-ctx-menu-sort-by-brand-and-number = Brand & Number
palette-ctx-menu-delete-selected = { $selected ->
  [0] Delete Selected
  *[other] Delete { $selected } Selected
}
palette-ctx-menu-delete-all = Delete All

## Palette catalog.

palette-catalog = Colors

palette-catalog-menu-import-palettes = Import Palettes

palette-catalog-search =
  .placeholder = Search...

palette-catalog-import-success = Palettes imported successfully
palette-catalog-import-failure = Failed to import palettes
palette-catalog-import-failed-files =
  .title = Failed Palette Files
  .description =
    Some palette files failed to import.
    It may be due to conflicts in palette names (they must be unique) or palette files corruption.

    { $failedFilesList }

palette-catalog-load-failure = Failed to load palette { $palette }

## Stitch symbols.

stitch-symbols = Symbols

stitch-symbols-usage = { $total ->
  [0] No symbols
  [one] { $total } symbol ({ $used } used)
  *[other] { $total } symbols ({ $used } used)
}
stitch-symbols-empty = No symbols available

stitch-symbols-menu-import-fonts = Import Fonts

stitch-symbols-ctx-menu-set-symbol = Set Symbol
stitch-symbols-ctx-menu-unset-symbol = Unset Symbol

stitch-symbols-no-palitem-selected = No palette item selected
stitch-symbols-already-assigned = This symbol is already assigned to another palette item

stitch-symbols-import-success = Symbol fonts imported successfully
stitch-symbols-import-failure = Failed to import symbol fonts
stitch-symbols-import-failed-files =
  .label = Failed Font Files
  .description =
    Some font files could not be imported.
    It may be due to conflicts in font family names (they must be unique), missing font family metadata, or font files corruption.

    { $failedFilesList }

stitch-symbols-load-failure = Failed to load font { $font }

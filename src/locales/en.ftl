-app-name = Embroiderly

## Common labels usually used in the menu items, buttons and its tooltip.

label-file = File
label-pattern = Pattern

label-open = Open
label-create = Create
label-save = Save
label-save-as = Save As
label-save-changes = Save Changes
label-close = Close
label-export = Export
label-cancel = Cancel

## Names of the stitches and other instruments.

label-stitch-full = Full Stitch
label-stitch-petite = Petite Stitch
label-stitch-half = Half Stitch
label-stitch-quarter = Quarter Stitch
label-stitch-back = Back Stitch
label-stitch-straight = Straight Stitch
label-stitch-french-knot = French Knot
label-stitch-bead = Bead

## Titles, labels and messages related to the welcome page.

title-welcome = { -app-name }

message-get-started =
  { $button-open } or { $button-create } to get started.
  .button-open-label = Open a pattern
  .button-create-label = create a new one

label-start = Start
label-start-open = Open Pattern
label-start-create = Create Pattern

label-customize = Customize
label-customize-settings = Settings
message-customize-settings = Customize { -app-name } according to your preferences.

label-learn-more = Learn More
label-learn-more-documentation = Documentation
message-learn-more-documentation = Learn how to use { -app-name } by reading our guide.

label-get-help = Get Help
label-get-help-telegram = Telegram Chat

message-credits = Developed with love in Ukraine

## Titles, labels and messages related to the palette panel.

label-palette-size = Palette: { $size ->
  [0] empty
  [one] { $size } color
  *[other] { $size } colors
}
message-palette-empty = The palette is empty

label-palette-edit = Edit Palette

label-palette-colors = Colors
label-palette-display-options = Display Settings
label-palette-delete-selected = { $selected ->
  [0] Delete Selected
  *[other] Delete { $selected } Selected
}
label-palette-select-all = Select All

label-display-options-columns-number = Columns Number
label-display-options-color-only = Color only
label-display-options-show-brand = Show thread brands
label-display-options-show-number = Show color numbers
label-display-options-show-name = Show color names

## Titles, labels and messages related to the canvas panel and its settings.

label-view-as-mix = View as a Mix of Solid and Stitches
label-view-as-solid = View as Solid
label-view-as-stitches = View as Stitches

label-show-symbols = Show Symbols
label-hide-symbols = Hide Symbols

## Titles, labels and messages related to the settings dialog.

title-settings = Settings

label-theme = Theme
label-theme-dark = Dark
label-theme-light = Light
label-theme-system = System

label-scale = Scale
label-scale-xx-small = Smallest
label-scale-x-small = Smaller
label-scale-small = Small
label-scale-medium = Medium
label-scale-large = Large
label-scale-x-large = Larger
label-scale-xx-large = Largest

label-language = Language

label-viewport = Viewport
message-viewport-hint = These settings require a restart.

label-viewport-antialias = Antialiasing

label-viewport-wheel-action = Mouse Wheel Action
label-viewport-wheel-action-zoom = Zoom
label-viewport-wheel-action-scroll = Scroll

label-other = Other
label-use-palitem-color-for-stitch-tools = Use palette item color for stitch tools

## Titles, labels and messages related to the pattern information dialog.

title-pattern-info = Pattern Information

label-pattern-title = Title
label-pattern-author = Author
label-pattern-copyright = Copyright
label-pattern-description = Description

## Titles, labels and messages related to the fabric properties dialog.

title-fabric-properties = Fabric Properties

label-size = Size
label-width = Width
label-height = Height

label-unit-stitches = stitches
label-unit-inches = inches
label-unit-mm = mm

label-count = Count
label-count-and-kind = Count & Kind

label-kind = Kind
label-kind-aida = Aida
label-kind-evenweave = Evenweave
label-kind-linen = Linen

message-selected-color = Selected color: { $color }

message-total-size = Size (WxH): { $width }x{ $height } stitches, { $widthInches }x{ $heightInches } inches ({ $widthMm }x{ $heightMm } mm)

## Titles, labels and messages related to the grid properties dialog.

title-grid-properties = Grid Properties

label-major-lines-interval = Major Lines Interval
label-major-lines = Major Lines
label-minor-lines = Minor Lines

label-color = Color
label-thickness = Thickness

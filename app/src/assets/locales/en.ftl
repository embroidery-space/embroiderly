## Terms.

-app-name = Embroiderly

## Application credits.

app-credits = Developed with love in Ukraine

## Application menu.

app-menu-open = Open application menu

app-menu-file = File
app-menu-file-open = Open
app-menu-file-open-demo = Open demo pattern
app-menu-file-create = Create
app-menu-file-save = Save
app-menu-file-save-as = Save As
app-menu-file-import = Import
app-menu-file-import-image = Image
app-menu-file-export = Export
app-menu-file-close = Close pattern
app-menu-file-quit = Quit { -app-name }

app-menu-pattern = Pattern

app-menu-help = Help
app-menu-help-about = About
app-menu-help-guide = Guide
app-menu-help-license = License

app-menu-manage = Manage

app-fullscreen-enter = Enter fullscreen
app-fullscreen-exit = Exit fullscreen

## Window controls.

window-minimize = Minimize
window-maximize = Maximize
window-restore = Restore
window-close = Close

## Editing history.

history-undo = Undo
history-redo = Redo

## Modal actions.

modal-create = Create
modal-copy = Copy
modal-save = Save

modal-cancel = Cancel
modal-close = Close

## Confirmation dialog buttons.

confirm-ok = OK
confirm-yes = Yes
confirm-no = No

## Generic labels.

choose-file = Choose File

files-group-system = System
files-group-custom = Custom

## Generic error label.

error = Error

## Demo patterns.

demo-pattern-piggies = Piggies
demo-pattern-festive-capy = Festive Capy
demo-pattern-pumpkin-cupcake = Pumpkin Cupcake
demo-pattern-whisper-of-the-board = The Whisper of the Board

## System info.

system-info =
  .title = System Information
  .description =
    { -app-name } version: { $appVersion } ({ $gitBranch }@{ $gitCommit }, { DATETIME($gitDate, dateStyle: "long") })
    Operating System: { $os } { $osVersion }
    Browser: { $browser } { $browserVersion }

## Startup notifications.

startup-file-association-failure = Failed to open the target pattern file: { $filePath }.
startup-template-failure = Failed to load a custom pattern template: { $filePath }.

## Unsaved changes dialog.

unsaved-changes =
  .title = Unsaved Changes
  .description =
    The "{ $pattern }" pattern has unsaved changes.
    Do you want to save it before closing?

## Pattern save/export notifications.

pattern-open-unsupported-type = This pattern type is not supported.
pattern-save-unsupported-type =
  This pattern type is not supported for saving.
  Please, save the pattern using the "{ app-menu-file-save-as }" or "{ app-menu-file-export }" options.

pattern-save-success = Pattern Saved
pattern-save-failure = Pattern Save Failed

pattern-export-success = Pattern Exported
pattern-export-failure = Pattern Export Failed

## Welcome panel.

welcome = Welcome to { -app-name }!

welcome-get-started =
  { $button-open } or { $button-create } to get started.
  .button-open-label = Open a pattern
  .button-create-label = create a new one
welcome-get-started-dnd = Or drag and drop pattern files here.

welcome-section-starting = Start
welcome-open-pattern = Open Pattern
welcome-create-pattern = Create Pattern

welcome-section-customization = Customize
welcome-customization-settings-title = Settings
welcome-customization-settings-description = Customize { -app-name } according to your preferences.

welcome-section-info = Learn More
welcome-info-docs-title = Documentation
welcome-info-docs-description = Learn how to use { -app-name } by reading our guide.

welcome-section-help = Get Help
welcome-help-tg = Telegram Chat
welcome-help-fb = Facebook Group

## Application settings.

settings = Settings

settings-interface = Interface

settings-theme = Theme
settings-theme-dark = Dark
settings-theme-light = Light
settings-theme-system = System

settings-scale = Scale
settings-scale-xx-small = Smallest
settings-scale-x-small = Smaller
settings-scale-small = Small
settings-scale-medium = Medium
settings-scale-large = Large
settings-scale-x-large = Larger
settings-scale-xx-large = Largest

settings-language = Language

settings-startup = Startup

settings-startup-action = Open on Startup
settings-startup-action-nothing = Nothing
settings-startup-action-new-pattern = New Pattern
settings-startup-action-custom-template = Custom Template

settings-startup-template-path = Template File

settings-workarea = Working Area

settings-workarea-rendering-antialias =
  .label = Antialiasing
  .description = This setting requires a restart.

settings-workarea-viewport-wheel-action = Mouse Wheel Action
settings-workarea-viewport-wheel-action-zoom = Zoom
settings-workarea-viewport-wheel-action-scroll = Scroll

settings-workarea-pattern-layer-layout = Layer Layout
settings-workarea-pattern-layer-layout-stitch-type = By Stitch Type
settings-workarea-pattern-layer-layout-layer-order = By Layer Order

settings-updater = Updater

settings-updater-auto-check =
  .label = Automatically check for updates
  .description = If enabled, { -app-name } will automatically check for updates on startup. Requires a restart.

settings-telemetry = Telemetry

settings-telemetry-diagnostics =
  .label = Allow collecting diagnostics reports
  .description = Help improve the stability of { -app-name } by automatically sending diagnostic reports when errors occur or the application is crashed.

settings-telemetry-metrics =
  .label = Allow collecting metrics
  .description = Help improve { -app-name } by sending anonymized application usage data.

settings-other = Other

settings-autosave-interval =
  .label = Autosave Interval
  .description = If set to 0, autosave is disabled.

settings-show-open-demo-pattern-option = Show "Open demo pattern" option in the "File" menu

settings-use-palitem-color-for-stitch-tools = Use palette item color for stitch tools

## Telemetry prompt.

telemetry-prompt = Help Improve { -app-name }
telemetry-prompt-notice = * You can change your selection at any time in Settings.
telemetry-prompt-reject = No, thanks
telemetry-prompt-accept = Enable

## Application updater.

updater-check-for-updates = Check for Updates
updater-update-now = Update Now

updater-update-available-desktop =
  .title = Update Available
  .description =
    A new version of { -app-name } is available!
    Your current version: { $currentVersion }. The latest version: { $version } dated { DATETIME($date, dateStyle: "long") }.
    Do you want to download and install it now?
updater-update-available-pwa =
  .title = Update Available
  .description = A new version of { -app-name } is ready to install! Reload now to apply the update?

updater-no-updates-available =
  .title = No Update Available
  .description = There are currently no updates available.

updater-unsaved-changes =
  .title = Unsaved Changes
  .description = The update cannot be installed until you save and close all open patterns.

## Canvas panel.

canvas-panel-collapse = Collapse canvas panel
canvas-panel-expand = Expand canvas panel

## Canvas view options.

canvas-view-mix = Mixed view
canvas-view-solid = Solid view
canvas-view-stitches = Stitches view

canvas-symbols = Symbols
canvas-grid = Grid
canvas-rulers = Rulers

## Canvas zoom controls.

canvas-zoom-in = Zoom In
canvas-zoom-out = Zoom Out

canvas-zoom-fit = Fit
canvas-zoom-fit-width = Fit Width
canvas-zoom-fit-height = Fit Height

## Canvas layers.

canvas-layers = Layers
canvas-layers-reference-image = Reference Image
canvas-layers-full-stitches = Full Stitches
canvas-layers-petite-stitches = Petite Stitches
canvas-layers-half-stitches = Half Stitches
canvas-layers-quarter-stitches = Quarter Stitches
canvas-layers-back-stitches = Back Stitches
canvas-layers-straight-stitches = Straight Stitches
canvas-layers-french-knots = French Knots
canvas-layers-beads = Beads
canvas-layers-special-stitches = Special Stitches

canvas-layers-placeholder = Layer { $index }

canvas-layers-add = Add Layer
canvas-layers-remove = Remove Layer "{ $name }"
canvas-layers-remove-confirm =
  .title = Remove Layer
  .description = Are you sure you want to remove the layer "{ $name }"? This action can be undone.

## Canvas context menu.

canvas-ctx-menu-set-image = Set Reference Image
canvas-ctx-menu-remove-image = Remove Reference Image

## Canvas notifications.

canvas-symbol-fonts-load-failure =
  .title = Failed to load symbol fonts
  .description =
    Failed to load symbol fonts: { $fonts }.
    Some symbols may display incorrectly.

## Pattern information.

pattern-info = Pattern Information

pattern-info-title = Title
pattern-info-author = Author
pattern-info-copyright = Copyright
pattern-info-description = Description

## Fabric properties.

pattern-creation = New Pattern
fabric-properties = Fabric Properties

fabric-size = Size
fabric-width = Width
fabric-height = Height

# Use non-breaking space (\u00A0) to prevent text from jumping when changing fabric size.
fabric-total-size = Size{"\u00A0"}(WxH): { $width }x{ $height }{"\u00A0"}stitches, { $widthInches }x{ $heightInches }{"\u00A0"}inches ({ $widthMm }x{ $heightMm }{"\u00A0"}mm)

unit-stitches = stitches
unit-inches = inches
unit-mm = mm

fabric-count = Count
fabric-count-and-kind = Count & Kind

fabric-kind = Kind
fabric-kind-aida = Aida
fabric-kind-evenweave = Evenweave
fabric-kind-linen = Linen

fabric-color = Color
fabric-selected-color = Selected color: { $color }

## Grid properties.

grid-properties = Grid Properties

grid-major-lines-interval =
  .label = Major Lines Interval
  .hint = In stitches

grid-major-lines = Major Lines
grid-minor-lines = Minor Lines

grid-color = Color
grid-thickness = Thickness
grid-pixel-line =
  .label = Pixel Line
  .description = If enabled, the grid line will always be drawn as a 1px line regardless of the specified thickness or the canvas zoom.

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
palette-panel-menu = Palette menu

## Palette toolbar.

palette-toolbar-eraser = Eraser
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
palette-catalog-menu = Palette options

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
  .title = Failed Font Files
  .description =
    Some font files could not be imported.
    It may be due to conflicts in font family names (they must be unique), missing font family metadata, or font files corruption.

    { $failedFilesList }

stitch-symbols-load-failure = Failed to load font { $font }

## Stitch names.

stitch-full = Full Stitch

stitch-petite = Petite Stitch
stitch-petite-tl = Top Left Petite
stitch-petite-tr = Top Right Petite
stitch-petite-br = Bottom Right Petite
stitch-petite-bl = Bottom Left Petite

stitch-half = Half Stitch
stitch-half-forward = Forward Half
stitch-half-backward = Backward Half

stitch-quarter = Quarter Stitch
stitch-quarter-tl = Top Left Quarter
stitch-quarter-tr = Top Right Quarter
stitch-quarter-br = Bottom Right Quarter
stitch-quarter-bl = Bottom Left Quarter

stitch-back = Back Stitch
stitch-straight = Straight Stitch

stitch-french-knot = French Knot
stitch-bead = Bead

## Image importing.

image-import = Image Import

image-import-import-image = Import Image

image-import-palette = Palette
image-import-palette-size = Max. Palette Size

image-import-quant = Colors Reduction
image-import-quant-sampling = Sampling Precision

image-import-dither = Dithering
image-import-dither-enable = Apply dithering
image-import-dither-error = Dithering Strength

image-import-pattern-properties = Palette size: { $paletteSize }. Total stitches: { $totalStitches }.

## PDF export.

pdf-export = PDF Export

pdf-export-variant-monochrome = Export black and white document
pdf-export-variant-color = Export color document

pdf-export-save-settings = Save Settings
pdf-export-export-document = Export Document

## Publish settings.

publish-settings = Publish Settings

publish-settings-print-options = Print Options
publish-settings-print-center-frames = Center frames
publish-settings-print-enumerate-frames = Enumerate frames

publish-settings-frame-options = Frame Options
publish-settings-frame-definition =
  A frame is a part of the pattern.
  Large patterns can be split into several frames. Each frame is placed on a separate page.

publish-settings-frame-width = Frame Width
publish-settings-frame-height = Frame Height

publish-settings-frame-cell-size =
  .label = Cell Size
  .description = The size of each cell/stitch in the grid, in pixels.

publish-settings-frame-preserved-overlap =
  .label = Preserved Overlap
  .description = The size of overlap between frames, in stitches.

publish-settings-frame-show-grid-line-numbers = Show grid line numbers
publish-settings-frame-show-centering-marks = Show centering marks

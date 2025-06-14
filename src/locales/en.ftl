-app-name = Embroiderly

## Common labels usually used in the menu items, buttons and their tooltips.

label-file = File
label-pattern = Pattern

label-help = Help
label-license = License
label-about = About

label-manage = Manage

label-open = Open
label-create = Create
label-save = Save
label-save-as = Save As
label-save-changes = Save Changes
label-close = Close
label-export = Export
label-cancel = Cancel
label-copy = Copy

## Names of the stitches and other instruments.

label-stitch-full = Full Stitch
label-stitch-petite = Petite Stitch
label-stitch-half = Half Stitch
label-stitch-quarter = Quarter Stitch
label-stitch-back = Back Stitch
label-stitch-straight = Straight Stitch
label-stitch-french-knot = French Knot
label-stitch-bead = Bead

## Titles, labels and messages related to the updater.

label-updater = Updater

label-check-for-updates = Check for Updates

label-auto-check-for-updates = Automatically check for updates
message-auto-check-for-updates-hint = If enabled, { -app-name } will automatically check for updates on startup. Requires a restart.

title-update-available = Update Available
message-update-available =
  A new version of { -app-name } is available!
  Your current version: { $currentVersion }. The latest version: { $version } dated { DATETIME($date, dateStyle: "long") }.
  Do you want to download and install it now?
  Please save your patterns before proceeding, because the application will be restarted.

title-no-updates-available = No Update Available
message-no-updates-available = There are currently no updates available.

## Titles, labels and messages related to the welcome page.

title-welcome = { -app-name }

message-get-started =
  { $button-open } or { $button-create } to get started.
  .button-open-label = Open a pattern
  .button-create-label = create a new one
message-get-started-drag-and-drop = Or drag and drop pattern files here.

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

label-autosave-interval = Autosave Interval
message-autosave-interval-hint = If set to 0, autosave is disabled. Requires a restart.

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
label-unit-min = min

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

## Titles, labels and messages related to notification and error messages.
message-pattern-saved = Pattern Saved
message-pattern-exported = Pattern Exported

title-unsaved-changes = Unsaved Changes
message-unsaved-changes =
  The pattern has unsaved changes.
  Do want to save it before closing?
message-unsaved-patterns =
  You have patterns with unsaved changes:
  { $patterns }.
  Do you want to save them before closing the application?

title-system-info = System Information
message-system-info =
  Operating System: { $osType } { $osVersion } { $osArch }
  { -app-name } version: { $appVersion }
  WebView version: { $webviewVersion }

title-error = Error

message-error-unsupported-pattern-type = This pattern type is not supported.
message-error-unsupported-pattern-type-for-saving =
  This pattern type is not supported for saving.
  Please, save the pattern using the "{ label-save-as }" or "{ label-export }" options.

message-error-backup-file-exists =
  A backup file for this pattern exists.
  Do you want to restore the progress from it?

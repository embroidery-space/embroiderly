### Global app translations.

-app-name = Embroiderly

app-credits = Developed with love in Ukraine

## Application menu.

app-menu-file = File
app-menu-file-open = Open
app-menu-file-create = Create
app-menu-file-save = Save
app-menu-file-save-as = Save As
app-menu-file-import = Import
app-menu-file-import-image = Image
app-menu-file-export = Export
app-menu-file-close = Close pattern
app-menu-file-quit = Quit { -app-name }

app-menu-pattern = Pattern

app-menu-tools = Tools
app-menu-manage = Manage

app-menu-help = Help
app-menu-help-about = About
app-menu-help-guide = Guide
app-menu-help-license = License

## System info.

system-info =
  .title = System Information
  .description =
    { -app-name } version: { $appVersion }
    Operating System: { $os } { $osVersion }
    Browser: { $browser } { $browserVersion }

## Editor notifications and errors.

error = Error

pattern-open-unsupported-type = This pattern type is not supported.
puttern-save-unsupported-type =
  This pattern type is not supported for saving.
  Please, save the pattern using the "{ app-menu-file-save-as }" or "{ app-menu-file-export }" options.

pattern-backup-file-exists =
  A backup file for this pattern exists.
  Do you want to restore the progress from it?

pattern-save-success = Pattern Saved
pattern-save-failure = Pattern Save Failed

pattern-export-success = Pattern Exported
pattern-export-failure = Pattern Export Failed

startup-file-association-failure = Failed to open the target pattern file: { $filePath }.
startup-template-failure = Failed to load a custom pattern template: { $filePath }.

unsaved-changes =
  .title = Unsaved Changes
  .description =
    The "{ $pattern }" pattern has unsaved changes.
    Do you want to save it before closing?

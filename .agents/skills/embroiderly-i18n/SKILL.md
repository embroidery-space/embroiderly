---
name: embroiderly-i18n
description: Use this skill when adding, editing, or reorganizing translations in the main app.
---

Embroiderly uses [Fluent](https://projectfluent.org/fluent/guide/) for localization.

**The only file you may edit is `app/src/assets/locales/en.ftl`.**
Other locale files (e.g. `uk.ftl`) are maintained by human translators.

Before adding a new key, read the whole `en.ftl` to check for an existing one that covers the same meaning.

## Fluent Syntax

### Messages

```fluent
key = Hello, world!
```

### Terms

Terms start with `-` and can only be _referenced_, but never retrieved directly.
Use for brand names and shared vocabulary.

```fluent
-app-name = Embroiderly

quit = Quit { -app-name } # good — references the term
quit = Quit Embroiderly   # wrong — hardcodes the name
```

### Variables

Runtime values from the app are referenced with `$`.

```fluent
greeting = Welcome, { $user }!
file-removed = Removed "{ $name }".
```

### Message references

Reference another message to keep UI strings consistent.
Note the missing `$` sign.

```fluent
menu-save = Save
help-save = Click { menu-save } to save the file.
```

### Attributes

Group related strings for one UI element under `.attribute-name`.
Fetch them via `$ta` in code.
A message may have only attributes and no primary value (standard for dialogs, notifications, settings rows).

```fluent
# Good — attributes group the same dialog together
dialog-confirm =
  .title = Remove Layer
  .description = Are you sure? This action can be undone.

# Wrong — separate top-level keys for the same element
dialog-confirm-title = Remove Layer
dialog-confirm-description = Are you sure? This action can be undone.
```

### Selectors (pluralization)

`*` marks the required default variant.
Numeric selectors match CLDR plural categories (`zero`, `one`, `two`, `few`, `many`, `other`).

```fluent
palette-size = Palette: { $size ->
  [0] empty
  [one] { $size } color
  *[other] { $size } colors
}
```

### Multiline values

Indent every continuation line by at least one space.
Common indentation is stripped automatically.

```fluent
update-description =
  A new version is available.
  Current: { $current }. Latest: { $latest }.
```

### Comments

```fluent
### File-level comment.

## Section group header.

# Per-message comment explaining variables or context.
key = Value with { $variable }
```

### Built-in functions

Fluent automatically formats numbers and dates according to the active locale.
The built-in functions let you override that formatting — they map directly to the JS `Intl` API.

`NUMBER($var, …options)` -> [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options) options:

```fluent
emails = You have { $count } unread emails. # auto-formatted
price = Price: { NUMBER($value, maximumFractionDigits: 2) } # explicit decimal places
count = { NUMBER($total, useGrouping: false) } stitches # no thousands separator
```

`DATETIME($var, …options)` -> [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options) options:

```fluent
last-checked = Last checked: { DATETIME($date, dateStyle: "long") }.
release-date = Released { DATETIME($date, month: "long", day: "numeric", year: "numeric") }.
```

Use these functions when the default locale formatting is not specific enough, or when the formatted value is also used as a selector (the same options must be applied to both):

```fluent
emails = { NUMBER($count, useGrouping: false) ->
  [0] No unread emails.
  [one] One unread email.
  *[other] { NUMBER($count, useGrouping: false) } unread emails.
}
```

## Project Conventions

1. All messages in a logical group share a prefix that matches the `##` section header.
   Extend existing groups rather than coining a new prefix.
2. Reuse generic keys (e.g., `modal-*`, `confirm-*`, `history-*`, `error`, `choose-file`).

## Using Translations in Code

### In Vue templates

```vue
<!-- message value -->
{{ $t("key") }}
:label="$t('key')"

<!-- with variables -->
:label="$t('canvas-layers-remove', { name: layer.name })"

<!-- rich text with embedded Vue components -->
<i18n tag="p" path="welcome-get-started">
  <template #button-open="{ buttonOpenLabel }">
    <Button :label="buttonOpenLabel" @click="open" />
  </template>
</i18n>
```

Attribute slots in `<i18n>` are kebab-cased attribute names from the `.ftl` message:

```fluent
welcome-get-started =
  { $button-open } to get started.
  .button-open-label = Open a pattern
```

### In script (`useI18n`)

```ts
import { useI18n } from "~/composables/";

const { fluent, currentLocale, setLocale } = useI18n();

// Message value
fluent.$t("key");
fluent.$t("key", { count: 5 });

// All attributes as a plain object — spread directly into dialog/toast/panel props
fluent.$ta("dialog-confirm"); // { title: "Remove Layer", description: "Are you sure? ..." }

const accepted = await confirm.open(fluent.$ta("canvas-layers-remove-confirm", { name })).result;
toast.add({ type: "foreground", ...fluent.$ta("updater-unsaved-changes") });
```

`$ta` is the standard way to pass `{ title, description }` to dialogs, toasts, and confirm modals.

# Wasm Module

This crate bridges the core editing logic — written in pure Rust — to the JavaScript frontend.
It exposes two classes: `EditorWrapper` and `FileManager`.

## `EditorWrapper`

This struct holds an `Editor` singleton and a JS callback function.
Every mutating method applies an action through the editor and then invokes the callback with a Borsh-encoded `EditorEvent`.
The frontendi decodes the event and dispatches it onto the typed event bus, which drives reactive state updates.

### Event discriminant ordering

The event callback encodes the event type as a leading discriminant byte.
The value of that byte is determined by the variant order in the `EditorEvent` enum in the `embroiderly-editor` crate.
The JavaScript dispatcher maps its handler functions by array index using the same order.

**These two must stay in sync.**
Inserting, removing, or reordering variants in either place without updating the other breaks the event pipeline silently — the wrong handler fires with no error.

## `FileManager`

This struct provides access to the application's resources — thread palettes and symbols fonts — which come in two tiers.

**System resources** ship with the application and are fetched over HTTP from the `app/src/public/` directory.

**User resources** are custom thread palettes, symbols fonts, and pattern templates uploaded by the user.
These are stored persistently in the browser's Origin Private File System (OPFS).

Both tiers use the same web platform APIs, so this struct works without changes in the browser and inside Tauri's WebView.

## Public/private method split

All `wasm_bindgen`-exposed methods are thin wrappers that immediately delegate to private `*_impl()` counterparts.
The private methods carry `#[tracing::instrument]` for observability.
This split is necessary because `wasm_bindgen` and `tracing` crates generate conflicting function signatures when applied to the same method.

## Observability

Logging is configured via custom `embroiderly-tracing` crate.
In the browser or webview, spans and log events are routed to the console.
Inside the Tauri shell, all logs are also passed to the host process which writes them to a file on disk.

# Embroiderly Web

This crates provides all the Web API bindings used in Embroiderly.

Each module is gated by a separate features. Available modules (features):

- `idb` - Enables IndexedDB access. Powered by the [`indexed-db`](https://crates.io/crates/indexed-db) crate under the hood.
- `net` - Enables network access.
- `opfs` - Enables Origin Private File System access. We maintain a custom implementation for this module using raw `web_sys::*` APIs directly.
- `timers` - Enables `setTimeout`/`setInterval` access. Powered by the [`gloo-timers`](https://crates.io/crates/gloo-timers) crate under the hood (callbacks only).

Additionaly, this crate wraps all errors from each module into their own [error variants](./src/error.ts) (e.g., `Error::Idb(anyhow::Error)` for IndexedDB).

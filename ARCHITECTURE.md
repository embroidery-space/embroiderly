# Embroiderly Architecture

Embroiderly is a cross-stitch pattern design application built as a **web-first** product.
The same web application runs directly in a browser, can be installed as a standalone PWA, or is bundled into a native desktop installer.
All three delivery modes are functionally identical — there is no platform-specific business logic.

**Target platforms:** all major browsers (Chrome, Firefox, Safari, and others, which are based on the same web engines); Windows 10/11 via WebView2; Linux via WebKitGTK.

```text
embroiderly/
├── app/                        # Main application
│   ├── src/                    # Vue.js frontend
│   ├── src-wasm/               # Wasm module
│   └── src-tauri/              # Tauri desktop shell
├── crates/
│   ├── embroiderly-editor/     # Core editing engine
│   ├── embroiderly-pattern/    # Domain data structures
│   ├── embroiderly-parsers/    # Pattern file format parsers
│   ├── embroiderly-tracing/    # Shared logging/tracing configuration
│   └── xsp-parsers/            # Low-level embroidery file format parsers
├── packages/
│   ├── pdf-export/             # PDF export (Wasm + Web Worker)
│   └── ui/                     # Custom UI Kit
└── docs/                       # End-user documentation
```

The main application is split into three layers:

- a Vue.js + TypeScript frontend that renders the UI and manages state;
- a Wasm module that exposes the core Rust editing logic to JavaScript (see [`app/src-wasm/README.md`](app/src-wasm/README.md) for details);
- and a minimal Tauri desktop shell responsible only for window management, file association handling, disk-based log collection, and packaging.

## Serialization

The project uses two serialization formats for different purposes.

[Borsh](https://borsh.io) is used for all data that crosses the Rust–JavaScript boundary at runtime.
It was chosen for its performance, compact binary output, and deterministic encoding.
TypeScript counterparts of all Rust domain types implement matching Borsh schemas on the frontend side.

[JSON](https://json.org) is used where human-readability and long-term stability matter more than runtime efficiency or output size.
System resources such as palettes and fabric color definitions are stored as JSON in the `app/public/` directory.
Our custom `.embproj` pattern file format is also JSON-based, making it inspectable and forward-compatible as the application evolves.

# PDF Export

This package provides a functionality for compiling cross-stitch patterns to PDF documents entirely in the browser — no server or native binary required.

The core module is implemented in Rust and shipped as a Wasm module.
This package provides a single `exportPatternAsPdf` function which

It has two layers: a Rust core (`src-wasm/`) compiled to Wasm, and a thin TypeScript facade (`src/`) that wraps it in a one-shot Web Worker.
The worker is spawned per call and terminated after execution, so memory usage stays predictable across multiple exports.

The document processing pipeline is served by [Typst](https://typst.app) under the hood.

The [Libertinus Serif](https://fonts.google.com/specimen/Libertinus+Serif) font is embedded directly in the Wasm module and registered with the engine automatically.
Only the symbol fonts referenced by the pattern palette must be provided by the caller, as they cannot be bundled ahead of time .

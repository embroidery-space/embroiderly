# Image Import

This package provides browser-native image import for cross-stitch patterns.

It has two layers: a Rust core (`src-wasm/`) compiled to Wasm, and a TypeScript facade (`src/`) running in a long-lived Web Worker.

The worker is created once per image-import session and reused across preview updates.
It is explicitly terminated when the user finalizes or cancels.

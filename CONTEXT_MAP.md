# Context Map

## Contexts

- [Pattern Model](./crates/embroiderly-pattern/CONTEXT.md) --- the internal data model of a cross-stitch pattern: project, fabric, palette, layers, stitches, and their display/export settings.

## Relationships

- **Parsers -> Pattern Model** (`crates/embroiderly-parsers/`): reads third-party pattern files and produces pattern and pattern project objects --- the domain types are its output.
- **Editor -> Pattern Model** (`crates/embroiderly-editor/`): the core editing engine mutates patterns through the domain's stitch, palette, and layer operations.
- **App Wasm Module -> Pattern Model** (`app/src-wasm/`): exposes the domain types across the Rust–JS boundary, encoding them with both Borsh (runtime) and JSON (storage).
- **PDF Export / Image Import -> Pattern Model** (`packages/pdf-export/`, `packages/image-import/`): consume patterns to render an exportable PDF or to produce stitches from an imported image.

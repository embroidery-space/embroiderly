# Embroiderly Architecture

Embroiderly is a desktop application built with [Tauri](https://tauri.app) and [Vue.js](https://vuejs.org).
In general, the application is composed of a web frontend and Rust backend.

> In case of Tauri applications, the _backend_ is local.

The application frontend is a thin client though it contains a complex UI logic.
Its main purpose is to provide a UI, render patterns, and handle the user input.
The only source of truth is the Rust backend.

The application backend consists of the core module, which defines core entities and executes business logic, and several [sidecars](https://tauri.app/develop/sidecar).

The sidecars are used to extract heavy and specific tasks into dedicated programs.
At the moment of writing this document, there are two sidecars: one for generating PDFs for patterns and another for converting images into patterns.
**Important:** Sidecars are an implementation detail so they should not be directly exposed to the frontend.

```mmd
flowchart LR
  fe[Frontend] --> be[Backend]
  be --> pdf[PDF Export Sidecar]
  be --> image[Image Import Sidecar]
```

## [Frontend](./app/src/)

The frontend follows a _modular monolith_ architecture.

In our case, each module roughly represents a single page with all of its features.
Currently, there is only one module - _Pattern Editor_.

**Directory Structure:**

```txt
src/
├── app/               # Application configuration and assets.
├── modules/           # Core modules.
│   └── <module-name>/ # Each module has a structure similar to the `shared/` folder and contains a root page component.
├── plugins/           # Custom Vue.js plugins.
│   └── <plugin-name>/ # Each plugin has a structure similar to the `shared/` folder and exports public items.
├── shared/            # Shared components, utils, etc.
│   ├── api/
│   ├── components/
│   ├── composables/
│   ├── constants/
│   ├── directives/
│   ├── lib/
│   ├── services/
│   ├── stores/
│   └── utils/
├── App.vue
└── main.ts
```

## [Backend](./app/src-tauri/src/)

On the backend, there is no clearly established architecture.

**Directory Structure:**

```txt
src/
├── commands/ # Public API.
├── core/     # Core modules.
├── services/ # External services.
├── sidecars/ # Sidecar wrappers.
├── startup/  # Tasks executed on the app launch.
├── utils/    # Shared utils.
├── error.rs  # Application errors.
├── lib.rs
├── main.rs
└── state.ts  # Application state.
```

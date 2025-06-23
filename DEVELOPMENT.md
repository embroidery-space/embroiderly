# Development Process

This document describes the process of how we are working on Embroiderly.

You can follow it to start working on your ideas, improvements, fixes, etc.

## Project Structure

```
src/ # Everything related to the frontend.
crates/
├── embroiderly/ # The main application.
├── embroiderly-export/ # An additional application for exporting cross-stitch patterns into various formats.
├── embroiderly-parsers/ # A library that contains parsers of cross-stitch pattern which return the pattern object in our internal representation.
├── embroiderly-pattern/ # A library that contains our internal representation of cross-stitch patterns.
└── xsp-parsers/ # A library that contains cross-stitch parsers of different formats from varoius applications.
```

## Prerequisites

To get started working on Embroiderly, you will first need to install a few dependencies:

1. [System Dependencies](https://tauri.app/start/prerequisites/#system-dependencies).

2. [Rust](https://rust-lang.org/tools/install) and [Node.js](https://nodejs.org/en/download).

   We are using the latest stable Rust version and the latest LTS Node.js version.
   Also, we are using the nightly Rust edition for running its tooling with unstable features.

3. NPM and Cargo dependecnies.

   Run `npm install` in the porject root.
   Cargo dependencies will be installed during the first run of the project.

### VS Code Setup

We are using Visual Studio Code as our development environment.
Here is a recommended setup:

1. Install and enable extensions listed in `.vscode/extensions.json`.
2. Configure the VS Code using the following `.vscode/settings.json` file:

   ```json
   {
     // Enable auto-formatting on file save.
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll": "explicit"
     },
     // Use Prettier as the default formatter.
     "editor.defaultFormatter": "esbenp.prettier-vscode",

     // Enable and configure file nesting to hide related files.
     "explorer.fileNesting.enabled": true,
     "explorer.fileNesting.expand": false,
     "explorer.fileNesting.patterns": {
       // Hide all documentation files and a license under the `README.md`.
       "README.md": "*.md, LICENSE",
       // Hide all unit test files under their source files.
       "*.vue": "${capture}.test.ts",
       "*.ts": "${capture}.test.ts",
       "*.rs": "${capture}.test.rs",
       // Hide all TypeScript configs under the main one.
       "tsconfig.json": "tsconfig.*.json, *.d.ts, *.tsbuildinfo",
       // Hide lock files under the main manifests.
       "package.json": "package-lock.json",
       "Cargo.toml": "Cargo.lock, rustfmt.toml",
       // Hide ESLint and Prettier configurations under `.editorconfig`.
       ".editorconfig": "eslint.config.js, .prettierrc.json",
       // Hide app image under index.html.
       "index.html": "app-icon.png"
     },

     "files.associations": {
       "*.css": "tailwindcss",
       "tauri.conf.json": "jsonc"
     },
     "editor.quickSuggestions": { "strings": "on" },
     "tailwindCSS.classAttributes": ["class", "ui"],
     "tailwindCSS.experimental.classRegex": [["ui:\\s*{([^)]*)\\s*}", "(?:'|\"|`)([^']*)(?:'|\"|`)"]],

     // Optionally, use enhanced syntax highlighter for TOML files.
     // Make sure you have installed a corresponding extension.
     // "[toml]": {
     //   "editor.defaultFormatter": "tamasfe.even-better-toml"
     // },

     // Optionally, use enhanced syntax highlighter for XML files to view OXS patterns.
     // Make sure you have installed a corresponding extension.
     // "[xml]": {
     //   "editor.defaultFormatter": "redhat.vscode-xml"
     // },

     // Use RustAnalyzer as the default formatter for Rust source files.
     "[rust]": {
       "editor.defaultFormatter": "rust-lang.rust-analyzer"
     },
     // Force Rustfmt to use the nightly Rust version.
     "rust-analyzer.rustfmt.extraArgs": ["+nightly"],
     // Store RustAnalyzer's artefacts in a separate directory in `target/` to not block debug builds.
     "rust-analyzer.cargo.targetDir": true,

     // Automatically specify file extensions when importing JS modules.
     "javascript.preferences.importModuleSpecifierEnding": "js",
     "typescript.preferences.importModuleSpecifierEnding": "js"
   }
   ```

## Running and Building Application

Refer to the [reference](https://tauri.app/reference/cli) to see available commands.

## A Few Words About Testing

All unit tests are extracted into separate files titled `[filename].test.{ts,rs}`.
All end-to-end tests are located under the `tests/` folder.

## Organization Notes

We are following [conventional commits](https://conventionalcommits.org/en/v1.0.0), [semantic branch names](https://gist.github.com/seunggabi/87f8c722d35cd07deb3f649d45a31082) and [semantic versioning](https://semver.org).
However, in PRs, you can title commits as you want; in any case, they will be squashed.

## Before Submitting a PR

Please make sure your code is well-formatted, linted and properly tested:

- Check the frontend code:

  ```sh
  npm run fmt
  npm run lint
  npm run test
  ```

- Check the backend code:

  ```sh
  cd src-tauri/
  cargo fmt --check
  cargo clippy -- -D warnings
  cargo test
  ```

You can configure local Git hooks so these checks run on every commit/push.

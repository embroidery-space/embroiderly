# Development Process

This document describes the process of how we are working on Embroiderly.

You can follow it to start working on your ideas, improvements, fixes, etc.

## Project Structure

This project uses a **pnpm workspace** structure:

```
app/ # Main application (Vue frontend + Tauri backend)
├── src/ # Frontend source code.
└── src-tauri/ # Backend source code.

crates/ # Shared Rust libraries and Tauri plugins.
├── embroiderly-parsers/ # Cross-stitch pattern file parsers.
├── embroiderly-pattern/ # Internal pattern representation.
├── embroiderly-publish/ # Pattern export functionality.
├── tauri-plugin-log/ # Custom Tauri logging plugin.
├── tauri-plugin-sentry/ # Custom Tauri plugin for Sentry integration.
├── tauri-plugin-posthog/ # Custom Tauri plugin for PostHog integration.
└── xsp-parsers/ # Parsers of external cross-stitch pattern formats.

scripts/ # Some utility scripts for development.
```

## Prerequisites

To get started working on Embroiderly, you will first need to install a few dependencies:

1. [System Dependencies](https://tauri.app/start/prerequisites/#system-dependencies).

2. [Rust](https://rust-lang.org/tools/install) and [Node.js](https://nodejs.org/en/download).

   We are using the latest stable Rust version and the latest LTS Node.js version.
   Also, we are using the nightly Rust edition for running its tooling with unstable features.

3. **pnpm** and Cargo dependencies.

   Install pnpm using corepack (see [official documentation](https://pnpm.io/installation#using-corepack)):

   ```sh
   corepack enable pnpm
   ```

   Then install project dependencies:

   ```sh
   pnpm install
   ```

   Cargo dependencies will be installed during the first run of the project.

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
  pnpm fmt
  pnpm lint
  pnpm test
  ```

- Check the backend code:

  ```sh
  cargo +nightly fmt --check
  cargo clippy --locked -- -D warnings
  cargo nextest run --locked --no-fail-fast -F embroiderly/test
  ```

You can configure local Git hooks so these checks run on every commit/push.

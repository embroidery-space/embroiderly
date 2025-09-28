# Development Process

This document describes the process of how we are working on Embroiderly.

You can follow it to start working on your ideas, improvements, and fixes.

## Project Structure

This project uses a **pnpm workspace** structure:

```
app/                      # Main application (Vue frontend + Tauri backend)
├── src/                  # Frontend source code.
└── src-tauri/            # Backend source code.

crates/                   # Shared Rust libraries and Tauri plugins.
├── embroiderly-parsers/  # Cross-stitch pattern file parsers.
├── embroiderly-pattern/  # Internal pattern representation.
├── embroiderly-publish/  # Pattern export functionality.
├── tauri-plugin-log/     # Custom Tauri logging plugin.
├── tauri-plugin-sentry/  # Custom Tauri plugin for Sentry integration.
├── tauri-plugin-posthog/ # Custom Tauri plugin for PostHog integration.
└── xsp-parsers/          # Parsers of external cross-stitch pattern formats.
```

## Prerequisites

Before starting, make sure you have everything needed to work on Embroiderly.

1. Install [system dependencies](https://tauri.app/start/prerequisites/#system-dependencies).

1. Install stable and nightly (only the `fmt` component) [Rust](https://rust-lang.org/tools/install).

1. Install Rust tools: [`cargo-nextest`](https://nexte.st)

1. Install [Node.js v24](https://nodejs.org/en/download)

1. Install **pnpm** using Corepack (see the [official documentation](https://pnpm.io/installation#using-corepack)):

   ```sh
   corepack enable pnpm
   ```

Once you are done, run the application via `pnpm tauri dev` and build it via `pnpm tauri build`.

## Common commands

**Tauri:**

> Refer to the [Tauri CLI reference](https://tauri.app/reference/cli) for all commands and their options.

- `pnpm tauri dev` - Run the application in development mode.
- `pnpm tauri build` - Build the application and bundle into the installer.

**Frontend:**

- `pnpm build` - Build the frontend and check types.
- `pnpm fmt` - Check formatting.
- `pnpm fmt:fix` - Fix formatting.
- `pnpm lint` - Check linting.
- `pnpm lint:fix` - Fix linting.
- `pnpm test` - Run all tests.
- `pnpm --filter @embroiderly/app test:unit` - Run unit tests.
- `pnpm --filter @embroiderly/app test:e2e` - Run end-to-end tests (see [instructions](#integration-testing) below).

**Backend:**

- `cargo check` - Check types.
- `cargo +nightly fmt --check` - Check formatting.
- `cargo clippy -- -D warnings` - Check linting.
- `cargo nextest run --locked --no-fail-fast -F embroiderly/test` - Run all tests.

## Tests Organization

Unit-tests are extracted into separate files near the source file in the form of `<source-file>.test.{ts,rs}`.

Integration tests are store separately in the `tests/` directory:

- `app/tests/` - Frontend integration tests.
- `app/src-tauri/tests/` - Backend integration tests.

## Integration Testing

We use [WebdriverIO](https://webdriver.io) for integration testing.

To run integration tests, you must install additional system dependencies and Rust tools.

### On Linux

Tauri uses `WebKitWebDriver` on Linux platforms.

Some distributions bundle it with the regular WebKit package.
Check if this binary exists already by running `which WebKitWebDriver`.

Other platforms may have a separate package for them, such as `webkit2gtk-driver` on Debian-based distributions.

### On Windows

Tauri uses Microsoft Edge Driver on Windows.

Install [`msedgedriver-tool`](https://github.com/chippers/msedgedriver-tool):

```sh
cargo install --git https://github.com/chippers/msedgedriver-tool
```

This tool will be used in [WebdriverIO setup](./app/wdio.config.ts) to automatically install the driver.

Last, install [`tauri-driver`](https://github.com/tauri-apps/tauri/tree/dev/crates/tauri-driver):

```sh
cargo install tauri-driver
```

Then you can run end-to-end tests via `pnpm --filter @embroiderly/app test:e2e`.

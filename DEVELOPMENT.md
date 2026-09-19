# Development Process

This document describes the process of how we are working on Embroiderly.
Follow it to start working on your ideas, improvements, and fixes.

> See [ARCHITECTURE.md](./ARCHITECTURE.md) to learn more about the project structure.

## Prerequisites

Before starting, make sure you have everything needed to work on Embroiderly.

1. Install [system dependencies](https://tauri.app/start/prerequisites/#system-dependencies).
1. Install stable and nightly (only the `fmt` component) [Rust](https://rust-lang.org/tools/install).
1. Install Rust tools: [`cargo-nextest`](https://nexte.st), [`just`](https://just.systems).
1. Install [Node.js v24](https://nodejs.org/en/download).
1. Install [pnpm](https://pnpm.io/installation).
1. Go to `app/` and create the `.env` file.
   Copy the contents of the [`.env.example`](app/.env.example) file and specify your own values.

Once you are done, you can run the application via `pnpm app:dev` or build it via `pnpm app:build`.

## Available Commands

We use [`just`](https://just.systems) to manage development commands.
If you don't want to use it, check [`Justfile`](./Justfile) to see all available commands.

### Code Checks

- `just all` - Run all code checks.
  - `just check` - Check types.
  - `just fmt` - Check code format.
  - `just lint` - Check linting.
  - `just test` - Run all tests.

The code checking commands above have `-fe` and `-be` variants to target the frontend or backend, respectively.
For example, run `just all-fe` to run all _frontend_ checks.

Additionally, there is a `-fix` variant for `fmt` and `lint` recipes.
For example, run `just fmt-fix` to fix code formatting issues (or `just fmt-fe-fix` to fix only _frontend_).

## Tests Organization

Unit and component tests are extracted into separate files near the source file in the form of `<source-file>.test.{ts,rs}`.
Integration tests are stored separately in the `app/tests/` directory:

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

Then you can run end-to-end tests via `pnpm -F @embroiderly/app test:e2e`.

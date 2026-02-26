# AI Assistant Instructions

Embroiderly is a desktop application for designing cross-stitch patterns.

The main target platforms are Windows and Linux.
MacOS is currenly not supported.

Embroiderly is built using Rust and Tauri on the backend, and Vue.js on the frontend.
The main application code is stored in the `app/` directory.

## Available Commands

This project uses `just` for managing development commands.

- `just all` - Run all code checks.
  - `just check` - Check types.
  - `just fmt` - Check code format.
  - `just lint` - Check linting.
  - `just test` - Run all tests.

These commands have `-fe` and `-be` variants to target the frontend or backend, respectively.
For example, run `just all-fe` to run all _frontend_ checks.

Additionally, there is a `-fix` variant for `fmt` and `lint` recipes.
For example, run `just fmt-fix` to fix code formatting issues (or `just fmt-fe-fix` to fix only _frontend_).

When you completed writing code, always run auto fixes for formatting and linting.
Then, manually fix any remaining issues.

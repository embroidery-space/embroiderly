# CI/CD Overview

## Custom Actions

We maintain a set of custom reusable composite actions that standardise toolchain setup across all workflows.

- `setup-node`: Installs pnpm and Node.js (version from `package.json`) with cache, then runs `pnpm install` (skipping Husky).
- `setup-rust`: Installs system components (required by Tauri), sets up stable Rust (pinned version) and optionally nightly with extra targets, configures cache, and installs extra Cargo tools via `taiki-e/install-action`.

## Workflows

- `ci.frontend.yml`: Validates TypeScript, Vue, or package config files on PRs to `main`/`dev`.
- `ci.backend.yml`: Validates Rust source on PRs to `main`/`dev`.
- `ci.integration.yml`: Runs the WebdriverIO end-to-end suite against the full Tauri desktop app on Ubuntu and Windows. Triggered on PRs to `main` or manually.
- `deploy.yml`: Builds and deploys the web app (PWA) to Cloudflare Workers on every push to `main`/`dev` and on PRs to those branches, excluding dependency update branches.
  On push to `main`, injects PostHog and Sentry API keys, uploads source maps to Sentry, and publishes a new production Cloudflare Worker version.
  On all other pushes/PRs, builds without telemetry and runs publishes a _preview_ Cloudflare Worker version.
- `release.yml`: Builds and signs the Tauri desktop app (Windows installer, Linux deb/rep) via `tauri-apps/tauri-action`.
  On push to `main`, creates a signed GitHub Release tagged `vX.Y.Z`; on PRs, only validates the build without publishing.
- `codeql.yml`: Runs CodeQL static analysis (security-extended queries) for GitHub Actions, JavaScript/TypeScript, and Rust.
  Dynamically skips languages with no changed files (weekly runs always scan all three).
- `combine-prs.yml`: Manual workflow that merges all open Dependabot PRs into a single `dependency-updates` branch/PR via `github/combine-prs`.
- `cache-cleanup.yml`: Deletes all GitHub Actions caches for a PR branch when the PR is closed.

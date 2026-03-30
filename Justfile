set dotenv-load := true
set dotenv-path := "app/src-tauri/.env"

default:
    just --list

[group("development")]
dev:
    pnpm tauri dev

[group("development")]
build:
    pnpm tauri build
    git restore app/src-tauri/binaries/ app/src-tauri/help/

[group("development")]
dbuild:
    pnpm tauri build --debug
    git restore app/src-tauri/binaries/ app/src-tauri/help/

[group("cleaning")]
clean: clean-fe clean-be

[group("cleaning")]
clean-fe:
    rm -rf node_modules/
    rm -rf app/node_modules/ app/dist/

    rm -rf docs/node_modules/ docs/dist/ docs/cache/

    rm -rf packages/ui/node_modules/ packages/ui/dist/

[group("cleaning")]
clean-be:
    cargo clean
    cd app/src-tauri/ && rm -rf logs/ gen/

all: check fmt lint test

all-fe: check-fe fmt-fe lint-fe test-fe

all-be: check-be fmt-be lint-be test-be

[group("check")]
check: check-fe check-be

[group("check")]
check-fe:
    pnpm check-types

[group("check")]
check-be:
    cargo check

[group("formatting")]
fmt: fmt-fe fmt-be

[group("formatting")]
fmt-fix: fmt-fe-fix fmt-be-fix

[group("formatting")]
fmt-fe:
    pnpm fmt

[group("formatting")]
fmt-fe-fix:
    pnpm fmt:fix

[group("formatting")]
fmt-be:
    cargo +nightly fmt --check

[group("formatting")]
fmt-be-fix:
    cargo +nightly fmt

[group("linting")]
lint: lint-fe lint-be

[group("linting")]
lint-fix: lint-fe-fix lint-be-fix

[group("linting")]
lint-fe:
    pnpm lint

[group("linting")]
lint-fe-fix:
    pnpm lint:fix

[group("linting")]
lint-be:
    cargo clippy --locked -- -D warnings

[group("linting")]
lint-be-fix:
    cargo clippy --locked --fix --allow-dirty -- -D warnings

[group("testing")]
test: test-fe test-be

[group("testing")]
test-fe:
    pnpm test

[group("testing")]
test-be:
    cargo nextest run --locked --no-fail-fast -F embroiderly/test

[group("testing")]
test-e2e:
    pnpm --filter @embroiderly/app test:e2e
